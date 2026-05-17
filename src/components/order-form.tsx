"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Loader2, Send, Shield, Lock, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  whatsapp: z.string().min(10, "Please enter a valid WhatsApp number"),
  vps_provider: z.string().min(1, "Please select a VPS provider"),
  vps_ip: z.string().min(7, "Please enter a valid IP address"),
  vps_region: z.string().min(1, "Please select a region"),
  vps_username: z.string().min(1, "Please enter a VPS username").default("root"),
  vps_password: z.string().optional(),
  ai_provider: z.string().min(1, "Please select an AI provider"),
  openai_api_key: z.string().min(5, "Please enter a valid API key"),
  plan: z.string().default("basic"),
  additional_notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const vpsProviders = [
  "DigitalOcean",
  "Linode",
  "Vultr",
  "AWS",
  "Google Cloud",
  "Azure",
  "Hetzner",
  "Contabo",
  "Other",
]

export function OrderForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quota, setQuota] = useState<{ plan: string; limit: number; activeCount: number; status: string } | null>(null)
  const [loadingQuota, setLoadingQuota] = useState(true)

  const { user } = useUser()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vps_username: "root",
      plan: "basic",
      vps_provider: "DigitalOcean",
      vps_region: "us-east",
      email: user?.primaryEmailAddress?.emailAddress || "",
    },
  })

  // Update email and load quotas
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setValue("email", user.primaryEmailAddress.emailAddress)
    }

    async function fetchQuota() {
      try {
        const res = await fetch("/api/billing/quota")
        const data = await res.json()
        if (data.success) {
          setQuota(data)
          setValue("plan", data.plan)
        }
      } catch (err) {
        console.error("Error fetching quota:", err)
      } finally {
        setLoadingQuota(false)
      }
    }
    fetchQuota()
  }, [user, setValue])
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    toast.info("Initializing automated SSH deployment pipeline...")
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok && result.success && result.url) {
        toast.success("Deployment started successfully! Bypassing checkout.")
        router.push(result.url) // Direct redirect to real-time status page
      } else {
        toast.error(result.error || "Failed to initiate deployment. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting deployment:", error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isUnsubscribed = !quota || quota.status !== "active"
  const quotaExceeded = quota ? quota.activeCount >= quota.limit : false
  const canDeploy = !isUnsubscribed && !quotaExceeded

  if (loadingQuota) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading Cloud Slot Credentials...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Alerts based on quota status */}
      {isUnsubscribed && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-white font-bold tracking-tight">No Active Subscription</h4>
            <p className="text-zinc-400 text-sm font-medium">
              You must have an active Developer, Team, or Agency monthly plan to deploy and manage AI Nodes.
            </p>
            <div className="pt-2">
              <Link href="/#pricing">
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-4 py-2 text-xs">
                  Subscribe to a Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {!isUnsubscribed && quotaExceeded && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-white font-bold tracking-tight">Active Node Limit Reached</h4>
            <p className="text-zinc-400 text-sm font-medium">
              You are currently using {quota?.activeCount} of {quota?.limit} slots on your {quota?.plan.toUpperCase()} Plan. 
              Please decommission/delete an existing active node from your dashboard or upgrade your plan to free up a slot!
            </p>
          </div>
        </div>
      )}

      {!isUnsubscribed && !quotaExceeded && quota && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-white font-bold tracking-tight">Frictionless Subscriptions Active</h4>
            <p className="text-zinc-400 text-sm font-medium">
              Available quota slots: <span className="text-emerald-400 font-bold">{quota.limit - quota.activeCount} slot(s) remaining</span> (Currently using {quota.activeCount} of {quota.limit} on {quota.plan.toUpperCase()} plan). 
              Your next deployment will start immediately with **Zero Payment Actions**!
            </p>
          </div>
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Customer Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              {...register("full_name")}
              disabled={!canDeploy}
              className={`bg-zinc-900/50 border-white/5 focus:border-violet-500/50 h-12 transition-all ${errors.full_name ? "border-red-500" : ""}`}
            />
            {errors.full_name && (
              <p className="text-xs text-red-500 font-medium">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register("email")}
              disabled={true} // Locked to logged in Clerk user email for absolute safety
              className="bg-zinc-900/50 border-white/5 h-12 transition-all opacity-50 cursor-not-allowed"
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">WhatsApp Number</Label>
            <Input
              id="whatsapp"
              placeholder="+1 234 567 890"
              {...register("whatsapp")}
              disabled={!canDeploy}
              className={`bg-zinc-900/50 border-white/5 focus:border-violet-500/50 h-12 transition-all ${errors.whatsapp ? "border-red-500" : ""}`}
            />
            {errors.whatsapp && (
              <p className="text-xs text-red-500 font-medium">{errors.whatsapp.message}</p>
            )}
          </div>

          {/* VPS Provider */}
          <div className="space-y-2">
            <Label htmlFor="vps_provider" className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">VPS Provider</Label>
            <Select onValueChange={(value) => setValue("vps_provider", value)} disabled={!canDeploy}>
              <SelectTrigger className={`bg-zinc-900/50 border-white/5 focus:border-violet-500/50 h-12 transition-all ${errors.vps_provider ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {vpsProviders.map((provider) => (
                  <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Server Region */}
          <div className="space-y-2">
            <Label htmlFor="vps_region" className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Preferred Region</Label>
            <Select onValueChange={(value) => setValue("vps_region", value)} disabled={!canDeploy}>
              <SelectTrigger className={`bg-zinc-900/50 border-white/5 focus:border-violet-500/50 h-12 transition-all ${errors.vps_region ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="us-east">North America (US-East)</SelectItem>
                <SelectItem value="eu-west">Europe (Frankfurt)</SelectItem>
                <SelectItem value="asia-south">Asia Pacific (Singapore)</SelectItem>
                <SelectItem value="uk-london">United Kingdom (London)</SelectItem>
              </SelectContent>
            </Select>
            {errors.vps_region && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.vps_region.message}</p>
            )}
          </div>

          {/* VPS IP */}
          <div className="space-y-2">
            <Label htmlFor="vps_ip" className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">VPS IP Address</Label>
            <Input
              id="vps_ip"
              placeholder="192.168.1.1"
              {...register("vps_ip")}
              disabled={!canDeploy}
              className={`bg-zinc-900/50 border-white/5 focus:border-violet-500/50 h-12 transition-all ${errors.vps_ip ? "border-red-500" : ""}`}
            />
            {errors.vps_ip && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.vps_ip.message}</p>
            )}
          </div>

          {/* VPS Username */}
          <div className="space-y-2">
            <Label htmlFor="vps_username" className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">SSH Username</Label>
            <Input
              id="vps_username"
              placeholder="root"
              {...register("vps_username")}
              disabled={!canDeploy}
              className="bg-zinc-900/50 border-white/5 focus:border-violet-500/50 h-12 transition-all"
            />
          </div>

          {/* VPS Password */}
          <div className="space-y-2">
            <Label htmlFor="vps_password" className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">VPS Password</Label>
            <div className="relative">
              <Input
                id="vps_password"
                type="password"
                placeholder="••••••••"
                {...register("vps_password")}
                disabled={!canDeploy}
                className="bg-zinc-900/50 border-white/5 focus:border-violet-500/50 h-12 transition-all pl-10"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            </div>
            {errors.vps_password && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.vps_password.message}</p>
            )}
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" /> Encrypted with AES-256-GCM
            </p>
          </div>

          {/* AI Provider */}
          <div className="space-y-2">
            <Label htmlFor="ai_provider" className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">AI Model Provider</Label>
            <Select onValueChange={(value) => setValue("ai_provider", value)} disabled={!canDeploy}>
              <SelectTrigger className={`bg-zinc-900/50 border-white/5 focus:border-violet-500/50 h-12 transition-all ${errors.ai_provider ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="openai">OpenAI (GPT-4o, o1)</SelectItem>
                <SelectItem value="gemini">Google Gemini (1.5 Pro)</SelectItem>
                <SelectItem value="groq">Groq (Llama 3, Mixtral)</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude 3.5)</SelectItem>
                <SelectItem value="kimi">Kimi AI (Moonshot)</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
              </SelectContent>
            </Select>
            {errors.ai_provider && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.ai_provider.message}</p>
            )}
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="openai_api_key" className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">AI Model API Key</Label>
            <div className="relative">
              <Input
                id="openai_api_key"
                type="password"
                placeholder="Enter your API key here..."
                {...register("openai_api_key")}
                disabled={!canDeploy}
                className={`bg-zinc-900/50 border-white/5 focus:border-violet-500/50 h-12 transition-all pl-10 ${errors.openai_api_key ? "border-red-500" : ""}`}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            </div>
            {errors.openai_api_key && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors.openai_api_key.message}</p>
            )}
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" /> Encrypted and stored safely
            </p>
          </div>
        </div>

        {/* Plan Display (Static based on active subscription tier) */}
        {!isUnsubscribed && quota && (
          <div className="space-y-2">
            <Label className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Active Service Plan</Label>
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl h-14 px-4 flex items-center justify-between">
              <span className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-pulse" />
                {quota.plan === "basic" ? "Developer Plan" : quota.plan === "pro" ? "Team Plan" : "Agency Plan"}
              </span>
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Max {quota.limit} Node{quota.limit > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-6 space-y-6">
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full rounded-2xl py-9 text-2xl font-black group shadow-[0_20px_50px_rgba(139,92,246,0.2)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
            disabled={isSubmitting || !canDeploy}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                Deploying Node VPS...
              </>
            ) : isUnsubscribed ? (
              <>No Active Subscription</>
            ) : quotaExceeded ? (
              <>Slot Limit Exceeded</>
            ) : (
              <>
                Start Automated Setup
                <Send className="ml-3 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </Button>
          
          {/* Trust Badges */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Shield className="w-3 h-3 text-emerald-500" /> Fully Automated SSH Pipeline with High-Fidelity Logs
            </p>
          </div>
        </div>
      </motion.form>
    </div>
  )
}
