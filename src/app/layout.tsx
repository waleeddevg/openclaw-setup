import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/sonner"
import { WhatsAppButton } from "@/components/whatsapp-button"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ClawSetup AI — Professional OpenClaw Node Hosting",
  description: "Automated, secure, and production-ready hosting for your OpenClaw AI assistant nodes.",
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: "ClawSetup AI — Professional OpenClaw Node Hosting",
    description: "Automated, secure, and production-ready hosting for your OpenClaw AI assistant nodes.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!clerkKey || clerkKey === "pk_test_placeholder") {
    // Run without Clerk when keys are not configured
    return (
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://curious-gannet-57.clerk.accounts.dev" />
          <link rel="dns-prefetch" href="https://curious-gannet-57.clerk.accounts.dev" />
        </head>
        <body className={`${inter.className} bg-[#0a0a0a] text-white min-h-screen relative overflow-x-hidden`}>
          {/* Animated Background Blobs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="blob left-[-10%] top-[-10%] opacity-20" />
            <div className="blob right-[-10%] bottom-[-10%] opacity-20 bg-blue-500/20" />
            <div className="blob left-[30%] top-[40%] opacity-10 bg-pink-500/10" />
          </div>
          <div className="relative z-0">
            {children}
          </div>
          <Toaster position="bottom-right" />
          <WhatsAppButton />
        </body>
      </html>
    )
  }

  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://curious-gannet-57.clerk.accounts.dev" />
          <link rel="dns-prefetch" href="https://curious-gannet-57.clerk.accounts.dev" />
        </head>
        <body className={`${inter.className} bg-[#0a0a0a] text-white min-h-screen relative overflow-x-hidden`}>
          {/* Animated Background Blobs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="blob left-[-10%] top-[-10%] opacity-20" />
            <div className="blob right-[-10%] bottom-[-10%] opacity-20 bg-blue-500/20" />
            <div className="blob left-[30%] top-[40%] opacity-10 bg-pink-500/10" />
          </div>
          <div className="relative z-0">
            {children}
          </div>
          <Toaster position="bottom-right" />
          <WhatsAppButton />
        </body>
      </html>
    </ClerkProvider>
  )
}
