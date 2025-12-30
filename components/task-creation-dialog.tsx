"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PersonData } from "@/types"

const UNIT_CATEGORIES = [
  { id: "c-bo", name: "C bộ", codes: ["c2"] },
  { id: "trung-doi-4", name: "Trung đội 4", codes: ["a1", "a2", "a3"] },
  { id: "trung-doi-5", name: "Trung đội 5", codes: ["a4", "a5", "a6"] },
  { id: "trung-doi-6", name: "Trung đội 6", codes: ["a7", "a8", "a9"] },
  { id: "trung-doi-hl", name: "Trung đội HL", codes: ["a10", "a11", "a12"] },
]

interface TaskCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allPersonnel: PersonData[]
  onCreateTask: (
    taskName: string,
    location: string,
    selectedPersonnel: number[]
  ) => void
}

export default function TaskCreationDialog({
  open,
  onOpenChange,
  allPersonnel,
  onCreateTask,
}: TaskCreationDialogProps) {
  const [taskName, setTaskName] = useState("")
  const [location, setLocation] = useState("")
  const [selectedPeople, setSelectedPeople] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState("c-bo")

  const handlePersonToggle = (tt: number) => {
    setSelectedPeople((prev) => {
      const next = new Set(prev)
      next.has(tt) ? next.delete(tt) : next.add(tt)
      return next
    })
  }

  const handleCreate = () => {
    if (!taskName.trim() || !location.trim() || selectedPeople.size === 0) {
      alert("Vui lòng nhập tên công việc, vị trí, và chọn ít nhất 1 người")
      return
    }

    onCreateTask(taskName, location, Array.from(selectedPeople))
    setTaskName("")
    setLocation("")
    setSelectedPeople(new Set())
    setActiveTab("c-bo")
    onOpenChange(false)
  }

  // Filter personnel by active category
  const filteredData = allPersonnel.filter((person) => {
    const activeCategory = UNIT_CATEGORIES.find((cat) => cat.id === activeTab)
    return activeCategory?.codes.some((code) => person["Đơn vị"]?.includes(code))
  })

  // Count selected people by category
  const getCategoryCount = (categoryId: string) => {
    const category = UNIT_CATEGORIES.find((cat) => cat.id === categoryId)
    if (!category) return 0
    return allPersonnel.filter(
      (person) =>
        selectedPeople.has(person.TT) &&
        category.codes.some((code) => person["Đơn vị"]?.includes(code))
    ).length
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  {/* 🔒 Dialog is locked and cannot overflow */}
  <DialogContent className="max-w-2xl h-[80vh] flex flex-col overflow-hidden">

    {/* ❌ Header must not grow */}
    <DialogHeader className="shrink-0">
      <DialogTitle>Lập công việc</DialogTitle>
    </DialogHeader>

    {/* 🔑 MAIN FLEX CONTAINER */}
    <div className="flex flex-col flex-1 min-h-0 gap-4">

      <div className="shrink-0">
        <Label htmlFor="task-name">Tên công việc</Label>
        <Input
          id="task-name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
      </div>

      <div className="shrink-0">
        <Label htmlFor="location">Vị trí làm</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {/* 👇 THIS IS THE ONLY SCROLLABLE AREA */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="mb-2 shrink-0">
          <Label>
            Chọn những người đi làm ({selectedPeople.size} người)
          </Label>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-3 shrink-0 border-b border-border pb-2">
          {UNIT_CATEGORIES.map((category) => {
            const count = getCategoryCount(category.id)
            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-3 py-1.5 rounded-t-lg transition-colors text-sm font-medium ${
                  activeTab === category.id
                    ? "bg-primary text-primary-foreground border-b-2 border-primary"
                    : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                {category.name}
                {count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/20 text-xs">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <ScrollArea className="flex-1 min-h-0 rounded-lg border p-3">
          <div className="space-y-3">
            {filteredData.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Không có người trong đơn vị này
              </div>
            ) : (
              filteredData.map((person) => (
                <div
                  key={person.TT}
                  className="flex items-center gap-3 pr-4"
                >
                  <Checkbox
                    checked={selectedPeople.has(person.TT)}
                    onCheckedChange={() => handlePersonToggle(person.TT)}
                  />
                  <span className="flex-1 truncate text-sm font-medium">
                    {person["Họ và tên"]}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {person["Chức vụ"]}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>

    {/* ❌ Footer must not grow */}
    <DialogFooter className="shrink-0">
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        Hủy
      </Button>
      <Button onClick={handleCreate}>Tạo công việc</Button>
    </DialogFooter>

  </DialogContent>
</Dialog>

  )
}
