"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Star, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const plans = [
  {
    id: "free",
    name: "Public Beta Plan",
    price: 0,
    period: "forever",
    description: "Deploy and manage your automated OpenClaw AI nodes during our public beta.",
    features: [
      "Host up to 5 Active Node VPS",
      "Automated OpenClaw setups",
      "Automatic SSL certificate setup",
      "Standard SSH setup logs",
      "Nginx reverse proxy automation",
      "Basic security firewall setup",
      "Community support via WhatsApp",
    ],
    cta: "Deploy Node For Free",
    popular: true,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
}

export function Pricing() {
  const { isSignedIn } = useUser()
  const router = useRouter()

  const handlePlanClick = (planId: string) => {
    if (!isSignedIn) {
      toast.info("Please sign in or sign up first to get started.")
      router.push("/sign-in?redirect_url=/order")
      return
    }
    router.push("/order")
  }

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Public Beta &mdash; </span>
            <span className="text-gradient">100% Free Setup</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Deploy your OpenClaw AI assistant to your own VPS instantly. No payment card required.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex justify-center relative z-10"
        >
          {plans.map((plan, index) => (
            <motion.div key={index} variants={itemVariants} className="relative group max-w-md w-full">
              {plan.popular && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              )}
              <Card
                className={`h-full relative overflow-hidden transition-all duration-300 hover:translate-y-[-8px] ${
                  plan.popular
                    ? "border-violet-500/50 bg-zinc-900/90 backdrop-blur-xl"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 p-4">
                    <Badge variant="default" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-none shadow-lg shadow-violet-500/20">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Free Beta
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4 pt-8">
                  <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-zinc-200'}`}>{plan.name}</h3>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-8">
                    <span className="text-5xl font-extrabold text-white tracking-tight">Free</span>
                    <span className="text-zinc-500 ml-1 text-sm font-medium">/ forever</span>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className={`mt-1 p-0.5 rounded-full ${plan.popular ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-800 text-zinc-500'}`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm text-zinc-300 leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanClick(plan.id)}
                    variant={plan.popular ? "gradient" : "outline"}
                    size="lg"
                    className={`w-full rounded-xl font-bold h-12 shadow-xl transition-all ${
                      plan.popular ? 'shadow-violet-500/20 hover:shadow-violet-500/40' : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 pt-10 border-t border-white/5 flex flex-col items-center gap-8"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <span className="font-bold text-lg tracking-tighter">No Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tighter">SSL Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="font-bold text-lg tracking-tighter">Instant Provisioning</span>
            </div>
          </div>
          
          <div className="max-w-md text-center space-y-2">
            <p className="text-zinc-400 text-sm font-medium italic">
              "Super clean platform. No pricing barrier. Deployed my OpenClaw agent in under 5 minutes without writing a single bash script."
            </p>
            <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">— Professional Developer</p>
          </div>

          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold">
            Guaranteed 100% Free & Secure Deployment
          </p>
        </motion.div>
      </div>
    </section>
  )
}
