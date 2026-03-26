import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"])
const isAuthRoute = createRouteMatcher(["/signin(.*)", "/signup(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const session = await auth()

  if (isDashboardRoute(req) && !session.userId) {
    return session.redirectToSignIn({ returnBackUrl: req.url })
  }

  if (isAuthRoute(req) && session.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}

