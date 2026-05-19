import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { deployOrder } from "@/lib/deployment";

const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function handleSubscriptionUpdate(subscriptionId: string, customData: any, status: string, customerId: string, currentPeriodEnd: string) {
  console.log(`Processing Lemon Squeezy subscription sync for ID: ${subscriptionId}`);
  
  const email = customData?.email;
  const plan = customData?.plan || "basic";
  
  // In Lemon Squeezy, 'active' and 'on_trial' are good statuses. We map them to 'active'.
  const mappedStatus = ['active', 'on_trial'].includes(status) ? "active" : "inactive";

  if (email) {
    const { error } = await supabase
      .from("subscriptions")
      .upsert({
        email,
        plan,
        status: mappedStatus,
        stripe_subscription_id: subscriptionId, // re-using the column name for simplicity
        stripe_customer_id: customerId, // re-using the column name
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "email"
      });

    if (error) {
      console.error(`Failed to upsert subscription in Supabase for ${email}:`, error);
    } else {
      console.log(`Synced subscription to Supabase for ${email}: plan=${plan}, status=${mappedStatus}`);
    }
  } else {
    console.error(`Could not resolve custom email for subscription: ${subscriptionId}`);
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get("x-signature") || "";

  // Verify Signature
  try {
    const hmac = crypto.createHmac("sha256", webhookSecret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signature = Buffer.from(signatureHeader, "utf8");

    if (!crypto.timingSafeEqual(digest, signature)) {
      throw new Error("Invalid signature.");
    }
  } catch (err: any) {
    console.error("Lemon Squeezy Webhook Verification Failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.meta.event_name;
  const obj = payload.data.attributes;

  console.log(`Lemon Squeezy webhook event received: ${eventName}`);

  try {
    switch (eventName) {
      case "subscription_created":
      case "subscription_updated": {
        const subscriptionId = payload.data.id;
        const customerId = obj.customer_id.toString();
        const customData = payload.meta.custom_data;
        const status = obj.status;
        const currentPeriodEnd = obj.renews_at;

        await handleSubscriptionUpdate(subscriptionId, customData, status, customerId, currentPeriodEnd);
        
        // If it's a new subscription creation, we should also update an order and deploy it.
        // We'll find the pending order for this email and plan, and mark it in_progress to trigger deployment.
        if (eventName === "subscription_created" && customData?.email) {
            const { data: orders } = await supabase
              .from("orders")
              .select("id")
              .eq("email", customData.email)
              .eq("status", "pending")
              .order("created_at", { ascending: false })
              .limit(1);

            if (orders && orders.length > 0) {
              const orderId = orders[0].id;
              console.log(`Payment successful for order: ${orderId}`);

              await supabase
                .from("orders")
                .update({ 
                  payment_status: "paid",
                  status: "in_progress", 
                  amount_paid: obj.total / 100 
                })
                .eq("id", orderId);

              // Trigger automated deployment
              deployOrder(orderId).catch((err) => {
                console.error(`Post-payment deployment trigger failed for ${orderId}:`, err);
              });
            }
        }

        break;
      }
      
      case "subscription_cancelled":
      case "subscription_expired": {
        const customData = payload.meta.custom_data;
        const email = customData?.email;
        
        if (email) {
          const { error } = await supabase
            .from("subscriptions")
            .update({
              status: "canceled",
              plan: "free",
              updated_at: new Date().toISOString()
            })
            .eq("email", email);

          if (error) {
            console.error(`Failed to cancel subscription for ${email} in Supabase:`, error);
          } else {
            console.log(`Subscription successfully canceled for ${email}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Lemon Squeezy event type ${eventName}`);
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
