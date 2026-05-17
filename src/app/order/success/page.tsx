import Link from "next/link"
import { CheckCircle, MessageCircle, ArrowLeft, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Order Confirmed - ClawSetup AI",
  description: "Your order has been received. We'll start working on your setup right away.",
}

export default function OrderSuccessPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="bg-white/5 border-white/10 text-center">
          <CardContent className="pt-12 pb-8 px-6">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Order Received!
            </h1>
            <p className="text-zinc-400 mb-8">
              Thank you for your order. We&apos;ve received your details and will begin working on your setup shortly.
            </p>

            {/* Next Steps */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 bg-white/5 rounded-lg p-4">
                <Clock className="w-5 h-5 text-violet-400" />
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Setup in Progress</p>
                  <p className="text-zinc-500 text-xs">We&apos;ll contact you via WhatsApp with updates</p>
                </div>
              </div>
              
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-green-500/10 rounded-lg p-4 hover:bg-green-500/20 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">Questions?</p>
                    <p className="text-zinc-500 text-xs">Chat with us on WhatsApp</p>
                  </div>
                </a>
              )}
            </div>

            {/* Back Button */}
            <Link href="/">
              <Button variant="outline" className="w-full rounded-full border-white/20 hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
