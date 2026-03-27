"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme/ThemeToggle"
import { Sparkles } from "lucide-react"
import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/85 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/25 to-emerald-500/25 border border-border/60 shadow-sm">
              <Sparkles className="size-4 text-primary" />
            </span>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              HabitFlow
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 ml-2">
            {navLinks.map(({ href, label }) => (
              <Button
                key={href}
                asChild
                variant={pathname === href ? "secondary" : "ghost"}
                size="sm"
                className={cn("rounded-lg text-sm", pathname === href && "font-medium")}
              >
                <Link href={href}>{label}</Link>
              </Button>
            ))}
          </nav>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Show when="signed-out">
            <div className="hidden sm:flex items-center gap-2">
              <SignInButton>
                <Button variant="ghost" size="sm" className="rounded-lg">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm" className="rounded-lg btn-glow font-medium">
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-8 rounded-xl",
                },
              }}
            />
          </Show>
        </div>
      </div>
    </header>
  )
}
