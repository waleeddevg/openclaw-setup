"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, Bot, Shield, Zap, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4 overflow-hidden bg-[#0a0a0c]">
      {/* Hostinger-style background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-10 backdrop-blur-xl shadow-[0_0_20px_rgba(139,92,246,0.1)]"
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-bold text-violet-300 tracking-wide uppercase">#1 Automated OpenClaw Provider</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-white"
        >
          Premium <span className="text-gradient">OpenClaw</span> <br />
          AI Hosting
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-lg md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-14 leading-relaxed font-medium"
        >
          Stop struggling with complex terminal commands. Deploy a production-ready 
          OpenClaw AI assistant on your VPS with <span className="text-white font-bold underline decoration-violet-500 decoration-2 underline-offset-4">One-Click Automation</span>.
        </motion.p>

        {/* Mini Benefits */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-14"
        >
          {['5-Minute Setup', 'Unlimited Usage', 'Full SSH Access', 'Enterprise Security'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-emerald-500" />
              </div>
              <span className="text-sm font-bold text-zinc-300 uppercase tracking-widest">{item}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link href="/order">
            <Button size="lg" variant="gradient" className="rounded-2xl px-12 py-9 text-2xl font-black group shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:scale-105 transition-all duration-300">
              Get Started Now
              <ArrowRight className="ml-3 w-7 h-7 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
          <p className="text-zinc-500 font-bold uppercase tracking-tighter text-sm">
            Starting at only <span className="text-white text-lg">$29/setup</span>
          </p>
        </motion.div>

        {/* Live Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 flex items-center justify-center gap-2"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em]">System Status: All Nodes Operational</span>
        </motion.div>
      </div>
    </section>
  )
}
