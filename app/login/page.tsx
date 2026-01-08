"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const { role, login } = useUser()
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If already logged in, redirect to appropriate page
    if (role === "manager") {
      router.push("/")
    } else if (role === "soldier") {
      router.push("/survey")
    }
  }, [role, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = login(account, password)
    if (result.success) {
      // Redirect will happen via useEffect when role changes
    } else {
      setError(result.error || "Đăng nhập thất bại")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🎖️ Quản lý Quân Nhân</h1>
          <p className="text-muted-foreground">Đăng nhập vào hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Input */}
          <div className="space-y-2">
            <Label htmlFor="account" className="font-semibold">
              Tài khoản
            </Label>
            <Input
              id="account"
              type="text"
              placeholder="Nhập tài khoản"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              disabled={loading}
              className="border-input"
              autoComplete="username"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold">
              Mật khẩu
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="border-input"
              autoComplete="current-password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-semibold">❌ {error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !account || !password}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-secondary/20 rounded-lg text-center text-sm text-muted-foreground">
          <p className="font-semibold mb-3">📝 Thông tin đăng nhập mẫu</p>
          <div className="space-y-2 text-left text-xs">
            <div className="pb-2 border-b border-border/50">
              <p className="font-semibold text-foreground">Quản Lý:</p>
              <p>Tài khoản: <code className="bg-background px-1 rounded">CTV</code></p>
              <p>Mật khẩu: <code className="bg-background px-1 rounded">c2d7e209</code></p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Quân Nhân:</p>
              <p>Tài khoản: <code className="bg-background px-1 rounded">c2d7</code></p>
              <p>Mật khẩu: <code className="bg-background px-1 rounded">song lo anh hung</code></p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
