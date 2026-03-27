"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, CheckCircle2, Flame, BarChart3 } from "lucide-react"

const stats = [
  { label: "Active Habits Tracked", value: "2.4M+" },
  { label: "Streak Days Logged", value: "18M+" },
  { label: "Success Rate Avg", value: "74%" },
]

const miniFeatures = [
  { icon: CheckCircle2, label: "One log per day", sub: "Guaranteed by unique compound index" },
  { icon: Flame, label: "Computed streaks", sub: "Always accurate, never stored wrong" },
  { icon: BarChart3, label: "Monthly analytics", sub: "GitHub-style grid + trend charts" },
]

export default function HeroSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
      {/* LEFT */}
      <div className="animate-fade-in-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-4 py-1.5 text-xs font-medium text-primary shadow-sm mb-6">
          <Sparkles className="size-3.5" />
          HabitFlow — Time-series Habit Analytics
          <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.08] mb-5">
          Build{" "}
          <span className="gradient-text">Consistency,</span>
          <br />
          Not Just Habits.
        </h1>

        {/* Subtext */}
        <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mb-8">
          A modern habit-tracking dashboard inspired by GitHub contribution graphs — with real streak calculation, 
          month-by-month analytics, and AI insights to keep you on track.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <Button asChild size="lg" className="btn-glow rounded-xl bg-primary text-primary-foreground font-semibold">
            <Link href="/signup">
              Get Started Free <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-6 border-t border-border/60 pt-8">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — visual dashboard preview */}
      <div className="animate-fade-in-up delay-200 relative">
        {/* Glow backdrop */}
        <div className="absolute inset-0 scale-95 rounded-3xl bg-gradient-to-br from-blue-500/15 via-emerald-500/10 to-violet-500/10 blur-2xl -z-10" />

        <div className="glass-card rounded-2xl p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">Monthly Dashboard</div>
              <div className="text-xs text-muted-foreground mt-0.5">March 2026 • 27 days tracked</div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Streak", value: "14d", color: "text-orange-500" },
              { label: "Rate", value: "82%", color: "text-emerald-500" },
              { label: "Done", value: "22", color: "text-blue-500" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border/60 bg-background/60 p-3 text-center">
                <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Habit grid preview */}
          <div className="rounded-xl bg-muted/40 p-4 space-y-2">
            <div className="text-xs font-medium text-muted-foreground mb-3">Habit Grid Preview</div>
            {["Morning Run", "Read 30min", "Meditate"].map((habit, hi) => (
              <div key={habit} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20 truncate">{habit}</span>
                <div className="flex gap-1 flex-1">
                  {Array.from({ length: 27 }).map((_, i) => {
                    const done = Math.random() > (hi * 0.15 + 0.3)
                    const isFuture = i >= 27
                    return (
                      <div
                        key={i}
                        className="h-3 flex-1 rounded-sm"
                        style={{
                          backgroundColor: isFuture
                            ? "oklch(0.85 0 0)"
                            : done
                            ? ["#22c55e", "#3b82f6", "#a855f7"][hi]
                            : "oklch(0.88 0 0 / 0.5)",
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Chart preview */}
          <div className="rounded-xl bg-muted/30 h-16 flex items-end gap-1 px-3 pb-2 overflow-hidden">
            {Array.from({ length: 27 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-blue-500/70 to-emerald-500/40"
                style={{ height: `${30 + Math.sin(i * 0.4) * 20 + (i / 27) * 30}%` }}
              />
            ))}
          </div>
        </div>

        {/* Mini feature chips */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          {miniFeatures.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="card-hover flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-2.5 backdrop-blur"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-3.5 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
