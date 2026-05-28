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

    // Get subscription from Supabase
    const subscription = await getSubscription(userEmail);

    // Support both ls_customer_id (new) and stripe_customer_id (legacy) fields
    const customerId = subscription?.ls_customer_id || subscription?.stripe_customer_id;

    if (!subscription || !customerId) {
      return NextResponse.json(
        { error: "No active subscription found. Please subscribe to a plan first." },
        { status: 400 }
      );
    }

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!apiKey) {
      throw new Error("Missing Lemon Squeezy API Key");
    }

    console.log(`[Billing Portal] Fetching portal URL for customer: ${customerId}`);

    const response = await fetch(`https://api.lemonsqueezy.com/v1/customers/${customerId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Billing Portal] Lemon Squeezy API error:", data);
      throw new Error(data.errors?.[0]?.detail || "Failed to fetch customer portal");
    }

    const portalUrl = data.data?.attributes?.urls?.customer_portal;
    if (!portalUrl) {
      throw new Error("Customer portal URL not available. Please contact support.");
    }

    return NextResponse.json({ success: true, url: portalUrl });
  } catch (error: any) {
    console.error("[Billing Portal] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
