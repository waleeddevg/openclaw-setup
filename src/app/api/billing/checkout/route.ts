import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FREE PUBLIC BETA — No payment required.
    // This endpoint now simply returns the /order URL so the client
    // navigates directly to the setup form without any payment gateway.
    console.log(`[Free Beta] Checkout bypassed for user: ${user.id} — redirecting to /order`);

    return NextResponse.json({ success: true, url: "/order" });
  } catch (error: any) {
    console.error("Billing checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
