"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export default function SigninPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
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
                const res = await fetch("/api/auth/signin", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password }),
                })
                const json = (await res.json()) as { error?: string }
                if (!res.ok) throw new Error(json.error || "Signin failed")
                router.push("/")
                router.refresh()
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Signin failed")
              } finally {
                setLoading(false)
              }
            }}
          >
            {loading ? (
              <>
                <Spinner className="mr-2" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <Button variant="outline" className="w-full" onClick={() => router.push("/signup")} disabled={loading}>
            Create a new account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

