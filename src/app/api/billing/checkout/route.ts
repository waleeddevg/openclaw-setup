import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();
    if (!plan || !['basic', 'pro', 'business'].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const Stripe = require("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const planPrices: Record<string, { amount: number; limit: number; name: string }> = {
      basic: { amount: 9, limit: 1, name: "Developer Plan" },
      pro: { amount: 19, limit: 3, name: "Team Plan" },
      business: { amount: 39, limit: 10, name: "Agency Plan" },
    };

    const targetPlan = planPrices[plan];

    console.log(`Creating Stripe subscription checkout for email ${userEmail}, plan ${plan}`);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `ClawSetup AI - ${targetPlan.name}`,
              description: `Orchestrate up to ${targetPlan.limit} active VPS servers concurrently.`,
            },
            unit_amount: targetPlan.amount * 100,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: userEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/#pricing`,
      metadata: {
        email: userEmail,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          email: userEmail,
          plan: plan,
        }
      }
    });

    console.log(`Stripe subscription session created: ${session.id}`);
    return NextResponse.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
