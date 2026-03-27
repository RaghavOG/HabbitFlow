# Changelog

## v1.3.0
- Clerk-auth aware landing page CTA:
  - signed-out users see `Get Started` / `Login`
  - signed-in users see `Go to Dashboard`
- One-click routine seed endpoint and dashboard action:
  - `POST /api/habits/seed-morning-routine`
  - morning/afternoon/evening/night color grouping
  - idempotent by habit name
  - default `goalPerMonth` equals selected month length
- Dashboard UX updates:
  - reverse habit display order
  - mobile auto-scroll to current date column
  - collapsible/scrollable habit list section on smaller screens
- Analytics update:
  - monthly graph supports per-habit line series

## v1.1.0
- AI weekly insights card on the dashboard
- `POST /api/ai/weekly-report` (and `POST /api/ai/report` alias) with Mongo caching
- Documentation additions (API + architecture)

## v1.0.0
- Habit tracking matrix (days-by-habit grid)
- Streak calculation from completed days history
- Success rate + progress analytics
- Monthly performance chart
- Auth with httpOnly cookie + JWT
- Dark/Light theme

## v1.2.0 (Planned)
- Reminders
- Offline sync
- Export data
- PWA service worker wiring
- Improved desktop (Electron) packaging/UX

