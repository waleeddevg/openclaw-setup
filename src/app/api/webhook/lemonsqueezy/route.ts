import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map Lemon Squeezy variant IDs → plan names
const VARIANT_TO_PLAN: Record<string, string> = {
  "1674455": "basic",
  "1674595": "pro",
  "1674601": "business",
};

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hash = createHmac("sha256", secret).update(rawBody).digest("hex");
  // Use timingSafeEqual to prevent timing attacks (brute-force via response time)
  const hashBuffer = Buffer.from(hash, "hex");
  const sigBuffer = Buffer.from(signature, "hex");
  if (hashBuffer.length !== sigBuffer.length) return false;
  return timingSafeEqual(hashBuffer, sigBuffer);
}

async function syncSubscription(eventName: string, data: any, customData: any) {
  const attrs = data.attributes;
  const lsSubscriptionId = String(data.id);
  const lsCustomerId = String(attrs.customer_id);
  const variantId = String(attrs.variant_id);
  const plan = VARIANT_TO_PLAN[variantId] || "basic";

  // Resolve email: prefer custom_data, fallback to user_email from LS
  const email = customData?.email || attrs.user_email;

  if (!email) {
    console.error(`[LS Webhook] Could not resolve email for subscription ${lsSubscriptionId}`);
    return;
  }

  const status = ["active", "on_trial"].includes(attrs.status) ? "active" : "inactive";
  const renewsAt = attrs.renews_at || attrs.ends_at || null;

  console.log(`[LS Webhook] Syncing subscription for ${email}: plan=${plan}, status=${status}, event=${eventName}`);

  const { error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        email,
        plan,
        status,
        ls_subscription_id: lsSubscriptionId,
        ls_customer_id: lsCustomerId,
        current_period_end: renewsAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

  if (error) {
    console.error(`[LS Webhook] Failed to upsert subscription for ${email}:`, error);
  } else {
    console.log(`[LS Webhook] ✅ Subscription synced for ${email}`);
  }
}

async function cancelSubscription(data: any) {
  const attrs = data.attributes;
  const email = attrs.user_email;

  if (!email) {
    console.error("[LS Webhook] Cannot cancel subscription: missing email");
    return;
  }

  console.log(`[LS Webhook] Cancelling subscription for ${email}`);

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      plan: "free",
      updated_at: new Date().toISOString(),
    })
    .eq("email", email);

  if (error) {
    console.error(`[LS Webhook] Failed to cancel subscription for ${email}:`, error);
  } else {
    console.log(`[LS Webhook] ✅ Subscription cancelled for ${email}`);
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") || "";
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[LS Webhook] Missing LEMONSQUEEZY_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  // Verify signature
  if (!verifySignature(rawBody, signature, webhookSecret)) {
    console.warn("[LS Webhook] Invalid signature — possible spoofed request");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventName: string = payload.meta?.event_name;
  const customData = payload.meta?.custom_data;
  const data = payload.data;

  console.log(`[LS Webhook] Event received: ${eventName}`);

  switch (eventName) {
    case "subscription_created":
    case "subscription_updated":
    case "subscription_resumed":
    case "subscription_unpaused":
      await syncSubscription(eventName, data, customData);
      break;

    case "subscription_cancelled":
    case "subscription_expired":
    case "subscription_paused":
      await cancelSubscription(data);
      break;

    default:
      console.log(`[LS Webhook] Unhandled event: ${eventName}`);
  }

  return NextResponse.json({ received: true });
}
