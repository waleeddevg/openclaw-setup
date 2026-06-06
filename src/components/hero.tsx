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
        {/* What is OpenClaw — explainer for new visitors */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-zinc-800/80 border border-white/10 mb-4 text-zinc-400 text-xs font-medium"
        >
          <Bot className="w-3.5 h-3.5 text-violet-400" />
          <span>OpenClaw is an open-source AI assistant framework &mdash; we deploy it to your VPS automatically.</span>
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
          OpenClaw AI assistant on your VPS with <span className="text-white font-bold underline decoration-violet-500 decoration-2 underline-offset-4">Fully Automated Setup</span>.
        </motion.p>

        {/* Mini Benefits */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-14"
        >
          {['5-Minute Setup', 'Up to 10 Nodes', 'Full SSH Access', 'AES-256 Encrypted'].map((item) => (
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
          <Link href="/sign-up">
            <Button size="lg" variant="gradient" className="rounded-2xl px-12 py-9 text-2xl font-black group shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:scale-105 transition-all duration-300">
              Get Started &mdash; 100% Free
              <ArrowRight className="ml-3 w-7 h-7 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
          <p className="text-zinc-500 font-medium text-sm">
            Free Public Beta &middot; No credit card required
          </p>
        </motion.div>


      </div>
    </section>
  )
}
