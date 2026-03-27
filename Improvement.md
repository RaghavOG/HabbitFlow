# HabitFlow Improvements Backlog

This file tracks practical, high-impact improvements to make HabitFlow more robust and polished.

## Product / UX
- Add onboarding preferences (routine template selector + optional skip).
- Add filters/tags for habits (Morning, Afternoon, Evening, Night) to reduce dashboard noise.
- Add compact and expanded dashboard modes for mobile.
- Add undo snackbar for destructive actions (delete habit, reset month).
- Add per-habit note/tooltip editing directly in grid rows.

## Analytics
- Add habit completion heatmap (calendar view) alongside line chart.
- Add trend comparisons (current month vs previous month).
- Add “at-risk habits” widget (drop in completion rate).
- Add weekly and quarterly views in addition to monthly.

## Data / API
- Add server-side validation for color values (`#RRGGBB`) and name length limits.
- Add unique habit name constraint per user (case-insensitive) to prevent duplicates.
- Add pagination/limits to heavy dashboard responses for very large habit sets.
- Add route-level request schema validation with Zod.

## Auth / Security
- Add rate limiting for write-heavy endpoints (`/api/logs/toggle`, `/api/habits/*`).
- Add audit logging for account-level changes (habit create/edit/delete/reset).
- Add webhook replay protection logging + monitoring dashboard.

## Performance
- Debounce rapid drag toggles into batch API write endpoint.
- Optimize dashboard query with precomputed month cache for read-heavy traffic.
- Add Redis layer for AI weekly report and dashboard payload caching.

## Testing / Quality
- Add API integration tests (auth, dashboard aggregation, toggle logic).
- Add end-to-end tests for mobile grid interactions and auth redirects.
- Add visual regression snapshots for dashboard layouts.
- Enforce stricter CI gates (`typecheck`, `lint`, tests) on pull requests.

## PWA / Desktop
- Implement service worker caching strategy (offline dashboard read).
- Add install prompt UX for PWA.
- Add Electron auto-update flow and signed builds for Windows.
- Add local-first queueing for offline toggle sync.

