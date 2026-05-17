"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Circle, Loader2, Server, Terminal, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DeploymentProgressProps {
  orderId: string
}

export function DeploymentProgress({ orderId }: DeploymentProgressProps) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        const data = await response.json()
        if (data.order) {
          setOrder(data.order)
        }
      } catch (error) {
        console.error("Error fetching status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 2000) // Polling every 2 seconds for faster response
    return () => clearInterval(interval)
  }, [orderId])

  // Auto-scroll terminal to bottom
  useEffect(() => {
    const terminal = document.getElementById('terminal-logs')
    if (terminal) {
      terminal.scrollTop = terminal.scrollHeight
    }
  }, [order?.deployment_logs])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-zinc-500 animate-pulse">Initializing Secure Connection...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <p className="text-zinc-400">Order context not found. Please verify your link.</p>
      </div>
    )
  }

  const logs = order.deployment_logs || []
  const status = order.status
  const isPaid = order.payment_status === 'paid'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Payment Warning - If not paid */}
      {!isPaid && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-4"
        >
          <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-yellow-500 uppercase tracking-wider">Awaiting Payment Confirmation</h4>
            <p className="text-xs text-zinc-400">Deployment will begin automatically once Stripe confirms your transaction.</p>
          </div>
          <Button size="sm" variant="outline" className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10" onClick={() => window.location.reload()}>
            Refresh Status
          </Button>
        </motion.div>
      )}

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl overflow-hidden shadow-2xl">
        <CardHeader className="border-b border-zinc-800 bg-white/[0.02] p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3">
                  ORDER ID: #{orderId.slice(0, 8)}
                </Badge>
                {status === 'in_progress' && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 animate-pulse">
                    EST. TIME: 5-10 MINS
                  </Badge>
                )}
              </div>
              <CardTitle className="text-3xl font-bold flex items-center gap-3 tracking-tight">
                <Server className="h-8 w-8 text-indigo-500" />
                Infrastructure Setup
              </CardTitle>
              <CardDescription className="text-zinc-500 text-base">
                Provisioning OpenClaw AI on <span className="text-zinc-300 font-mono">{order.vps_ip}</span>
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge 
                className={`px-6 py-2 text-sm font-bold uppercase tracking-widest ${
                  status === 'completed' ? 'bg-emerald-500 text-white' : 
                  status === 'failed' ? 'bg-rose-500 text-white' : 
                  'bg-indigo-600 text-white animate-pulse'
                }`}
              >
                {status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-10">
            {/* Steps Visualizer */}
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-zinc-800" />
              <div className="space-y-8">
                <StepItem 
                  title="Cloud Environment Validation" 
                  description="Verifying VPS accessibility and security keys"
                  isCompleted={logs.some((l: string) => l.includes('Connected'))} 
                  isActive={isPaid && status === 'in_progress' && !logs.some((l: string) => l.includes('Connected'))} 
                />
                <StepItem 
                  title="Core Dependencies Installation" 
                  description="Setting up Node.js 22, Docker, and system packages"
                  isCompleted={logs.some((l: string) => l.includes('Node.js 22'))} 
                  isActive={logs.some((l: string) => l.includes('Connected')) && !logs.some((l: string) => l.includes('Node.js 22'))} 
                />
                <StepItem 
                  title="Source Code Deployment" 
                  description="Cloning OpenClaw repository and configuring gateway"
                  isCompleted={logs.some((l: string) => l.includes('Cloning'))} 
                  isActive={logs.some((l: string) => l.includes('Node.js 22')) && !logs.some((l: string) => l.includes('Cloning'))} 
                />
                <StepItem 
                  title="Final System Optimization" 
                  description="Applying security hardening and launching service"
                  isCompleted={status === 'completed'} 
                  isActive={logs.some((l: string) => l.includes('Cloning')) && status !== 'completed'} 
                />
              </div>
            </div>

            {/* Live Terminal Logs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-indigo-500" />
                  Real-time Execution Logs
                </div>
                {status === 'in_progress' && <span className="text-emerald-500 animate-pulse">● System Active</span>}
              </div>
              <div 
                id="terminal-logs"
                className="bg-black/80 rounded-xl p-5 font-mono text-xs text-zinc-300 h-64 overflow-y-auto border border-zinc-800/50 shadow-inner custom-scrollbar ring-1 ring-white/5 scroll-smooth"
              >
                {logs.length > 0 ? (
                  logs.map((log: string, index: number) => (
                    <div key={index} className="mb-1.5 flex gap-3">
                      <span className="text-zinc-600 shrink-0">[{index + 1}]</span>
                      <span className="text-indigo-400 opacity-70 shrink-0">➜</span>
                      <span className="leading-relaxed">{log}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-600 italic space-y-2">
                    <Loader2 className="h-5 w-5 animate-spin opacity-20" />
                    <p>Initialising automated pipeline...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Success Action */}
            {status === 'completed' && order.ai_url && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center space-y-6 shadow-xl ring-1 ring-emerald-500/10"
              >
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                    Deployment Complete
                  </div>
                  <p className="text-zinc-400 max-w-md mx-auto">Your premium OpenClaw AI instance has been successfully deployed and optimized for production.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild variant="gradient" size="lg" className="rounded-full px-10 font-bold shadow-lg shadow-indigo-500/20">
                    <a href={order.ai_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      Launch Console <ExternalLink className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full border-zinc-700 hover:bg-zinc-800 text-zinc-300 px-10">
                    Documentation
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Error Action */}
            {status === 'failed' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-center space-y-6 shadow-xl ring-1 ring-rose-500/10"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    <Server className="h-6 w-6 text-rose-500" />
                    Deployment Interrupted
                  </h3>
                  <p className="text-zinc-400 max-w-md mx-auto text-sm">Our automated system encountered an issue with your VPS configuration. Most common cause: <span className="text-rose-400 font-semibold">Incorrect VPS credentials or Firewall blocking SSH.</span></p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" className="rounded-full border-rose-500/50 text-rose-500 hover:bg-rose-500/10 px-8">
                    View Error Logs
                  </Button>
                  <Button variant="secondary" className="rounded-full px-8 bg-white text-black hover:bg-zinc-200" onClick={() => window.location.href = 'https://wa.me/yournumber'}>
                    Chat with Support
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Help Footer */}
      <p className="text-center text-zinc-600 text-xs tracking-widest uppercase">
        Protected by AES-256-GCM End-to-End Encryption
      </p>
    </div>
  )
}

function StepItem({ title, description, isCompleted, isActive }: { title: string, description: string, isCompleted: boolean, isActive: boolean }) {
  return (
    <div className="flex items-start gap-5 relative z-10">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 shrink-0 ${
        isCompleted ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" : 
        isActive ? "bg-zinc-900 border-indigo-500 text-indigo-400 ring-4 ring-indigo-500/10" : 
        "bg-zinc-900 border-zinc-800 text-zinc-600"
      }`}>
        {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : 
         isActive ? <Loader2 className="h-6 w-6 animate-spin" /> : 
         <div className="w-2 h-2 rounded-full bg-current" />}
      </div>
      <div className="space-y-1">
        <div className={`text-base font-bold tracking-tight ${isCompleted ? "text-zinc-200" : isActive ? "text-indigo-400" : "text-zinc-500"}`}>
          {title}
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  )
}
