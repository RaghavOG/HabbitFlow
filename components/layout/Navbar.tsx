"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme/ThemeToggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sparkles } from "lucide-react"

type MeResponse = { user: null | { _id: string; email: string; name?: string } }

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = React.useState<MeResponse["user"]>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
        if (!res.ok) return
        const json = (await res.json()) as MeResponse
        if (mounted) setUser(json.user ?? null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    setUser(null)
    router.push("/signin")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 ring-1 ring-zinc-800">
                <Sparkles className="size-4 text-emerald-300" />
              </span>
              HabitFlow
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            <Button
              asChild
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              size="sm"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl"
                  aria-label="Account menu"
                >
                  <Avatar className="size-7">
                    <AvatarFallback>
                      {user.name ? user.name.slice(0, 1).toUpperCase() : user.email.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{user.name ? user.name : "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">My dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/signin">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

