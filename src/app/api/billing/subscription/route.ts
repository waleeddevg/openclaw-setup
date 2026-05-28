import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSubscription, upsertSubscription } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    let subscription = await getSubscription(userEmail);

    // Development Fallback: Auto-provision a mock subscription for local testing only
    if (!subscription || subscription.status !== "active") {
      const isDev = process.env.NODE_ENV === "development";
      const isLocalHost =
        request.nextUrl.hostname === "localhost" ||
        request.nextUrl.hostname === "127.0.0.1";

      if (isDev || isLocalHost) {
        console.log(
          `[Dev Fallback] Auto-provisioning mock active subscription for: ${userEmail}`
        );
        const mockSub = {
          email: userEmail,
          plan: "pro",
          status: "active",
          ls_subscription_id: "sub_mock_" + Math.random().toString(36).substr(2, 9),
          ls_customer_id: "cus_mock_" + Math.random().toString(36).substr(2, 9),
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };

        const savedSub = await upsertSubscription(mockSub);
        if (savedSub) {
          subscription = savedSub;
        }
      }
    }

    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error("[Subscription API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
