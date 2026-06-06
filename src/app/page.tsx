import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Pricing } from "@/components/pricing"
import { Testimonials } from "@/components/testimonials"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* SEO JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                "name": "ClawSetup AI",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Linux",
                "offers": {
                  "@type": "Offer",
                  "price": "9.00",
                  "priceCurrency": "USD"
                },
                "description": "Automated, secure, and production-ready hosting and deployment for OpenClaw AI assistant nodes."
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "What is included in the setup service?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Our setup service includes complete installation and configuration of the OpenClaw AI assistant on your VPS, security hardening with firewall rules and SSL certificates, dependency installation, performance optimization, and thorough testing."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Which VPS providers do you support?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "We support all major VPS providers including DigitalOcean, Linode, Vultr, AWS EC2, Google Cloud Platform, Azure, and any other provider that offers Ubuntu or Debian-based servers with SSH access."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is my OpenAI API key secure?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Absolutely. Your API key is handled with the highest security standards. We use encrypted storage, secure transmission protocols, and the key is only used during the setup process."
                    }
                  }
                ]
              }
            ]
          }),
        }}
      />
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  )
}
