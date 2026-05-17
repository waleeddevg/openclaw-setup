import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DeploymentProgress } from "@/components/deployment-progress"
import { getOrderById } from "@/lib/supabase"
import { currentUser } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await currentUser()
  const admin = await isAdmin()

  if (!user) {
    redirect("/sign-in")
  }

  const order = await getOrderById(id)

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black mb-4">Order Not Found</h1>
        <p className="text-zinc-500 mb-8">We couldn't find an order with the ID: {id}</p>
        <a href="/dashboard" className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-colors">Go to Dashboard</a>
      </div>
    )
  }

  // Security check: Only owner or admin can view
  const isOwner = order.email === user.emailAddresses[0]?.emailAddress
  if (!admin && !isOwner) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black mb-4 text-red-500">Access Denied</h1>
        <p className="text-zinc-500 mb-2">You are logged in as: <span className="text-white font-bold">{user.emailAddresses[0]?.emailAddress}</span></p>
        <p className="text-zinc-500 mb-8">But this order belongs to: <span className="text-white font-bold">{order.email}</span></p>
        <a href="/dashboard" className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-colors">Back to My Dashboard</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Live Orchestration</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-white">
              Deploying Your <span className="text-gradient">AI Node</span>
            </h1>
            <p className="text-zinc-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
              Our automated engine is currently setting up OpenClaw on <span className="text-white">{order.vps_ip}</span>. 
              Sit back while we handle the heavy lifting.
            </p>
          </div>
          
          <DeploymentProgress orderId={id} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
