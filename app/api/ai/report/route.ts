import { POST as weeklyReportPost } from "../weekly-report/route"

// Alias route for documentation + convenience.
export async function POST() {
  return weeklyReportPost()
}

