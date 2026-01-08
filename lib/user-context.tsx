"use client"

import { createContext, useContext, useState, useEffect } from "react"

type UserRole = "soldier" | "manager" | null

interface UserContextType {
  role: UserRole
  account: string | null
  setRole: (role: UserRole) => void
  login: (account: string, password: string) => { success: boolean; error?: string }
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Hardcoded credentials
const CREDENTIALS = {
  manager: {
    account: "CTV",
    password: "c2d7e209",
  },
  soldier: {
    account: "c2d7",
    password: "song lo anh hung",
  },
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null)
  const [account, setAccount] = useState<string | null>(null)

  useEffect(() => {
    // Load role and account from localStorage
    const savedRole = localStorage.getItem("userRole") as UserRole
    const savedAccount = localStorage.getItem("userAccount")
    if (savedRole && savedAccount) {
      setRole(savedRole)
      setAccount(savedAccount)
    }
  }, [])

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole)
    if (newRole) {
      localStorage.setItem("userRole", newRole)
    } else {
      localStorage.removeItem("userRole")
    }
  }

  const handleLogin = (inputAccount: string, inputPassword: string) => {
    // Check manager credentials
    if (
      inputAccount === CREDENTIALS.manager.account &&
      inputPassword === CREDENTIALS.manager.password
    ) {
      handleSetRole("manager")
      setAccount(inputAccount)
      localStorage.setItem("userAccount", inputAccount)
      return { success: true }
    }

    // Check soldier credentials
    if (
      inputAccount === CREDENTIALS.soldier.account &&
      inputPassword === CREDENTIALS.soldier.password
    ) {
      handleSetRole("soldier")
      setAccount(inputAccount)
      localStorage.setItem("userAccount", inputAccount)
      return { success: true }
    }

    return { success: false, error: "Tài khoản hoặc mật khẩu không chính xác" }
  }

  const logout = () => {
    handleSetRole(null)
    setAccount(null)
    localStorage.removeItem("userAccount")
  }

  return (
    <UserContext.Provider value={{ role, account, setRole: handleSetRole, login: handleLogin, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within UserProvider")
  }
  return context
}
