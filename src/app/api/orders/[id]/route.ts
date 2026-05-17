import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { currentUser } from "@clerk/nextjs/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Return order without sensitive fields
    const safeOrder = {
      id: order.id,
      full_name: order.full_name,
      status: order.status,
      deployment_logs: order.deployment_logs,
      ai_url: order.ai_url,
      vps_ip: order.vps_ip,
      plan: order.plan,
      payment_status: order.payment_status,
      created_at: order.created_at,
    }

    return NextResponse.json({ order: safeOrder })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const userEmail = user.emailAddresses[0]?.emailAddress
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Retrieve the deployment first to check ownership
    const { data: order, error: getError } = await supabase
      .from("orders")
      .select("email")
      .eq("id", id)
      .single()

    if (getError || !order) {
      return NextResponse.json({ error: "Node deployment not found" }, { status: 404 })
    }

    // 2. Access control verification
    if (order.email !== userEmail) {
      return NextResponse.json({ error: "Forbidden: You do not own this node" }, { status: 403 })
    }

    // 3. Delete deployment record to release active slot
    const { error: deleteError } = await supabase
      .from("orders")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Failed to decommission node:", deleteError)
      return NextResponse.json({ error: "Failed to decommission node" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Node successfully decommissioned, slot quota released!" })
  } catch (error: any) {
    console.error("DELETE node API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
