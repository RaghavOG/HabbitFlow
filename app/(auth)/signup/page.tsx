"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [name, setName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Name (optional)</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Raghav" />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Password</div>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setError(null)
              setLoading(true)
              try {
                const res = await fetch("/api/auth/signup", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password, name: name || undefined }),
                })
                const json = (await res.json()) as { error?: string }
                if (!res.ok) throw new Error(json.error || "Signup failed")
                router.push("/")
                router.refresh()
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Signup failed")
              } finally {
                setLoading(false)
              }
            }}
          >
            {loading ? (
              <>
                <Spinner className="mr-2" /> Creating...
              </>
            ) : (
              "Sign up"
            )}
          </Button>

          <Button variant="outline" className="w-full" onClick={() => router.push("/signin")} disabled={loading}>
            I already have an account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

