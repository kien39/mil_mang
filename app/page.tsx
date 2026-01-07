"use client"

import { useState, useEffect } from "react"
import AttendanceList from "@/components/attendance-list"
import DetailProfile from "@/components/detail-profile"
import TaskCreationDialog from "@/components/task-creation-dialog"
import TaskListDialog from "@/components/task-list-dialog"
import TaskHistoryDialog from "@/components/task-history-dialog"
import type { PersonData, AttendanceRecord, Task } from "@/types"

export default function Home() {
  const [attendanceData, setAttendanceData] = useState<PersonData[]>([])
  const [selectedPerson, setSelectedPerson] = useState<PersonData | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [taskListOpen, setTaskListOpen] = useState(false)
  const [taskHistoryOpen, setTaskHistoryOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])

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

    // Listen for app-level events
    const onSave = () => handleSaveAttendance()
    const onTaskOpen = () => setTaskDialogOpen(true)
    const onTaskView = () => setTaskListOpen(true)
    const onExportTasks = () => setTaskHistoryOpen(true)
    window.addEventListener("attendance:save", onSave)
    window.addEventListener("task:open", onTaskOpen)
    window.addEventListener("task:view", onTaskView)
    window.addEventListener("tasks:export", onExportTasks)
    return () => {
      window.removeEventListener("attendance:save", onSave)
      window.removeEventListener("task:open", onTaskOpen)
      window.removeEventListener("task:view", onTaskView)
      window.removeEventListener("tasks:export", onExportTasks)
    }
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
    const task: Task = {
      id: Date.now().toString(),
      name: taskName,
      location,
      selectedTT: selectedTT.slice(),
      createdAt: new Date().toISOString(),
      status: "progressing",
    }
    setTasks((prev) => [task, ...prev])
    try {
      window.dispatchEvent(new CustomEvent("tasks:updated"))
    } catch (e) {
      /* ignore */
    }
  }

  // Tasks persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tasks")
      if (saved) setTasks(JSON.parse(saved) as Task[])
    } catch (e) {
      console.error("Failed to load saved tasks", e)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    } catch (e) {
      console.error("Failed to persist tasks", e)
    }
  }, [tasks])

  const handleUpdateTask = (taskId: string, status: Task["status"]) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === taskId ? { ...t, status, completedAt: status === "done" ? new Date().toISOString() : t.completedAt } : t))

      // If task is completed, mark assigned people as present (not absent) and clear their reason
      const completedTask = next.find((t) => t.id === taskId && t.status === "done")
      if (completedTask) {
        const newData = [...attendanceData]
        completedTask.selectedTT.forEach((tt) => {
          const idx = newData.findIndex((p) => p.TT === tt)
          if (idx !== -1) {
            newData[idx]._present = false
            newData[idx]._reason = ""
          }
        })
        setAttendanceData(newData)

          // Persist attendance changes
          handleSaveAttendance()
      }

      try {
        window.dispatchEvent(new CustomEvent("tasks:updated"))
      } catch (e) {
        /* ignore */
      }

      return next
    })
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== taskId)
      try {
        window.dispatchEvent(new CustomEvent("tasks:updated"))
      } catch (e) {
        /* ignore */
      }
      return next
    })
  }

  const handleSaveAttendance = async () => {
    try {
      setSaveStatus("saving")
      const records: Record<number, AttendanceRecord> = {}
      attendanceData.forEach((person) => {
        const present = person._present === true
        const reason = typeof person._reason === "string" ? person._reason : ""
        records[person.TT] = {
          tt: person.TT,
          present,
          reason,
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
          />

          <TaskCreationDialog
            open={taskDialogOpen}
            onOpenChange={setTaskDialogOpen}
            allPersonnel={attendanceData}
            onCreateTask={handleCreateTask}
          />
          <TaskListDialog
            open={taskListOpen}
            onOpenChange={setTaskListOpen}
            tasks={tasks}
            allPersonnel={attendanceData}
            onUpdateTask={handleUpdateTask}
          />
          <TaskHistoryDialog
            open={taskHistoryOpen}
            onOpenChange={setTaskHistoryOpen}
            tasks={tasks}
            allPersonnel={attendanceData}
            onDeleteTask={handleDeleteTask}
          />
        </>
      ) : (
        <DetailProfile person={selectedPerson} onBack={handleBack} />
      )}
    </div>
  )
}
