import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import Navbar from "@/components/layout/Navbar"
import { ClerkProvider } from "@clerk/nextjs"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "HabitFlow - Habit Analytics Dashboard",
  description:
    "HabitFlow is a cross-platform habit tracker with a monthly grid, time-series habit logs, streak calculation, success-rate consistency, and progress insights.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <Providers>
            <Navbar />
            {children}
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
