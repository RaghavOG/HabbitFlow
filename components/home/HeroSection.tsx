import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HeroSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground rounded-full border px-3 py-1">
          HabitFlow
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Time-series habit analytics
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">Build consistency, not just habits.</h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          A modern habit tracking dashboard inspired by contribution graphs, with streak calculation, success-rate consistency,
          and month-by-month progress.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signin">Login</Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
          <Card className="bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">One log per day</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">Guaranteed by a unique compound index.</CardContent>
          </Card>
          <Card className="bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Streaks are computed</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">No stored streaks, always accurate.</CardContent>
          </Card>
        </div>
      </div>

      <div className="relative">
        <div className="rounded-2xl border bg-card/70 shadow-sm p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Monthly Analytics</div>
              <div className="text-xs text-muted-foreground">Grid + progress in one view</div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-emerald-500/30 border" />
          </div>

          <div className="mt-4 rounded-xl bg-muted/30 p-4">
            <div className="text-xs text-muted-foreground">Example</div>
            <div className="mt-2 flex items-end gap-3">
              <div className="w-full">
                <div className="h-16 rounded-lg bg-gradient-to-r from-emerald-500/20 via-blue-500/10 to-transparent" />
                <div className="mt-3 grid grid-cols-7 gap-2">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-3 rounded bg-muted/50"
                      style={{
                        background: i % 3 === 0 ? "linear-gradient(135deg, rgba(34,197,94,.5), rgba(59,130,246,.3))" : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Toggle a day to create/update a log. Streak + success-rate are derived from those logs.
          </div>
        </div>
      </div>
    </section>
  )
}

