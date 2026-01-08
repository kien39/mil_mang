import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import AppIcon from "@/components/app-icon"
import { UserProvider } from "@/lib/user-context"
import { SurveyProvider } from "@/lib/survey-context"
import ClientLayoutWrapper from "@/components/client-layout-wrapper"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Đại đội 2 - Quản lý Điểm danh",
  description: "Team attendance management system",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <UserProvider>
          <SurveyProvider>
            <ClientLayoutWrapper>
              {/* Replaceable app icon component (client) */}
              <AppIcon />
              {children}
            </ClientLayoutWrapper>
          </SurveyProvider>
        </UserProvider>
        <Analytics />
      </body>
    </html>
  )
}

