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
          <div className="space-y-3">
            {allPersonnel.map((person) => (
              <div
                key={person.TT}
                className="flex items-center gap-3 pr-4"
              >
                <Checkbox
                  checked={selectedPeople.has(person.TT)}
                  onCheckedChange={() =>
                    handlePersonToggle(person.TT)
                  }
                />
                <span className="flex-1 truncate text-sm font-medium">
                  {person["Họ và tên"]}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {person["Chức vụ"]}
                </span>
              </div>
            ))}
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
