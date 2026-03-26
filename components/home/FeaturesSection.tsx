import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  { title: "Streaks that make sense", desc: "Calculated from time-series logs—no manual streak storage." },
  { title: "Monthly grid like GitHub", desc: "Rows are habits, columns are days. One glance for consistency." },
  { title: "Analytics & success rate", desc: "Know how consistent you are, not just what’s done." },
  { title: "Cross-platform workflow", desc: "Same Next.js codebase for web, iOS (Capacitor), and Windows (Electron)." },
]

export default function FeaturesSection() {
  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Everything you need</h2>
          <p className="mt-2 text-muted-foreground text-sm">Modern UX with time-series correctness under the hood.</p>
        </div>
        <div className="hidden sm:block text-xs text-muted-foreground">Optimized for mobile & desktop</div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((f) => (
          <Card key={f.title} className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 opacity-60" />
            <CardHeader className="relative pb-2">
              <CardTitle className="text-base">{f.title}</CardTitle>
            </CardHeader>
            <CardContent className="relative text-sm text-muted-foreground">{f.desc}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

