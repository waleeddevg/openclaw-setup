import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getSubscription } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    // 1. Fetch Subscription details
    const subscription = await getSubscription(userEmail);
    
    // 2. Fetch Active Count
    const { data: activeOrders, error } = await supabase
      .from("orders")
      .select("id")
      .eq("email", userEmail)
      .in("status", ["pending", "in_progress", "completed"]);

    if (error) {
      console.error("Failed to check active orders count:", error);
      return NextResponse.json({ error: "Failed to verify slots count" }, { status: 500 });
    }

    const activeCount = activeOrders?.length || 0;
    const limits: Record<string, number> = {
      basic: 1,
      pro: 3,
      business: 10,
    };
    
    const plan = subscription?.status === "active" ? subscription.plan : "free";
    const limit = subscription?.status === "active" ? (limits[subscription.plan] || 0) : 0;
    const status = subscription?.status || "inactive";

    return NextResponse.json({
      success: true,
      plan,
      limit,
      activeCount,
      status
    });
  } catch (error: any) {
    console.error("Quota API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
