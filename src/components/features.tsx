"use client"

import { motion } from "framer-motion"
import { Bot, Shield, Zap, Clock, Server, Headphones, Settings, Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: Zap,
    title: "Instant Auto-Deployment",
    description: "Our system connects to your VPS and installs OpenClaw AI automatically in under 5 minutes.",
  },
  {
    icon: Shield,
    title: "Auto-Security",
    description: "Automatic Nginx reverse proxy, firewall hardening, and SSL certificates setup.",
  },
  {
    icon: Bot,
    title: "AI Optimization",
    description: "Automated configuration of memory backends and model parameters for peak performance.",
  },
  {
    icon: Clock,
    title: "5 Minute Delivery",
    description: "No more 24-hour waiting periods. Your AI is live as soon as the automation completes.",
  },
  {
    icon: Server,
    title: "Multi-Provider Support",
    description: "Automated scripts compatible with Linode, DigitalOcean, Vultr, Hetzner, and more.",
  },
  {
    icon: Lock,
    title: "AES-256 Encryption",
    description: "Your VPS credentials and API keys are encrypted with industrial-grade AES-256.",
  },
  {
    icon: Settings,
    title: "Live Progress Tracking",
    description: "Watch every step of the installation in real-time through our live logs terminal.",
  },
  {
    icon: Headphones,
    title: "24/7 Monitoring",
    description: "Our background workers monitor your deployment and auto-retry if any command fails.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function Features() {
  return (
    <section id="features" className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-violet-600/5 blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <Badge variant="outline" className="mb-4 border-violet-500/30 text-violet-400 bg-violet-500/5 px-4 py-1 uppercase tracking-widest text-[10px] font-bold">
            Unbeatable Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            <span className="text-white">Why Professionals Choose </span>
            <span className="text-gradient">ClawSetup</span>
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-lg font-medium">
            We provide the most stable, secure, and automated OpenClaw hosting 
            experience on the market.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full bg-zinc-900/30 border-white/5 hover:bg-zinc-800/50 hover:border-violet-500/30 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-8 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-500 transition-all duration-500">
                    <feature.icon className="w-7 h-7 text-violet-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Mini Comparison / Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 p-8 md:p-12 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-white/5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-10"
        >
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-white">Compare with Manual Setup</h3>
            <p className="text-zinc-400 max-w-md">Save 4+ hours of technical frustration and risk of configuration errors.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-black text-rose-500 opacity-50 italic line-through">4 Hours</div>
              <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Manual Setup</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-black text-emerald-500">5 Mins</div>
              <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest">ClawSetup AI</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
