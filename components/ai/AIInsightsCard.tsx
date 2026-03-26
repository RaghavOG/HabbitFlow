"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

type WeeklyAIResponse = {
  weekKey: string
  bullets: string[]
}

export default function AIInsightsCard() {
  const [bullets, setBullets] = React.useState<string[] | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const requestedRef = React.useRef(false)

  React.useEffect(() => {
    if (requestedRef.current) return
    requestedRef.current = true

    setLoading(true)
    fetch("/api/ai/weekly-report", { method: "POST", credentials: "include" })
      .then(async (res) => {
        const json = (await res.json()) as Partial<WeeklyAIResponse> & { error?: string }
        if (!res.ok) throw new Error(json.error || "Failed to load AI insights")
        setBullets(json.bullets ?? [])
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load AI insights"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className="border-zinc-800 bg-zinc-900/30 shadow-sm rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          <Sparkles className="size-4 text-blue-400" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {loading && !bullets ? (
          <div className="text-zinc-400">Generating weekly insights…</div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : bullets && bullets.length ? (
          <ul className="list-disc pl-5 text-zinc-300 space-y-1">
            {bullets.slice(0, 3).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        ) : (
          <div className="text-zinc-400">No insights yet. Check back next week.</div>
        )}
      </CardContent>
    </Card>
  )
}

