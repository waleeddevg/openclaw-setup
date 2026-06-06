import { SSHService } from '@/lib/ssh-service';
import { decrypt } from '@/lib/crypto';
import { createClient } from "@supabase/supabase-js"
import { promises as fs } from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function deployOrder(orderId: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // 1. Fetch Order Details
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    throw new Error('Order not found');
  }

  const ssh = new SSHService();
  const logs: string[] = order.deployment_logs || [];

  const updateStatus = async (status: string, message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    logs.push(logEntry);
    
    await supabase
      .from('orders')
      .update({ 
        status, 
        deployment_logs: logs 
      })
      .eq('id', order.id);
  };

  try {
    await updateStatus('in_progress', 'Starting automated deployment process...');
    await updateStatus('in_progress', 'Connecting to VPS via SSH...');

    // Decrypt credentials
    const password = order.vps_password ? decrypt(order.vps_password) : undefined;
    const apiKey = decrypt(order.openai_api_key);

    await ssh.connect(order.vps_ip, order.vps_username, password);
    await updateStatus('in_progress', 'Connected successfully!');

    // Read script content (async — does not block event loop)
    const scriptPath = path.join(process.cwd(), 'src/lib/scripts/setup-openclaw.sh');
    let scriptContent = await fs.readFile(scriptPath, 'utf8');

    await updateStatus('in_progress', 'Initializing system update and dependencies installation...');
    
    let logBuffer = [...logs];
    let lastUpdate = Date.now();

    // FIX: Pass user-controlled values as env vars — never interpolate into shell strings
    const provider = order.ai_provider || 'openai';
    const result = await ssh.executeWithEnv(
      `bash << 'EOF'
${scriptContent}
EOF`,
      {
        CLAWSETUP_API_KEY: apiKey,
        CLAWSETUP_VPS_IP: order.vps_ip,
        CLAWSETUP_PROVIDER: provider,
      },
      async (stdout) => {
        const lines = stdout.split('\n').filter(l => l.trim().length > 0);
        const timestamp = new Date().toISOString();
        lines.forEach(line => {
          // Cap logs at 500 entries to prevent unbounded DB writes
          if (logBuffer.length < 500) logBuffer.push(`[${timestamp}] ${line}`);
        });

        // Update DB if 2 seconds passed since last update
        if (Date.now() - lastUpdate > 2000) {
          lastUpdate = Date.now();
          await supabase
            .from('orders')
            .update({ deployment_logs: logBuffer })
            .eq('id', order.id);
        }
      }
    );

    if (result.code !== 0) {
      throw new Error(`Deployment script failed: ${result.stderr}`);
    }

    // Final log sync
    await supabase
      .from('orders')
      .update({ 
        status: 'completed',
        deployment_logs: logBuffer,
        ai_url: `http://${order.vps_ip}:3000`
      })
      .eq('id', order.id);

  } catch (error) {
    console.error('Deployment Failed:', error);
    await updateStatus('failed', `Deployment Error: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await ssh.dispose();
  }
}
