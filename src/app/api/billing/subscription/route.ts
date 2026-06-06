import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

// FREE PUBLIC BETA — All authenticated users automatically receive an active
// "free" plan with a 5-node slot quota. No DB lookup or payment required.
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const subscription = {
      email: userEmail,
      plan: "free",
      status: "active",
      node_limit: 5,
      period: "Public Beta",
    };

    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error("[Subscription API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
