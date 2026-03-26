"use client"

import * as React from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateKeyUTC } from "@/utils/date"

type DashboardHabit = {
  _id: string
  name: string
  color: string
  goalPerMonth: number
  completedDays: number
  successRate: number
  streak: number
  progress: number
  logs: Record<string, boolean>
}

function getDaysInMonth(year: number, month: number) {
  // month is 1-12
  return new Date(year, month, 0).getDate()
}

export default function MonthlyGraph({ habits, year, month }: { habits: DashboardHabit[]; year: number; month: number }) {
  const days = React.useMemo(() => Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1), [year, month])

  const data = React.useMemo(() => {
    return days.map((day) => {
      const dateUtc = new Date(Date.UTC(year, month - 1, day))
      const dateKey = formatDateKeyUTC(dateUtc)

      let trackedCount = 0
      let doneCount = 0
      for (const h of habits) {
        const tracked = Object.prototype.hasOwnProperty.call(h.logs, dateKey)
        if (!tracked) continue
        trackedCount += 1
        if (h.logs[dateKey] === true) doneCount += 1
      }
      const rate = trackedCount === 0 ? 0 : (doneCount / trackedCount) * 100
      return { day, dateKey, rate }
    })
  }, [days, habits, month, year])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Monthly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${Math.round(v)}%`} />
              <Tooltip
                formatter={(value: unknown) => `${Math.round(Number(value))}%`}
              />
              <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

