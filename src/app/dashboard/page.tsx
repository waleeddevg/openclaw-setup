import { getOrders, getSubscription } from "@/lib/supabase"
import { currentUser } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/auth"
import { DashboardClient } from "@/components/dashboard-client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await currentUser()
  const userEmail = user?.emailAddresses[0]?.emailAddress || ""
  const isUserAdmin = await isAdmin()

  // 1. Fetch deployments list (Always show only the logged-in user's personal orders here)
  const orders = await getOrders(userEmail)

  // 2. Fetch active Stripe slot subscription details for quota progress calculation
  const subscription = await getSubscription(userEmail)

  return (
    <DashboardClient 
      initialOrders={orders} 
      subscription={subscription} 
      userEmail={userEmail}
      isAdmin={isUserAdmin}
    />
  )
}
