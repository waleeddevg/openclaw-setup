import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { currentUser } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  // Protect this endpoint — it can execute DDL on the production database
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test if ai_provider column exists by doing a select
    const { data, error } = await supabase
      .from("orders")
      .select("ai_provider")
      .limit(1)

    if (error && error.message.includes("ai_provider")) {
      // Column doesn't exist, need to add it via SQL
      // Since Supabase JS can't run DDL, we use the REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          query: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS ai_provider TEXT NOT NULL DEFAULT 'openai';"
        }),
      })

      if (!response.ok) {
        // If RPC doesn't exist, provide manual instructions
        return NextResponse.json({
          status: "manual_required",
          message: "Please run this SQL in your Supabase SQL Editor:",
          sql: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS ai_provider TEXT NOT NULL DEFAULT 'openai';",
        })
      }

      return NextResponse.json({ 
        status: "success", 
        message: "ai_provider column added successfully!" 
      })
    }

    return NextResponse.json({ 
      status: "already_exists", 
      message: "ai_provider column already exists. No migration needed.",
      sample: data 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      status: "error", 
      message: error.message,
      sql: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS ai_provider TEXT NOT NULL DEFAULT 'openai';"
    }, { status: 500 })
  }
}
