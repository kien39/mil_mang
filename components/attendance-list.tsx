"use client"

import type React from "react"
import { useState } from "react"

import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, Users, ChevronLeft, ChevronRight, Save, Check, Plus } from "lucide-react"
import type { PersonData } from "@/types"

interface AttendanceListProps {
  data: PersonData[]
  stats: { total: number; present: number; absent: number }
  onAttendanceChange: (rowIndex: number, isAbsent: boolean) => void
  onReasonChange: (rowIndex: number, reason: string) => void
  onSelectRow: (person: PersonData) => void
  onSave: () => void
  saveStatus: "idle" | "saving" | "saved"
  onCreateTask: () => void
}

const UNIT_CATEGORIES = [
  { id: "c-bo", name: "C bộ", codes: ["c2"] },
  { id: "trung-doi-4", name: "Trung đội 4", codes: ["a1", "a2", "a3"] },
  { id: "trung-doi-5", name: "Trung đội 5", codes: ["a4", "a5", "a6"] },
  { id: "trung-doi-6", name: "Trung đội 6", codes: ["a7", "a8", "a9"] },
  { id: "trung-doi-hl", name: "Trung đội HL", codes: ["a10", "a11", "a12"] },
]

export default function AttendanceList({
  data,
  stats,
  onAttendanceChange,
  onReasonChange,
  onSelectRow,
  onSave,
  saveStatus,
  onCreateTask,
}: AttendanceListProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [activeTab, setActiveTab] = useState("c-bo")
  const [editingReasonIdx, setEditingReasonIdx] = useState<number | null>(null)
  const rowsPerPage = 9

  const filteredData = data.filter((person) => {
    const activeCategory = UNIT_CATEGORIES.find((cat) => cat.id === activeTab)
    return activeCategory?.codes.some((code) => person["Đơn vị"]?.includes(code))
  })

  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const startIdx = currentPage * rowsPerPage
  const paginatedData = filteredData.slice(startIdx, startIdx + rowsPerPage)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setCurrentPage(0)
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Đại đội 2</h1>
          </div>
          <p className="text-muted-foreground">Danh sách trích ngang và quản lý điểm danh</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button onClick={onCreateTask} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Lập công việc
          </Button>
          <Button
            onClick={onSave}
            disabled={saveStatus === "saving"}
            className={`transition-all ${saveStatus === "saved" ? "bg-green-600 hover:bg-green-600" : ""}`}
          >
            {saveStatus === "saving" ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Đang lưu...
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Đã lưu
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu điểm danh
              </>
            )}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Quân số tổng"
            value={stats.total}
            icon={<Users className="w-5 h-5" />}
            color="from-primary/20 to-primary/10"
          />
          <StatCard
            label="Quân số có mặt"
            value={stats.present}
            icon={<div className="w-5 h-5 rounded-full bg-green-500" />}
            color="from-green-500/20 to-green-500/10"
          />
          <StatCard
            label="Quân số vắng"
            value={stats.absent}
            icon={<div className="w-5 h-5 rounded-full bg-red-500" />}
            color="from-red-500/20 to-red-500/10"
          />
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          {UNIT_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleTabChange(category.id)}
              className={`px-4 py-2 rounded-t-lg transition-colors font-medium ${
                activeTab === category.id
                  ? "bg-primary text-primary-foreground border-b-2 border-primary"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Personnel Table */}
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">TT</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Họ và tên</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Chức vụ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Vắng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Lý do</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((person, idx) => {
                  const originalIndex = data.indexOf(person)
                  const isEditing = editingReasonIdx === originalIndex
                  return (
                    <tr
                      key={idx}
                      onClick={() => onSelectRow(person)}
                      className="border-b border-border hover:bg-secondary/20 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-muted-foreground">{person["TT"]}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground hover:text-primary transition-colors">
                        {person["Họ và tên"]}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{person["Chức vụ"]}</td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={person._present || false}
                          onCheckedChange={(value) => onAttendanceChange(originalIndex, !!value)}
                          className="border-primary"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
                        {person._present ? (
                          isEditing ? (
                            <Input
                              autoFocus
                              value={person._reason || ""}
                              onChange={(e) => onReasonChange(originalIndex, e.target.value)}
                              onBlur={() => setEditingReasonIdx(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") setEditingReasonIdx(null)
                              }}
                              className="h-8"
                            />
                          ) : (
                            <span
                              onClick={() => setEditingReasonIdx(originalIndex)}
                              className="text-muted-foreground hover:text-foreground hover:bg-secondary/30 px-2 py-1 rounded cursor-pointer inline-block"
                            >
                              {person._reason || "Nhấn để thêm"}
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/20">
            <div className="text-sm text-muted-foreground">
              Trang {currentPage + 1} của {totalPages || 1} ({filteredData.length} người)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card className={`bg-gradient-to-br ${color} border-border p-6 hover:border-primary/50 transition-colors`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <p className="text-4xl font-bold text-foreground">{value}</p>
        </div>
        <div className="text-primary/60">{icon}</div>
      </div>
    </Card>
  )
}
