import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client (Service Role for admin bypass)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Gumroad sends data as form-urlencoded
    const formData = await request.formData();
    
    // Extract Gumroad payment details
    const email = formData.get("email") as string;
    const price = formData.get("price") as string;
    const customUserId = formData.get("custom_user_id") as string; // Yeh humne checkout me bheja tha
    const orderNumber = formData.get("order_number") as string;
    
    console.log(`Gumroad Webhook Received: Order ${orderNumber} for ${email}`);

    if (!customUserId) {
      console.error("Missing custom_user_id from Gumroad webhook");
      return NextResponse.json({ error: "Missing custom_user_id" }, { status: 400 });
    }

    // Step 1: User ki current order/subscription ko dhoondho aur usko "paid" / "active" karo
    // Yahan apni database schema ke mutabiq table ka naam dein (jaise 'orders' ya 'subscriptions')
    const { error: dbError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'completed', 
        payment_id: orderNumber,
        paid_amount: price 
      })
      .eq('user_id', customUserId)
      .eq('status', 'pending');

    if (dbError) {
      console.error("Database update error:", dbError);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    // Step 2: (Optional) Agar auto-deploy script yahan chalani hai toh webhook ya queue trigger kar sakte hain
    // example: triggerDeployment(customUserId);

    console.log(`Successfully processed Gumroad payment for user ${customUserId}`);
    
    // Gumroad ko 200 OK dena zaroori hai
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error: any) {
    console.error("Gumroad webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
