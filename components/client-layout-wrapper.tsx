"use client"

import { useUser } from "@/lib/user-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

const PUBLIC_ROUTES = ["/login", "/survey"]
const SOLDIER_ROUTES = ["/survey"]

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { role } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If authenticated, apply role-based routing
    if (role) {
      // If soldier, only allow survey page
      if (role === "soldier" && !SOLDIER_ROUTES.includes(pathname)) {
        router.push("/survey")
        return
      }

      // If manager, redirect login to home
      if (role === "manager" && pathname === "/login") {
        router.push("/")
        return
      }
    } else {
      // If no role, only allow public routes
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.push("/login")
        return
      }
    }
  }, [role, pathname, router])

  return <>{children}</>
}
