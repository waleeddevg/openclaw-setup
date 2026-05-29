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

    // GUMROAD PRODUCT LINKS
    // Yahan par aapne apne Gumroad ke products ke link daalne hain
    const gumroadLinks: Record<string, string> = {
      basic: process.env.GUMROAD_BASIC_LINK || "https://devwaleed.gumroad.com/l/srappx",
      pro: process.env.GUMROAD_PRO_LINK || "https://devwaleed.gumroad.com/l/srappx",
      business: process.env.GUMROAD_BUSINESS_LINK || "https://devwaleed.gumroad.com/l/srappx",
    };

    const checkoutUrl = new URL(gumroadLinks[plan]);
    
    // Pass the user's email to Gumroad so they don't have to type it again
    checkoutUrl.searchParams.append("email", userEmail);
    // Pass the user's Clerk ID so we know who paid when the webhook hits
    checkoutUrl.searchParams.append("custom_user_id", user.id);

    console.log(`Redirecting to Gumroad checkout: ${checkoutUrl.toString()}`);

    return NextResponse.json({ success: true, url: checkoutUrl.toString() });
  } catch (error: any) {
    console.error("Billing checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
