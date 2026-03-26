"use client"

import { SignIn } from "@clerk/nextjs"

export default function SigninPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-10">
      <SignIn signUpUrl="/signup" forceRedirectUrl="/dashboard" />
    </div>
  )
}

