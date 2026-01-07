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
  const UNIT_CATEGORIES = [
    { id: "c-bo", name: "C bộ", codes: ["c2"] },
    { id: "trung-doi-4", name: "Trung đội 4", codes: ["a1", "a2", "a3"] },
    { id: "trung-doi-5", name: "Trung đội 5", codes: ["a4", "a5", "a6"] },
    { id: "trung-doi-6", name: "Trung đội 6", codes: ["a7", "a8", "a9"] },
    { id: "trung-doi-hl", name: "Trung đội HL", codes: ["a10", "a11", "a12"] },
  ]

  const getUnitName = (p: PersonData) => {
    const unitField = p["Đơn vị"] || ""
    const cat = UNIT_CATEGORIES.find((c) => c.codes.some((code) => unitField?.includes(code)))
    return cat ? cat.name : "Khác"
  }

  // Group personnel by unit
  const groupedPersonnel: Record<string, PersonData[]> = {}
  UNIT_CATEGORIES.forEach((c) => (groupedPersonnel[c.name] = []))
  groupedPersonnel["Khác"] = []
  allPersonnel.forEach((p) => {
    const unit = getUnitName(p)
    if (!groupedPersonnel[unit]) groupedPersonnel[unit] = []
    groupedPersonnel[unit].push(p)
  })

  const toggleSelectGroup = (unitName: string) => {
    setSelectedPeople((prev) => {
      const next = new Set(prev)
      const members = groupedPersonnel[unitName] || []
      const allSelected = members.every((m) => next.has(m.TT))
      if (allSelected) {
        members.forEach((m) => next.delete(m.TT))
      } else {
        members.forEach((m) => next.add(m.TT))
      }
      return next
    })
  }

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
    onOpenChange(false)
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
        <Label className="mb-2 shrink-0">
          Chọn những người đi làm ({selectedPeople.size} người)
        </Label>

        <ScrollArea className="flex-1 min-h-0 rounded-lg border p-3">
          <div className="space-y-4">
            {Object.keys(groupedPersonnel).map((unitName) => {
              const members = groupedPersonnel[unitName]
              if (!members || members.length === 0) return null
              const allSelected = members.every((m) => selectedPeople.has(m.TT))
              return (
                <div key={unitName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSelectGroup(unitName)}
                        className="text-sm font-medium underline text-primary"
                      >
                        {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                      </button>
                      <div className="text-sm font-semibold">{unitName}</div>
                      <div className="text-xs text-muted-foreground">({members.length})</div>
                    </div>
                  </div>

                  <div className="space-y-2 pl-4">
                    {members.map((person) => (
                      <div key={person.TT} className="flex items-center gap-3 pr-4">
                        <Checkbox
                          checked={selectedPeople.has(person.TT)}
                          onCheckedChange={() => handlePersonToggle(person.TT)}
                        />
                        <span className="flex-1 truncate text-sm font-medium">{person["Họ và tên"]}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{person["Chức vụ"]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
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
