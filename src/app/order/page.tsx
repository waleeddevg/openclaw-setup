import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { OrderForm } from "@/components/order-form"
import { SetupGuide } from "@/components/setup-guide"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, Shield, Clock } from "lucide-react"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Order Setup - ClawSetup AI",
  description: "Submit your VPS details and our automated system will have your OpenClaw AI assistant up and running in minutes.",
}

export default async function OrderPage() {
  // Enforce sign-in: check if the active user is logged in
  const user = await currentUser()
  if (!user) {
    // Redirect to sign in, then redirect back to /order after login succeeds
    redirect("/sign-in?redirect_url=/order")
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Start Your </span>
              <span className="text-gradient">AI Setup</span>
            </h1>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Fill out the form below and we&apos;ll get your OpenClaw AI assistant set up professionally on your VPS.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Sparkles, title: "Automated Setup", desc: "Fully automated deployment" },
              { icon: Shield, title: "Secure & Safe", desc: "AES-256 encrypted credentials" },
              { icon: Clock, title: "~5 Min Delivery", desc: "Live in under 5 minutes" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{item.title}</p>
                  <p className="text-sm text-zinc-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Guide */}
            <div className="lg:col-span-5 space-y-8">
              <SetupGuide />
            </div>

            {/* Right Column: Order Form */}
            <div className="lg:col-span-7">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Order Details</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Provide your details and we&apos;ll start the automated setup.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
