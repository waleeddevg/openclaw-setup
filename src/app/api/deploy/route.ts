import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth';
import { SSHService } from '@/lib/ssh-service';
import { decrypt } from '@/lib/crypto';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Use service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch Order Details
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'completed' || order.status === 'in_progress') {
      return NextResponse.json({ error: 'Deployment already in progress or completed' }, { status: 400 });
    }

    // Start Deployment in Background
    // We don't 'await' the whole process so the API returns quickly
    deployAsync(order, supabase);

    return NextResponse.json({ message: 'Deployment started' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function deployAsync(order: any, supabase: any) {
  const ssh = new SSHService();
  const logs: string[] = [];

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
    await updateStatus('in_progress', 'Connecting to VPS...');

    // Decrypt credentials
    const password = order.vps_password ? decrypt(order.vps_password) : undefined;
    const apiKey = decrypt(order.openai_api_key);

    await ssh.connect(order.vps_ip, order.vps_username || 'root', password);
    await updateStatus('in_progress', 'Connected! Preparing setup script...');

    // Read script content
    const scriptPath = path.join(process.cwd(), 'src/lib/scripts/setup-openclaw.sh');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

    // Execute with environment variables (safe — no shell interpolation of user data)
    await updateStatus('in_progress', 'Running setup script (this may take a few minutes)...');
    
    const provider = order.ai_provider || 'openai';
    let lastUpdate = Date.now();
    const result = await ssh.execute(
      `bash -s -- "${apiKey}" "${order.vps_ip}" "${provider}" << 'EOF'
${scriptContent}
EOF`,
      (stdout) => {
        const lines = stdout.split('\n').filter(l => l.trim().length > 0);
        const timestamp = new Date().toISOString();
        lines.forEach(line => {
          logs.push(`[${timestamp}] ${line}`);
        });

        // Update DB if 2 seconds passed since last update
        if (Date.now() - lastUpdate > 2000) {
          lastUpdate = Date.now();
          supabase
            .from('orders')
            .update({ deployment_logs: logs })
            .eq('id', order.id)
            .then(({ error }) => {
              if (error) console.error('Throttled log update error:', error);
            });
        }
      }
    );

    if (result.code !== 0) {
      throw new Error(`Script failed with code ${result.code}: ${result.stderr}`);
    }

    await updateStatus('completed', 'Deployment successful! Your AI is now live.');
    
    // Update final URL
    await supabase
      .from('orders')
      .update({ 
        ai_url: `http://${order.vps_ip}:3000`
      })
      .eq('id', order.id);

  } catch (error) {
    console.error('Deployment Failed:', error);
    await updateStatus('failed', `Error: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await ssh.dispose();
  }
}
