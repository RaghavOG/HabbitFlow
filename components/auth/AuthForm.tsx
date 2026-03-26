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
      <div className="w-full max-w-sm relative">
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-blue-500/10 via-emerald-500/10 to-transparent blur-2xl" />

        <Card className="bg-card/80 backdrop-blur shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && <div className="text-sm text-destructive">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Raghav" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <Button
              className="w-full"
              disabled={loading}
              onClick={async () => {
                setError(null)
                setLoading(true)
                try {
                  const body =
                    mode === "signup"
                      ? { email, password, name: name || undefined }
                      : { email, password }

                  const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(body),
                  })
                  const json = (await res.json()) as { error?: string }
                  if (!res.ok) throw new Error(json.error || "Request failed")

                  // On success, api sets cookie; let navbar redirect by refreshing.
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
  )
}

