import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

// Initialize Supabase Client (Service Role for admin bypass)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Verify Gumroad webhook signature.
 * Gumroad signs payloads with HMAC-SHA256 using your webhook secret.
 * Uses timingSafeEqual to prevent timing attacks.
 */
function verifyGumroadSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!signature) return false;
  const hash = createHmac("sha256", secret).update(rawBody).digest("hex");
  const hashBuffer = Buffer.from(hash, "hex");
  const sigBuffer = Buffer.from(signature, "hex");
  if (hashBuffer.length !== sigBuffer.length) return false;
  return timingSafeEqual(hashBuffer, sigBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-gumroad-signature") || "";
    const webhookSecret = process.env.GUMROAD_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[Gumroad Webhook] Missing GUMROAD_WEBHOOK_SECRET env var");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (!verifyGumroadSignature(rawBody, signature, webhookSecret)) {
      console.warn("[Gumroad Webhook] Invalid signature — possible spoofed request");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Gumroad sends data as form-urlencoded
    const formData = new URLSearchParams(rawBody);
    
    // Extract Gumroad payment details
    const email = formData.get("email") as string;
    const price = formData.get("price") as string;
    const customUserId = formData.get("custom_user_id") as string;
    const orderNumber = formData.get("order_number") as string;
    
    console.log(`[Gumroad Webhook] Order ${orderNumber} for ${email}`);

    if (!customUserId) {
      console.error("[Gumroad Webhook] Missing custom_user_id");
      return NextResponse.json({ error: "Missing custom_user_id" }, { status: 400 });
    }

    const { error: dbError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'completed', 
        payment_id: orderNumber,
        paid_amount: price 
      })
      .eq('user_id', customUserId)
      .eq('status', 'pending');

    if (dbError) {
      console.error("[Gumroad Webhook] Database update error:", dbError);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    console.log(`[Gumroad Webhook] ✅ Successfully processed payment for user ${customUserId}`);
    
    // Gumroad expects 200 OK
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error: any) {
    console.error("[Gumroad Webhook] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
