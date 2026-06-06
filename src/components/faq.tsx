"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is included in the setup service?",
    answer: "Our automated system performs complete installation and configuration of the OpenClaw AI assistant on your VPS, configures an Nginx reverse proxy with SSL certificates, secures the server with UFW firewall hardening, and runs optimization checks for peak AI inference performance.",
  },
  {
    question: "Which VPS providers do you support?",
    answer: "We support any provider offering clean Ubuntu 22.04 LTS servers with root SSH access, including DigitalOcean, Linode, Vultr, Hetzner, AWS, GCP, and Azure.",
  },
  {
    question: "How long does the setup take?",
    answer: "It takes under 5 minutes. The deployment is fully automated via safe SSH scripting. You can watch the exact execution steps in real-time through the deployment logs terminal on your dashboard.",
  },
  {
    question: "Is my OpenAI/provider API key secure?",
    answer: "Absolutely. Your API keys and VPS password are encrypted using AES-256-GCM before being saved to the database. They are only decrypted in memory during the 5-minute setup process and are never stored in plain text.",
  },
  {
    question: "What if the setup fails or I am not satisfied?",
    answer: "We offer a 7-day money-back guarantee. If our script fails to deploy on your VPS or you are not satisfied with the orchestration, contact us via WhatsApp or email for a full refund.",
  },
  {
    question: "Is there a cost to use ClawSetup?",
    answer: "No. ClawSetup is currently in a 100% Free Public Beta. You can deploy and manage up to 5 concurrent OpenClaw AI assistant nodes on your own VPS servers completely free of charge. No payment card is required.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Frequently Asked </span>
            <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-zinc-400">
            Got questions? We&apos;ve got answers.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white/5 border border-white/10 rounded-lg px-6 data-[state=open]:border-violet-500/30"
              >
                <AccordionTrigger className="text-white hover:text-violet-400 hover:no-underline py-4 text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
