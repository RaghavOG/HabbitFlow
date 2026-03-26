"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroSection from "@/components/home/HeroSection"
import FeaturesSection from "@/components/home/FeaturesSection"

export default function Home() {
  return (
    <main className="relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-pulse [animation-delay:600ms]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
      </div>

      <section className="mx-auto w-full max-w-6xl px-4 pt-14 pb-10">
        <HeroSection />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <FeaturesSection />
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="bg-primary">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signin">Login</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

