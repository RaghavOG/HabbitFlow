import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export type DashboardHabit = {
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

export type DashboardState = {
  habitsByMonthKey: Record<string, DashboardHabit[]>
}

const initialState: DashboardState = {
  habitsByMonthKey: {},
}

function recomputeRates(habit: DashboardHabit, nextLogs: Record<string, boolean>) {
  // Completed days = number of logs with status true.
  let computedCompleted = 0
  for (const key of Object.keys(nextLogs)) {
    if (nextLogs[key] === true) computedCompleted += 1
  }

  const totalTrackedDays = Object.keys(nextLogs).length
  const successRate = totalTrackedDays === 0 ? 0 : (computedCompleted / totalTrackedDays) * 100
  const progress = habit.goalPerMonth > 0 ? (computedCompleted / habit.goalPerMonth) * 100 : 0

  return {
    completedDays: computedCompleted,
    successRate,
    progress,
    logs: nextLogs,
  }
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardMonthHabits: (
      state,
      action: PayloadAction<{ monthKey: string; habits: DashboardHabit[] }>
    ) => {
      state.habitsByMonthKey[action.payload.monthKey] = action.payload.habits
    },

    optimisticToggleHabitDay: (
      state,
      action: PayloadAction<{ habitId: string; dateKey: string }>
    ) => {
      const { habitId, dateKey } = action.payload
      const monthKeys = Object.keys(state.habitsByMonthKey)

      for (const monthKey of monthKeys) {
        const habits = state.habitsByMonthKey[monthKey]
        const idx = habits.findIndex((h) => h._id === habitId)
        if (idx === -1) continue

        const habit = habits[idx]
        const prevTracked = Object.prototype.hasOwnProperty.call(habit.logs, dateKey)
        const prevDone = habit.logs[dateKey] === true

        const nextLogs = { ...habit.logs }
        let nextDone: boolean
        if (prevTracked) {
          nextDone = !prevDone
          nextLogs[dateKey] = nextDone
        } else {
          // Not tracked yet in this month: create completed day.
          nextDone = true
          nextLogs[dateKey] = true
        }

        const updated = recomputeRates(habit, nextLogs)
        habits[idx] = {
          ...habit,
          ...updated,
        }

        state.habitsByMonthKey[monthKey] = [...habits]
      }
    },

    optimisticMarkDoneHabitDay: (
      state,
      action: PayloadAction<{ habitId: string; dateKey: string }>
    ) => {
      const { habitId, dateKey } = action.payload
      const monthKeys = Object.keys(state.habitsByMonthKey)

      for (const monthKey of monthKeys) {
        const habits = state.habitsByMonthKey[monthKey]
        const idx = habits.findIndex((h) => h._id === habitId)
        if (idx === -1) continue

        const habit = habits[idx]
        const prevDone = habit.logs[dateKey] === true
        if (prevDone) continue

        const nextLogs = { ...habit.logs, [dateKey]: true }
        const updated = recomputeRates(habit, nextLogs)
        habits[idx] = {
          ...habit,
          ...updated,
        }

        state.habitsByMonthKey[monthKey] = [...habits]
      }
    },
  },
})

export const {
  setDashboardMonthHabits,
  optimisticToggleHabitDay,
  optimisticMarkDoneHabitDay,
} = dashboardSlice.actions

export default dashboardSlice.reducer

