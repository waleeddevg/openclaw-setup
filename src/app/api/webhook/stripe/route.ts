import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { deployOrder } from "@/lib/deployment";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function handleSubscriptionUpdate(stripeInstance: any, stripeSubscriptionId: string) {
  console.log(`Processing subscription sync for Stripe ID: ${stripeSubscriptionId}`);
  const subscription = await stripeInstance.subscriptions.retrieve(stripeSubscriptionId);
  const stripeCustomerId = subscription.customer as string;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  
  // Find email from customer or metadata
  let email = subscription.metadata?.email;
  if (!email) {
    const customer = await stripeInstance.customers.retrieve(stripeCustomerId);
    email = customer.email;
  }

  const plan = subscription.metadata?.plan || "basic";
  const status = subscription.status === "active" ? "active" : "inactive";

  if (email) {
    const { error } = await supabase
      .from("subscriptions")
      .upsert({
        email,
        plan,
        status,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id: stripeCustomerId,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "email"
      });

    if (error) {
      console.error(`Failed to upsert subscription in Supabase for ${email}:`, error);
    } else {
      console.log(`Synced subscription to Supabase for ${email}: plan=${plan}, status=${status}`);
    }
  } else {
    console.error(`Could not resolve customer email for subscription: ${stripeSubscriptionId}`);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`Stripe webhook event received: ${event.type}`);

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      
      if (session.mode === "subscription") {
        const subscriptionId = session.subscription as string;
        await handleSubscriptionUpdate(stripe, subscriptionId);
      } else {
        const orderId = session.metadata.orderId;
        console.log(`Payment successful for order: ${orderId}`);

        // 1. Update order status in Supabase
        const { error: updateError } = await supabase
          .from("orders")
          .update({ 
            payment_status: "paid",
            status: "in_progress", // Start deployment status immediately
            amount_paid: session.amount_total / 100 
          })
          .eq("id", orderId);

        if (updateError) {
          console.error("Failed to update order status:", updateError);
          return NextResponse.json({ error: "Update failed" }, { status: 500 });
        }

        // 2. Trigger automated deployment
        deployOrder(orderId).catch((err) => {
          console.error(`Post-payment deployment trigger failed for ${orderId}:`, err);
        });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const subscriptionId = invoice.subscription as string;
        await handleSubscriptionUpdate(stripe, subscriptionId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      await handleSubscriptionUpdate(stripe, subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const stripeCustomerId = subscription.customer as string;
      
      try {
        const customer = await stripe.customers.retrieve(stripeCustomerId);
        const email = customer.email;
        
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
      } catch (err) {
        console.error("Failed to retrieve customer during cancellation webhook:", err);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
