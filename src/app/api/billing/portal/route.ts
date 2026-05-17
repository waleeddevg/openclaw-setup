import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSubscription } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // Get customer ID from subscription table
    const subscription = await getSubscription(userEmail);
    if (!subscription || !subscription.stripe_customer_id) {
      return NextResponse.json({ error: "No active subscription found. Please subscribe to a plan first." }, { status: 400 });
    }

    const Stripe = require("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    console.log(`Creating billing portal session for customer: ${subscription.stripe_customer_id}`);
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error("Billing portal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
