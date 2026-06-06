import { NextRequest, NextResponse, after } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/auth';
import { SSHService } from '@/lib/ssh-service';
import { decrypt } from '@/lib/crypto';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
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

    // Mark as queued immediately so the UI updates right away
    await supabase
      .from('orders')
      .update({ status: 'in_progress', deployment_logs: ['[QUEUED] Deployment scheduled, connecting shortly...'] })
      .eq('id', orderId);

    // Use after() to run deployment AFTER the response is sent.
    // Critical on Vercel: unawaited Promises are killed when the serverless
    // function exits. after() keeps the execution context alive until done.
    after(() => deployAsync(order, supabase, 0));

    return NextResponse.json({ message: 'Deployment queued' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 20_000; // 20 seconds between retries

async function deployAsync(order: any, supabase: any, attempt: number) {
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
    if (attempt > 0) {
      await updateStatus('in_progress', `Auto-retry attempt ${attempt} of ${MAX_RETRIES}...`);
    }
    await updateStatus('in_progress', 'Connecting to VPS...');

    // Decrypt credentials
    const password = order.vps_password ? decrypt(order.vps_password) : undefined;
    const apiKey = decrypt(order.openai_api_key);

    await ssh.connect(order.vps_ip, order.vps_username || 'root', password);
    await updateStatus('in_progress', 'Connected! Preparing setup script...');

    // Read script content (async — does not block event loop)
    const scriptPath = path.join(process.cwd(), 'src/lib/scripts/setup-openclaw.sh');
    const scriptContent = await fs.readFile(scriptPath, 'utf8');

    await updateStatus('in_progress', 'Running setup script (this may take a few minutes)...');

    const provider = order.ai_provider || 'openai';
    let lastUpdate = Date.now();

    // FIX: Pass user-controlled values as env vars — never interpolate into shell strings
    const result = await ssh.executeWithEnv(
      `bash << 'EOF'
${scriptContent}
EOF`,
      {
        CLAWSETUP_API_KEY: apiKey,
        CLAWSETUP_VPS_IP: order.vps_ip,
        CLAWSETUP_PROVIDER: provider,
      },
      (stdout) => {
        const lines = stdout.split('\n').filter(l => l.trim().length > 0);
        const timestamp = new Date().toISOString();
        lines.forEach(line => {
          // Cap logs at 500 entries to prevent unbounded DB growth
          if (logs.length < 500) logs.push(`[${timestamp}] ${line}`);
        });

        if (Date.now() - lastUpdate > 2000) {
          lastUpdate = Date.now();
          supabase
            .from('orders')
            .update({ deployment_logs: logs })
            .eq('id', order.id)
            .then(({ error }: { error: any }) => {
              if (error) console.error('Throttled log update error:', error);
            });
        }
      }
    );

    if (result.code !== 0) {
      throw new Error(`Script failed with exit code ${result.code}: ${result.stderr?.slice(0, 200)}`);
    }

    await updateStatus('completed', '✅ Deployment successful! Your AI is now live.');
    
    // Update final URL
    await supabase
      .from('orders')
      .update({ 
        ai_url: `http://${order.vps_ip}:3000`
      })
      .eq('id', order.id);

  } catch (error) {
    console.error(`[Deploy] Attempt ${attempt + 1} failed for order ${order.id}:`, error);
    const safeMsg = error instanceof Error ? error.message : 'Unknown error';

    if (attempt < MAX_RETRIES) {
      // Auto-retry after delay
      await updateStatus(
        'in_progress',
        `⚠️ Attempt ${attempt + 1} failed: ${safeMsg.slice(0, 100)}. Retrying in ${RETRY_DELAY_MS / 1000}s...`
      );
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      await ssh.dispose();
      return deployAsync(order, supabase, attempt + 1);
    }

    // All retries exhausted
    await updateStatus(
      'failed',
      `❌ Deployment failed after ${attempt + 1} attempt(s): ${safeMsg.slice(0, 120)}`
    );
  } finally {
    await ssh.dispose();
  }
}
