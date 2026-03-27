"use client"

import * as React from "react"
import { GitCommitHorizontal, TrendingUp, Zap, Smartphone, Brain, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: GitCommitHorizontal,
    title: "GitHub-style Grid",
    desc: "Rows are habits, columns are days. One glance reveals consistency patterns across your entire month.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: TrendingUp,
    title: "Real-time Streaks",
    desc: "Calculated live from time-series logs — no manual streak storage, always perfectly accurate.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Zap,
    title: "Drag & Drop Habits",
    desc: "Reorder your habits with intuitive drag-and-drop — structure your routines exactly how you think.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Brain,
    title: "AI Insights",
    desc: "Get personalized habit insights powered by AI — understand your patterns and unlock improvements.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: Smartphone,
    title: "Cross-platform",
    desc: "Same Next.js codebase for web, iOS via Capacitor, and Windows via Electron — everywhere you are.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Success Analytics",
    desc: "Track success rates, heatmaps, trend comparisons, and at-risk habits — all in one dashboard.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
]

export default function FeaturesSection() {
  return (
    <section className="mt-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-4">
          Everything you need
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Built for{" "}
          <span className="gradient-text">serious habit builders</span>
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Modern UX with time-series correctness under the hood. Designed to give you clarity, not complexity.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <div
            key={f.title}
            className={`card-hover glass-card rounded-2xl p-6 animate-fade-in-up`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`inline-flex size-10 items-center justify-center rounded-xl ${f.bg} mb-4`}>
              <f.icon className={`size-5 ${f.color}`} />
            </div>
            <h3 className="font-semibold text-base mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
