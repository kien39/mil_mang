"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ThoughtSurveyDialog from "@/components/thought-survey-dialog"
import { useSurvey } from "@/lib/survey-context"
import { useUser } from "@/lib/user-context"
import { Button } from "@/components/ui/button"
import type { PersonData, ThoughtEvaluation } from "@/types"

export default function SurveyPage() {
  const router = useRouter()
  const { surveyEnabled } = useSurvey()
  const { logout, account } = useUser()
  const [attendanceData, setAttendanceData] = useState<PersonData[]>([])
  const [selectedPerson, setSelectedPerson] = useState<PersonData | null>(null)
  const [open, setOpen] = useState(true)
  const [thoughtEvaluations, setThoughtEvaluations] = useState<ThoughtEvaluation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/personnel")
        if (!response.ok) throw new Error("Failed to load")
        const data = await response.json()
        setAttendanceData(data)

        // Load thought evaluations from localStorage
        const saved = localStorage.getItem("thought_evaluations")
        if (saved) {
          setThoughtEvaluations(JSON.parse(saved))
        }
      } catch (err) {
        console.error("Error loading data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSave = (evaluation: ThoughtEvaluation) => {
    console.log("[Survey] Saving evaluation:", evaluation)
    setThoughtEvaluations((prev) => {
      const filtered = prev.filter((e) => e.tt !== evaluation.tt)
      const updated = [evaluation, ...filtered]
      try {
        localStorage.setItem("thought_evaluations", JSON.stringify(updated))
        console.log("[Survey] Saved to localStorage, dispatching event")
        // Emit event for manager's page to refresh
        window.dispatchEvent(new CustomEvent("survey:updated"))
      } catch (err) {
        console.error("Failed to persist", err)
      }
      return updated
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    // Don't redirect - keep user on survey page after submission
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Đang tải...</p>
      </div>
    )
  }

  if (!surveyEnabled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {account && (
          <div className="fixed top-4 left-4 z-40">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        )}
        <div className="text-center max-w-md">
          <p className="text-lg font-semibold text-red-600 mb-2">❌ Khảo sát không khả dụng</p>
          <p className="text-muted-foreground">
            Khảo sát tư tưởng hiện tại không được kích hoạt. Vui lòng liên hệ với quản lý.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {account && (
        <div className="fixed top-4 left-4 z-40">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      )}
      <ThoughtSurveyDialog
        open={open}
        onOpenChange={handleOpenChange}
        person={selectedPerson}
        onSave={handleSave}
        allPersonnel={attendanceData}
      />
    </div>
  )
}
