import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { encrypt } from "@/lib/crypto"
import { getSubscription } from "@/lib/supabase"
import { currentUser } from "@clerk/nextjs/server"
import { deployOrder } from "@/lib/deployment"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userEmail = user.emailAddresses[0]?.emailAddress
    if (!userEmail) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 })
    }

    const body = await request.json()
    const {
      full_name,
      whatsapp,
      vps_provider,
      vps_ip,
      vps_region,
      vps_username,
      vps_password,
      ai_provider,
      openai_api_key,
      additional_notes,
    } = body

    // Validate required fields
    if (!full_name || !whatsapp || !vps_provider || !vps_ip || !vps_region || !openai_api_key) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // 1. Free Beta Tier (No paid subscription required)
    const subscription = {
      status: "active",
      plan: "free",
    }

    const limits: Record<string, number> = {
      free: 5,
    }
    const maxNodes = limits[subscription.plan] || 5

    // 2. Count current active nodes (pending, in_progress, or completed)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: activeOrders, error: countError } = await supabase
      .from("orders")
      .select("id")
      .eq("email", userEmail)
      .in("status", ["pending", "in_progress", "completed"])

    if (countError) {
      console.error("Failed to check active orders count:", countError)
      return NextResponse.json({ error: "Failed to verify slot quota" }, { status: 500 })
    }

    const activeCount = activeOrders?.length || 0
    if (activeCount >= maxNodes) {
      return NextResponse.json(
        { error: `Slot quota reached! Your plan (${subscription.plan.toUpperCase()}) allows up to ${maxNodes} active nodes, but you already have ${activeCount} active. Please decommission an existing node in your dashboard to free up a slot or upgrade your subscription plan.` },
        { status: 403 }
      )
    }

    // Encrypt credentials before storing
    const encryptedApiKey = encrypt(openai_api_key)
    const encryptedPassword = vps_password ? encrypt(vps_password) : null

    // 3. Create the direct completed order
    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          full_name,
          email: userEmail,
          whatsapp,
          vps_provider,
          vps_ip,
          vps_region,
          vps_username: vps_username || "root",
          vps_password: encryptedPassword,
          ai_provider: ai_provider || 'openai',
          openai_api_key: encryptedApiKey,
          plan: subscription.plan,
          additional_notes,
          status: "in_progress", // Bypasses pending, starts deployment status immediately
          payment_status: "paid", // Covered by monthly subscription!
          stripe_session_id: "subscription_direct",
          amount_paid: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      // Log full error server-side, never expose DB internals to client
      console.error("Database error details:", error)
      return NextResponse.json(
        { error: "Failed to create order. Please try again or contact support." },
        { status: 500 }
      )
    }

    // 4. Trigger automated background deployment instantly!
    console.log(`Bypassing checkout flow! Triggering direct deployment for subscription order: ${order.id}`);
    deployOrder(order.id).catch((err) => {
      console.error(`Subscription direct deployment trigger failed for ${order.id}:`, err);
    })

    return NextResponse.json({ 
      success: true, 
      direct: true,
      orderId: order.id,
      url: `/order/${order.id}/status` // Redirect user to status page directly!
    }, { status: 201 })

  } catch (error: any) {
    console.error("API error details:", error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message || "Unknown error"}` },
      { status: 500 }
    )
  }
}
