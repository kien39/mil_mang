"use client"

import { useEffect, useRef, useState } from "react"
import { Save, Users, Plus, Eye, Brain } from "lucide-react"

export default function AppIcon() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const emit = (name: string) => {
    window.dispatchEvent(new CustomEvent(name))
    setOpen(false)
  }

  const [count, setCount] = useState(0)

  useEffect(() => {
    function refresh() {
      try {
        const saved = localStorage.getItem("tasks")
        if (!saved) return setCount(0)
        const tasks = JSON.parse(saved)
        const c = Array.isArray(tasks) ? tasks.filter((t: any) => t.status === "progressing").length : 0
        setCount(c)
      } catch (e) {
        setCount(0)
      }
    }

    refresh()
    window.addEventListener("tasks:updated", refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener("tasks:updated", refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  return (
    <div ref={ref} className="fixed top-4 right-4 z-50">
      <button
        aria-label="App menu"
        onClick={() => setOpen((v) => !v)}
        className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-border shadow-lg object-cover bg-card p-1 flex items-center justify-center"
      >
        <img src="/app-icon.png" alt="App" className="w-full h-full rounded-full object-cover" onError={(e) => (e.currentTarget.src = "/icon.svg")} />
        {count > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center shadow">
            {count}
          </div>
        )}
      </button>

      {open && (
        <div className="mt-2 w-56 bg-card border border-border rounded shadow-lg p-2">
          <button
            className="w-full text-left px-3 py-2 hover:bg-secondary/20 rounded flex items-center gap-2"
            onClick={() => emit("attendance:save")}
          >
            <Save className="w-4 h-4" />
            Lưu điểm danh
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-secondary/20 rounded flex items-center gap-2"
            onClick={() => emit("attendance:export-absent")}
          >
            <Users className="w-4 h-4" />
            Xuất báo cáo vắng
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-secondary/20 rounded flex items-center gap-2"
            onClick={() => emit("task:open")}
          >
            <Plus className="w-4 h-4" />
            Lập công việc
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-secondary/20 rounded flex items-center gap-2"
            onClick={() => emit("task:view")}
          >
            <Eye className="w-4 h-4" />
            Xem công việc
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-secondary/20 rounded flex items-center gap-2"
            onClick={() => emit("tasks:export")}
          >
            <Users className="w-4 h-4" />
            Xuất lịch sử công việc
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-secondary/20 rounded flex items-center gap-2"
            onClick={() => emit("thought:survey")}
          >
            <Brain className="w-4 h-4" />
            Khảo sát tư tưởng
          </button>
          <button
            className="w-full text-left px-3 py-2 hover:bg-secondary/20 rounded flex items-center gap-2"
            onClick={() => emit("thought:export")}
          >
            <Users className="w-4 h-4" />
            Xuất kết quả tư tưởng
          </button>
        </div>
      )}
    </div>
  )
}
