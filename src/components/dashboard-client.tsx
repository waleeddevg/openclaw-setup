"use client"

import { useState, useEffect } from "react"
import { Order } from "@/types"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { 
  Server, 
  Clock, 
  Globe, 
  Shield, 
  Trash2, 
  ExternalLink, 
  ArrowRight, 
  CreditCard,
  Plus,
  Loader2,
  AlertCircle,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface DashboardClientProps {
  initialOrders: Order[]
  subscription: {
    plan: string
    status: string
    stripe_customer_id?: string
  } | null
  userEmail: string
  isAdmin: boolean
}

export function DashboardClient({ initialOrders, subscription, userEmail, isAdmin }: DashboardClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [decommissioningId, setDecommissioningId] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [activeSub, setActiveSub] = useState(subscription)
  const [isSyncing, setIsSyncing] = useState(false)

  // 1. Quota Slot calculation
  const limits: Record<string, number> = {
    basic: 1,
    pro: 3,
    business: 10,
  }

  const isSubActive = activeSub?.status === "active"
  const plan = isSubActive ? activeSub.plan : "free"
  const limit = isSubActive ? (limits[activeSub.plan] || 0) : 0

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("success") === "true" && activeSub?.status !== "active") {
        setIsSyncing(true)
        
        let attempts = 0
        const interval = setInterval(async () => {
          attempts++
          try {
            const res = await fetch("/api/billing/subscription")
            if (res.ok) {
              const data = await res.json()
              if (data.subscription && data.subscription.status === "active") {
                setActiveSub(data.subscription)
                setIsSyncing(false)
                clearInterval(interval)
                toast.success("Hosting plan activated successfully! Slot quota granted!")
                return
              }
            }
          } catch (err) {
            console.error("Error syncing subscription status:", err)
          }

          if (attempts >= 10) {
            setIsSyncing(false)
            clearInterval(interval)
            toast.error("Stripe is taking a bit longer to sync. Please refresh the page manually in a few seconds.", {
              duration: 5000
            })
          }
        }, 2000)

        return () => clearInterval(interval)
      }
    }
  }, [activeSub])

  // Count active nodes: pending, in_progress, completed (status !== 'cancelled')
  const activeOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "in_progress" || o.status === "completed"
  )
  const activeCount = activeOrders.length
  
  const percentage = limit > 0 ? Math.min(100, Math.round((activeCount / limit) * 100)) : 0
  const slotsRemaining = Math.max(0, limit - activeCount)

  // stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    inProgress: orders.filter((o) => o.status === "in_progress").length,
    completed: orders.filter((o) => o.status === "completed").length,
  }

  // 2. Handle node deletion (decommission)
  const handleDecommission = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to decommission this AI server node?\n\nThis will permanently release the server record, remove active credentials, and free up 1 slot on your subscription immediately."
    )
    if (!confirmDelete) return

    setDecommissioningId(id)
    const toastId = toast.loading("Decommissioning server node and releasing slot...")

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || "Node successfully decommissioned, slot released!", { id: toastId })
        // Update local state to remove from UI list
        setOrders((prev) => prev.filter((o) => o.id !== id))
      } else {
        toast.error(data.error || "Failed to decommission server. Please try again.", { id: toastId })
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to decommission server node.", { id: toastId })
    } finally {
      setDecommissioningId(null)
    }
  }

  // 3. Handle Stripe customer portal redirect
  const handleManageBilling = async () => {
    if (!subscription || !subscription.stripe_customer_id) {
      toast.error("You do not have an active billing history. Subscribe to a plan first!")
      return
    }

    setLoadingPortal(true)
    const toastId = toast.loading("Opening secure billing settings portal...")

    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
      })
      const data = await res.json()

      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Failed to launch billing portal.", { id: toastId })
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred opening billing portal.", { id: toastId })
    } finally {
      setLoadingPortal(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            My Automated Servers
          </h1>
          <p className="text-zinc-500 font-medium">
            Provision and orchestrate enterprise-grade OpenClaw AI servers instantly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSubActive && (
            <Button
              onClick={handleManageBilling}
              disabled={loadingPortal}
              variant="outline"
              className="border-white/10 text-zinc-300 hover:bg-white/5 gap-2 h-11"
            >
              {loadingPortal ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Manage Billing & Portal
            </Button>
          )}

          <Link href="/order">
            <Button
              variant="gradient"
              disabled={slotsRemaining === 0}
              className="gap-2 h-11 shadow-lg shadow-violet-500/20"
            >
              <Plus className="w-4 h-4" />
              Deploy New Node
            </Button>
          </Link>
        </div>
      </div>

      {/* Subscription Quota Slot Matrix */}
        <Card className="border-white/5 bg-zinc-950/50 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Badge variant="outline" className="border-violet-500/30 text-violet-400 bg-violet-950/10 font-bold uppercase tracking-wider px-3 py-1">
              Active Tier: {plan.toUpperCase()}
            </Badge>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-violet-400" />
              Subscription Slot Quota Allocation
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Each slot represents one concurrently active server deployment (Pending, In Progress, or Completed).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSyncing ? (
              <div className="p-6 bg-violet-950/10 border border-violet-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between animate-pulse">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                    Syncing subscription status with Stripe...
                  </h4>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-lg">
                    Confirming payment confirmation and provisioning your server slot quota. This usually takes 2-3 seconds...
                  </p>
                </div>
              </div>
            ) : limit > 0 ? (
              <>
                <div className="flex justify-between items-center text-sm font-bold tracking-tight">
                  <span className="text-zinc-400">Slot Quota Usage</span>
                  <span className="text-white">
                    {activeCount} of {limit} slots filled ({percentage}%)
                  </span>
                </div>

                <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-white/5">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-violet-500/40"
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between text-xs text-zinc-500 gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span>{slotsRemaining} slots currently available to deploy.</span>
                  </div>
                  {slotsRemaining === 0 && (
                    <span className="text-yellow-500 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 inline" /> You have filled your slot limit! Upgrade or decommission a node to release a slot.
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="p-6 bg-violet-950/10 border border-violet-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base">No active hosting subscription found</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-lg">
                    Subscribe to a professional, slot-based billing plan in our pricing section to instantly deploy automated server nodes on your custom VPS.
                  </p>
                </div>
                <Link href="/#pricing">
                  <Button variant="gradient" className="whitespace-nowrap font-bold h-10 px-5 shadow-md">
                    Choose Subscription Plan
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Quick Status Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total VPS Nodes", value: stats.total, icon: Server, color: "text-white" },
          { label: "Pending Installs", value: stats.pending, icon: Clock, color: "text-yellow-500" },
          { label: "Active Deploying", value: stats.inProgress, icon: Globe, color: "text-blue-500" },
          { label: "Healthy Services", value: stats.completed, icon: Shield, color: "text-emerald-500" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-zinc-900/40 border-white/5 backdrop-blur-xl group hover:border-violet-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Server Deployments List */}
      <Card className="bg-zinc-900/30 border-white/5 backdrop-blur-xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-white">Active Server Nodes</CardTitle>
              <CardDescription className="text-zinc-500">Real-time control panel of your automated AI setups</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/5">
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Server / ID</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Provider</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Setup Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Created</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-zinc-500 font-medium space-y-4">
                      <div className="text-zinc-600 text-3xl font-black">∅</div>
                      <p>No deployment records found in database.</p>
                      {!isAdmin && limit > 0 && (
                        <div className="pt-2">
                          <Link href="/order">
                            <Button size="sm" variant="gradient" className="font-bold">
                              Deploy your first Node
                            </Button>
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-white font-bold tracking-tight text-base hover:text-violet-400 transition-colors flex items-center gap-1.5">
                            {order.vps_ip || "Provisioning Node..."}
                            {order.ai_url && (
                              <a href={order.ai_url} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                                <ExternalLink className="w-3.5 h-3.5 inline" />
                              </a>
                            )}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                            ID: {order.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-zinc-400 text-sm font-medium uppercase tracking-tight">{order.vps_provider}</span>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-zinc-500 text-xs font-semibold">{formatDate(order.created_at)}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/order/${order.id}/status`}>
                            <Button size="sm" variant="ghost" className="h-9 gap-1.5 text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                              Logs & Tunnel
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>

                          <Button
                            onClick={() => handleDecommission(order.id)}
                            disabled={decommissioningId === order.id}
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors rounded-lg border border-transparent hover:border-rose-500/20"
                          >
                            {decommissioningId === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
