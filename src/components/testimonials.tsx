"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    name: "Waseem Akram",
    role: "Lead Developer",
    company: "AutomateAI",
    content: "Normally, configuring Nginx, SSL certificates, PM2, and repository updates for OpenClaw takes at least 45 minutes of manual terminal tinkering. ClawSetup had it live on Vultr in under 5 minutes. An absolute game-changer.",
    rating: 5,
  },
  {
    name: "Arslan Khalid",
    role: "Indie Hacker",
    company: "AgentStack",
    content: "Was skeptical about sharing VPS credentials, but the AES-256 encryption implementation is extremely clean. Deployed my Gemini-conditioned OpenClaw node seamlessly without writing a single script myself.",
    rating: 5,
  },
  {
    name: "Rohan Mehta",
    role: "AI Architect",
    company: "PromptFlow",
    content: "The real-time log streaming interface on the dashboard is outstanding. I could watch the script update debian dependencies and launch the node live. Zero black box mystery.",
    rating: 5,
  },
  {
    name: "Jessica Vance",
    role: "Founder",
    company: "ChatFlow Labs",
    content: "Managing custom setups for clients was a nightmare. Utilizing the slot-based Pro tier quota, we spin up and decommission nodes within minutes. Customer support on WhatsApp is incredibly responsive.",
    rating: 5,
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

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4">
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
            <span className="text-white">What Our </span>
            <span className="text-gradient">Clients Say</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Trusted by hundreds of businesses worldwide
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full bg-white/5 border-white/10 hover:bg-white/[0.07] transition-all duration-300">
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-violet-400 text-violet-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-zinc-300 mb-6 leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{testimonial.name}</p>
                      <p className="text-sm text-zinc-500">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
