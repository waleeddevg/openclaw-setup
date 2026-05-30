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
  keywords: ["OpenClaw", "AI hosting", "VPS", "automation", "ClawSetup", "Node orchestration"],
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: "ClawSetup AI — Professional OpenClaw Node Hosting",
    description: "Automated, secure, and production-ready hosting for your OpenClaw AI assistant nodes.",
    type: "website",
    url: "https://openclaw-setup-niem.vercel.app/",
    images: [
      {
        url: "https://openclaw-setup-niem.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClawSetup AI dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawSetup AI — Professional OpenClaw Node Hosting",
    description: "Automated, secure, and production-ready hosting for your OpenClaw AI assistant nodes.",
    images: ["https://openclaw-setup-niem.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://openclaw-setup-niem.vercel.app/",
  },
};

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
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "7rx8FFb267dVuATHqI-8Gxore19L-ThUAvViUYuhBGk"} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="author" content="ClawSetup AI Team" />
          <link rel="canonical" href="https://openclaw-setup-niem.vercel.app/" />
          <meta name="description" content="Automated, secure, and production-ready hosting for your OpenClaw AI assistant nodes." />
          <meta name="keywords" content="OpenClaw, AI hosting, VPS, automation, ClawSetup, Node orchestration" />
          <meta name="robots" content="index, follow" />
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
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "7rx8FFb267dVuATHqI-8Gxore19L-ThUAvViUYuhBGk"} />
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
