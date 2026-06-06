"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#testimonials", label: "Reviews" },
  { href: "/#faq", label: "FAQ" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isSignedIn, isLoaded } = useUser()

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className="mx-4 mt-4 md:mx-8 lg:mx-12">
        <div className="bg-glass bg-glass-hover rounded-2xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-[52px] h-[52px]">
                <Image 
                  src="/logo.png" 
                  alt="ClawSetup AI" 
                  fill
                  className="object-contain brightness-110 group-hover:rotate-12 transition-all duration-300" 
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl text-white tracking-tighter leading-none">ClawSetup-AI</span>
                <span className="text-violet-500 font-black text-[10px] tracking-[0.25em] leading-none mt-1.5">VPS ORCHESTRATION</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {isSignedIn && (
                <Link
                  href="/dashboard"
                  className="text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Desktop CTA Buttons — always renders, no Clerk SSR flicker */}
            <div className="hidden md:flex items-center gap-3">
              {!isLoaded || !isSignedIn ? (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 px-6 font-bold uppercase tracking-widest text-[10px]">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button variant="gradient" className="rounded-xl px-8 font-black shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:scale-105 transition-all">
                      Sign Up — Free
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-white/5 px-4 font-bold text-xs">
                      Console
                    </Button>
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-2 bg-glass rounded-2xl p-6"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-zinc-400 hover:text-white transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                ))}

                {isSignedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="text-violet-400 font-bold transition-colors py-2"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 rounded-full mt-2">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                      <Button variant="gradient" className="w-full rounded-full mt-2">
                        Sign Up — Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}
