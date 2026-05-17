import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white/5 border border-white/10",
            headerTitle: "text-white",
            headerSubtitle: "text-zinc-400",
            socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
            formFieldLabel: "text-zinc-400",
            formFieldInput: "bg-white/5 border-white/10 text-white",
            footerActionLink: "text-violet-400 hover:text-violet-300",
            formButtonPrimary: "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500",
            identityPreviewText: "text-white",
            identityPreviewEditButton: "text-violet-400",
            formFieldAction: "text-violet-400",
            alertText: "text-white",
            alert: "bg-red-500/10 border-red-500/20",
          },
        }}
      />
    </div>
  )
}
