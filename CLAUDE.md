# CLAUDE.md

## Project Name

HabitFlow - Cross Platform Habit Tracker (Web + iOS + Windows)

## Project Overview

HabitFlow is a habit tracking application that works on Web, iOS, and Windows desktop using a single Next.js codebase.
Users can create habits, mark them complete daily, track streaks, view monthly grids, and see analytics like success rate and progress.

---

## Tech Stack

* Frontend: Next.js (App Router)
* Backend: Next.js API Routes (No separate backend)
* Database: MongoDB (Mongoose)
* UI: shadcn/ui + Tailwind CSS
* Charts: Chart.js
* Mobile App: Capacitor (iOS)
* Desktop App: Electron (Windows .exe)

---

## Project Structure

/app                -> Next.js app router pages
/components         -> UI components (Grid, Charts, Cards)
/components/ui      -> shadcn components
/models             -> Mongoose models
/app/api            -> API routes
/lib                -> DB connection, utilities
/utils              -> Streak, success rate, calculations
/electron           -> Electron app setup
/capacitor          -> iOS app setup

---

## Database Models

### Habit

* name
* color
* goalPerMonth
* createdAt

### HabitLog

* habitId
* date
* status (true/false)

Rule:
One habit can only have one log per date.

---

## Core Logic Rules

### Habit Log System

When user clicks a day in the grid:

* If log exists → toggle status
* If log does not exist → create log

### Streak Calculation

Streak = number of continuous completed days counting backwards from today.

### Success Rate

successRate = completedDays / totalDays * 100

### Progress

progress = completedDays / goalPerMonth * 100

---

## API Routes

### Habits

POST   /api/habits        -> Create habit
GET    /api/habits        -> Get all habits
DELETE /api/habits/:id    -> Delete habit

### Logs

POST   /api/logs/toggle   -> Toggle habit for a date
GET    /api/logs/:habitId -> Get logs for a habit

---

## UI Rules

* Dashboard shows monthly grid (table format)
* Rows = Habits
* Columns = Days of month
* Cell = Habit completion status
* Use colors per habit
* Show progress bar on right
* Show success rate on top
* Show line chart for monthly performance

---

## Coding Rules

* Use functional components
* Use async/await
* Use server actions or API routes
* Use MongoDB via Mongoose models
* Keep business logic in /utils
* Keep UI in /components
* Keep API logic in /app/api

---

## Important Notes

This app is designed as a time-series tracking system.
Do NOT store only boolean habit status.
Always store habit logs per date.

This ensures:

* Streak calculation
* Monthly grid
* Analytics
* History tracking

---

## Future Features

* Reminders
* Notifications
* Habit notes
* Data export
* User login
* Cloud sync
