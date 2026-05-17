import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { isAdmin } from "@/lib/auth"
import Link from "next/link"
import { LayoutDashboard, ClipboardList, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignOutButton } from "@clerk/nextjs"

export const metadata = {
  title: "Dashboard - ClawSetup AI",
  description: "Admin dashboard for managing orders",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  
  if (!user) {
    redirect("/sign-in")
  }

  const admin = await isAdmin()
  
  // No longer redirecting non-admins. They can see their own orders.

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white/5 border-r border-white/10 p-6">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-white">ClawSetup</span>
            <span className="text-violet-400 font-semibold">AI</span>
          </Link>
          <p className="text-sm text-zinc-500 mt-1">Admin Dashboard</p>
        </div>

        <nav className="space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-2 text-zinc-400 hover:text-white hover:bg-white/10">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="ghost" className="w-full justify-start gap-2 text-zinc-400 hover:text-white hover:bg-white/10">
              <ClipboardList className="w-4 h-4" />
              Orders
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <SignOutButton>
            <Button variant="ghost" className="w-full justify-start gap-2 text-zinc-400 hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
