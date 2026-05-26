"use client"

import Link from "next/link"
import Image from "next/image"
import { Zap, Mail, MessageCircle } from "lucide-react"

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Order Now", href: "/order" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  support: [
    { label: "FAQ", href: "#faq" },
    { label: "Documentation", href: "#" },
    { label: "Status", href: "#" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative w-[50px] h-[50px]">
                <Image 
                  src="/logo.png" 
                  alt="ClawSetup AI" 
                  fill
                  className="object-contain brightness-110 group-hover:rotate-12 transition-all duration-300" 
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl text-white tracking-tighter leading-none">ClawSetup</span>
                <span className="text-violet-500 font-black text-[10px] tracking-[0.4em] leading-none mt-1">AI SOLUTIONS</span>
              </div>
            </Link>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs">
              Professional AI assistant setup services. We handle the technical details so you can focus on what matters.
            </p>
            <div className="flex gap-4">
              <a
                href="mailto:support@clawsetup.ai"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em]">
              &copy; {currentYear} ClawSetup AI. The World&apos;s #1 AI Deployment Platform.
            </p>
            <p className="text-[10px] text-zinc-600 font-medium">
              Enterprise Grade Security & Automated Infrastructure for OpenClaw.
            </p>
          </div>
          
          {/* Payment Methods */}
          <div className="flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Secure SSL</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
