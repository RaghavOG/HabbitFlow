# API Documentation

All API routes are implemented as Next.js App Router route handlers under `app/api/*`.

Authentication:
- Most user data endpoints require an authenticated session via the existing httpOnly JWT cookie.
- If unauthenticated, you’ll receive `401 Unauthorized` with `{ error: "Unauthorized" }` (or `user: null` for `/api/auth/me`).

## `GET /api/dashboard`

Returns the dashboard payload for the requested month.

Query params:
- `year` (optional, defaults to current year)
- `month` (optional, defaults to current month; `1-12`)

Response (`200`):
```json
{
  "year": 2026,
  "month": 3,
  "habits": [
    {
      "_id": "habitId",
      "name": "Gym",
      "color": "#22c55e",
      "goalPerMonth": 20,
      "completedDays": 12,
      "successRate": 60,
      "streak": 4,
      "progress": 60,
      "logs": { "YYYY-MM-DD": true }
    }
  ]
}
```

## `POST /api/habits`

Create a new habit for the authenticated user.

Body:
```json
{ "name": "Gym", "color": "#22c55e", "goalPerMonth": 20 }
```

Notes:
- `name` is required
- `goalPerMonth` defaults to `20` if not provided

Response (`201`):
```json
{ "habit": { "_id": "habitId", "name": "...", "color": "...", "goalPerMonth": 20, "userId": "..." } }
```

## `POST /api/logs/toggle`

Toggle a habit log for a specific date.

Body:
```json
{ "habitId": "habitId", "date": "YYYY-MM-DD" }
```

Response (`200`):
```json
{
  "habitId": "habitId",
  "date": "YYYY-MM-DD",
  "status": true
}
```

## `GET /api/logs`

Get all logs for one habit for a given month.

Query params:
- `habitId` (required)
- `year` (optional, defaults to current year)
- `month` (optional, defaults to current month; `1-12`)

Response (`200`):
```json
{
  "habitId": "habitId",
  "year": 2026,
  "month": 3,
  "logs": [
    { "_id": "logId", "habitId": "habitId", "date": "2026-03-01T00:00:00.000Z", "status": true }
  ]
}
```

Implementation note:
- This endpoint is a convenience wrapper around the existing `GET /api/logs/:habitId` functionality.

## `POST /api/ai/report`

Alias route for generating the weekly AI insights.

Response (`200`):
```json
{
  "weekKey": "YYYY-MM-DD",
  "bullets": ["...", "...", "..."],
  "dailyMotivation": "...",
  "habitSuggestions": "...",
  "productivityTips": "...",
  "streakWarning": "..."
}
```

Underlying route:
- `POST /api/ai/weekly-report`

