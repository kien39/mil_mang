"use client"

import { useState, useEffect } from "react"
import AttendanceList from "@/components/attendance-list"
import DetailProfile from "@/components/detail-profile"
import TaskCreationDialog from "@/components/task-creation-dialog"
import { exportAttendanceToExcel } from "@/lib/export-excel"
import type { PersonData, AttendanceRecord } from "@/types"

export default function Home() {
  const [attendanceData, setAttendanceData] = useState<PersonData[]>([])
  const [selectedPerson, setSelectedPerson] = useState<PersonData | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const response = await fetch("/api/personnel")
        if (!response.ok) {
          throw new Error("Failed to load personnel data")
        }
        const data = await response.json()

        const savedRecords = localStorage.getItem("attendance_with_reasons")
        if (savedRecords) {
          try {
            const recordMap = JSON.parse(savedRecords) as Record<number, AttendanceRecord>
            console.log("[v0] Found saved records, loading from localStorage")
            const mergedData = data.map((person: PersonData) => ({
              ...person,
              _present: recordMap[person.TT]?.present ?? false,
              _reason: recordMap[person.TT]?.reason ?? "",
            }))
            setAttendanceData(mergedData)
          } catch (err) {
            console.error("[v0] Error parsing saved records:", err)
            setAttendanceData(data.map((p: PersonData) => ({ ...p, _present: false, _reason: "" })))
          }
        } else {
          console.log("[v0] No saved records, loading default Excel data")
          setAttendanceData(data.map((p: PersonData) => ({ ...p, _present: false, _reason: "" })))
        }

        setError(null)
      } catch (err) {
        console.error("[v0] Error loading data:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter((p) => !p._present).length,
    absent: attendanceData.filter((p) => p._present).length,
  }

  const handleAttendanceChange = (rowIndex: number, isAbsent: boolean) => {
    const newData = [...attendanceData]
    newData[rowIndex]._present = isAbsent
    if (!isAbsent) {
      newData[rowIndex]._reason = ""
    }
    setAttendanceData(newData)
  }

  const handleReasonChange = (rowIndex: number, reason: string) => {
    const newData = [...attendanceData]
    newData[rowIndex]._reason = reason
    setAttendanceData(newData)
  }

  const handleCreateTask = (taskName: string, location: string, selectedTT: number[]) => {
    const newData = [...attendanceData]
    selectedTT.forEach((tt) => {
      const index = newData.findIndex((p) => p.TT === tt)
      if (index !== -1) {
        newData[index]._present = true
        newData[index]._reason = taskName
      }
    })
    setAttendanceData(newData)
    console.log(`[v0] Task created: ${taskName} at ${location} with ${selectedTT.length} people`)
  }

  const handleSaveAttendance = async () => {
    try {
      setSaveStatus("saving")
      const records: Record<number, AttendanceRecord> = {}
      attendanceData.forEach((person) => {
        records[person.TT] = {
          tt: person.TT,
          present: person._present,
          reason: person._reason,
        }
      })

      localStorage.setItem("attendance_with_reasons", JSON.stringify(records))
      console.log("[v0] Full attendance records saved")
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (err) {
      console.error("[v0] Error saving:", err)
      setSaveStatus("idle")
    }
  }

  const handleRowSelect = (person: PersonData) => {
    setSelectedPerson(person)
    setShowDetail(true)
  }

  const handleBack = () => {
    setShowDetail(false)
    setSelectedPerson(null)
  }

  const handleExport = async () => {
    try {
      const result = await exportAttendanceToExcel(attendanceData)
      if (result.success) {
        console.log(`[Export] File exported successfully: ${result.filename}`)
      } else {
        console.error("[Export] Export failed:", result.error)
        alert("Lỗi khi xuất file Excel: " + result.error)
      }
    } catch (error) {
      console.error("[Export] Unexpected error:", error)
      alert("Lỗi khi xuất file Excel. Vui lòng thử lại.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading personnel data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <p className="text-sm text-muted-foreground">Make sure the Excel file is converted to JSON.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background">
      {!showDetail ? (
        <>
          <AttendanceList
            data={attendanceData}
            stats={stats}
            onAttendanceChange={handleAttendanceChange}
            onReasonChange={handleReasonChange}
            onSelectRow={handleRowSelect}
            onSave={handleSaveAttendance}
            saveStatus={saveStatus}
            onCreateTask={() => setTaskDialogOpen(true)}
            onExport={handleExport}
          />
          <TaskCreationDialog
            open={taskDialogOpen}
            onOpenChange={setTaskDialogOpen}
            allPersonnel={attendanceData}
            onCreateTask={handleCreateTask}
          />
        </>
      ) : (
        <DetailProfile person={selectedPerson} onBack={handleBack} />
      )}
    </div>
  )
}
