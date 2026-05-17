"use client"

import { useState, useCallback } from "react"
import { Order, OrderStatus } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/status-badge"
import { formatDate } from "@/lib/utils"
import { Search, Trash2, RefreshCw, Rocket, Terminal, ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"

const statusOptions: OrderStatus[] = ["pending", "in_progress", "completed", "cancelled", "failed"]

// Fetcher that uses the admin API route
const fetchOrders = async (url: string): Promise<Order[]> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch orders')
  const data = await response.json()
  return data.orders || []
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [deployingOrders, setDeployingOrders] = useState<Set<string>>(new Set())

  const { data: orders, mutate, isLoading } = useSWR(
    '/api/admin/orders',
    fetchOrders,
    { refreshInterval: 10000 } // Auto-refresh every 10s to get deployment updates
  )

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vps_provider.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      if (response.ok) {
        toast.success("Order status updated")
        mutate()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to update status")
      }
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders?orderId=${orderId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success("Order deleted")
        mutate()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete order")
      }
    } catch {
      toast.error("Failed to delete order")
    }
  }

  const handleDeploy = async (orderId: string) => {
    setDeployingOrders((prev) => new Set(prev).add(orderId))

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Deployment started! Check logs for progress.")
        mutate()
      } else {
        toast.error(data.error || "Failed to start deployment")
      }
    } catch {
      toast.error("Failed to start deployment")
    } finally {
      setDeployingOrders((prev) => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">All Orders</h1>
        <Button variant="outline" onClick={() => mutate()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10 mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search by name, email, or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}
            >
              <SelectTrigger className="w-40 bg-white/5 border-white/10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          <span className="ml-3 text-zinc-400">Loading orders...</span>
        </div>
      )}

      {/* Orders Table */}
      {!isLoading && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-zinc-400 font-medium">Customer</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">VPS</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Plan</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Payment</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Status</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Date</th>
                    <th className="text-right p-4 text-zinc-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders?.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <p className="text-white font-medium">{order.full_name}</p>
                          <p className="text-sm text-zinc-500">{order.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-zinc-300">{order.vps_provider}</p>
                          <p className="text-sm text-zinc-500">{order.vps_ip}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-zinc-300 capitalize">{order.plan}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className={`text-xs font-bold uppercase ${
                              order.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-500'
                            }`}>
                              {order.payment_status}
                            </span>
                            {order.amount_paid && (
                              <span className="text-xs text-zinc-500">${order.amount_paid}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                          >
                            <SelectTrigger className="w-36 bg-transparent border-white/10">
                              <StatusBadge status={order.status} />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4 text-zinc-400">{formatDate(order.created_at)}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* Deploy Button — only for pending/failed orders */}
                            {(order.status === "pending" || order.status === "failed") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 gap-1"
                                onClick={() => handleDeploy(order.id)}
                                disabled={deployingOrders.has(order.id)}
                              >
                                {deployingOrders.has(order.id) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Rocket className="w-4 h-4" />
                                )}
                                Deploy
                              </Button>
                            )}

                            {/* AI URL Link — for completed orders */}
                            {order.status === "completed" && order.ai_url && (
                              <a
                                href={order.ai_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10 gap-1"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Live
                                </Button>
                              </a>
                            )}

                            {/* Logs Dialog */}
                            {order.deployment_logs && order.deployment_logs.length > 0 && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-zinc-400 hover:text-zinc-300 hover:bg-white/10"
                                  >
                                    <Terminal className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-2xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">
                                      Deployment Logs — {order.full_name}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="bg-black/50 rounded-lg p-4 font-mono text-sm max-h-[60vh] overflow-y-auto">
                                    {order.deployment_logs.map((log, i) => (
                                      <div key={i} className="text-zinc-300 py-0.5">
                                        {log}
                                      </div>
                                    ))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}

                            {/* Delete */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-[#0a0a0a] border-white/10">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-white">Delete Order</AlertDialogTitle>
                                  <AlertDialogDescription className="text-zinc-400">
                                    Are you sure you want to delete this order? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(order.id)}
                                    className="bg-red-500 text-white hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
      )}
    </div>
  )
}
