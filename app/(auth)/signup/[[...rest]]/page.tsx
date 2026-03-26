"use client"

import { SignUp } from "@clerk/nextjs"

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
      <SignUp signInUrl="/signin" forceRedirectUrl="/dashboard" />
    </div>
  )
}

