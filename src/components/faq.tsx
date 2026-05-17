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
    answer: "Our setup service includes complete installation and configuration of the OpenClaw AI assistant on your VPS, security hardening with firewall rules and SSL certificates, dependency installation, performance optimization, and thorough testing to ensure everything works perfectly.",
  },
  {
    question: "Which VPS providers do you support?",
    answer: "We support all major VPS providers including DigitalOcean, Linode, Vultr, AWS EC2, Google Cloud Platform, Azure, and any other provider that offers Ubuntu or Debian-based servers with SSH access.",
  },
  {
    question: "How long does the setup take?",
    answer: "Most setups are completed within 12-24 hours of receiving your order. The Starter plan has a 48-hour guarantee, while Pro and higher plans have a 24-hour delivery guarantee. Complex custom configurations may take slightly longer.",
  },
  {
    question: "Is my OpenAI API key secure?",
    answer: "Absolutely. Your API key is handled with the highest security standards. We use encrypted storage, secure transmission protocols, and the key is only used during the setup process. We never store keys in plain text or share them with third parties.",
  },
  {
    question: "What if I'm not satisfied with the setup?",
    answer: "We offer a 30-day money-back guarantee on all our services. If you're not completely satisfied with the setup, contact us and we'll either fix the issues or provide a full refund.",
  },
  {
    question: "Do you provide ongoing support?",
    answer: "Yes! Our Monthly Support plan includes ongoing maintenance, security updates, performance monitoring, and priority support. You can also reach out to us anytime via WhatsApp for quick questions.",
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
