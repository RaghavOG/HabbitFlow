"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme/ThemeToggle"
import { Sparkles } from "lucide-react"
import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs"

export default function Navbar() {
  const pathname = usePathname()

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

          <Show when="signed-out">
            <div className="hidden sm:flex items-center gap-2">
              <SignInButton>
                <Button variant="outline" size="sm">Login</Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Get started</Button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  )
}

