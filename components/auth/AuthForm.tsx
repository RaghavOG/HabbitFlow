"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type Mode = "signin" | "signup"

export default function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = React.useState("")
  const [name, setName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/signin"
  const title = mode === "signup" ? "Create your account" : "Welcome back"
  const primary = mode === "signup" ? "Sign up" : "Sign in"

  const otherHref = mode === "signup" ? "/signin" : "/signup"
  const otherLabel = mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <aside className="hidden md:flex flex-col gap-4 px-4">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 ring-1 ring-zinc-800">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 2l1.5 4.8L18 8.3l-4.5 1.5L12 14l-1.5-4.2L6 8.3l4.5-1.5L12 2z" fill="currentColor" opacity="0.9" />
                <path d="M19 13l.9 2.7L23 17l-3.1 1.3L19 21l-.9-2.7L15 17l3.1-1.3L19 13z" fill="currentColor" opacity="0.65" />
              </svg>
            </span>
            <span className="font-semibold tracking-tight text-lg">HabitFlow</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold leading-tight">Build streaks. Track time-series.</h2>
            <p className="text-sm text-muted-foreground">
              A clean habit matrix dashboard with streaks, success-rate analytics, and AI weekly insights.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4 space-y-3">
            <div className="text-sm font-medium text-zinc-200">What you get</div>
            <ul className="text-sm text-zinc-300 space-y-2 list-disc pl-5">
              <li>Monthly grid (rows = habits, columns = days)</li>
              <li>Streaks + success rate computed from logs</li>
              <li>AI weekly report (falls back if OpenAI key is missing)</li>
              <li>Mobile-friendly marking (click + drag)</li>
            </ul>
          </div>

          <div className="text-xs text-zinc-400">
            Your data stays private: habits belong to your account via authenticated API routes.
          </div>
        </aside>

        <div className="w-full max-w-sm relative mx-auto md:mx-0">
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-blue-500/10 via-emerald-500/10 to-transparent blur-2xl" />

          <Card className="bg-card/80 backdrop-blur shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && <div className="text-sm text-destructive">{error}</div>}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Raghav" autoComplete="name" />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
              </div>

              <Button
                className="w-full"
                disabled={loading}
                onClick={async () => {
                  setError(null)
                  setLoading(true)
                  try {
                    const body = mode === "signup" ? { email, password, name: name || undefined } : { email, password }

                    const res = await fetch(endpoint, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify(body),
                    })
                    const json = (await res.json()) as { error?: string }
                    if (!res.ok) throw new Error(json.error || "Request failed")

                    // On success, api sets cookie; redirect to dashboard.
                    window.location.href = "/dashboard"
                  } catch (e: unknown) {
                    setError(e instanceof Error ? e.message : "Request failed")
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                {loading ? (
                  <>
                    <Spinner className="mr-2 inline-block" />
                    {primary}...
                  </>
                ) : (
                  primary
                )}
              </Button>

              <div className="text-sm text-muted-foreground">
                <Link className="underline underline-offset-4 hover:text-foreground" href={otherHref}>
                  {otherLabel}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

