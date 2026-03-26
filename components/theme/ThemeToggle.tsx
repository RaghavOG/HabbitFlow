"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const checked = resolvedTheme === "dark"

  if (!mounted) return null

  return (
    <div className="flex items-center gap-2">
      <Sun className="size-4 text-muted-foreground" />
      <Switch
        checked={checked}
        onCheckedChange={(next) => setTheme(next ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
      <Moon className="size-4 text-muted-foreground" />
    </div>
  )
}

