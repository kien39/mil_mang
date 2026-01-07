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
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, X, Eye } from "lucide-react"
import type { Task } from "@/types"
import type { PersonData } from "@/types"

interface TaskListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: Task[]
  allPersonnel: PersonData[]
  onUpdateTask: (taskId: string, status: Task["status"]) => void
}

export default function TaskListDialog({ open, onOpenChange, tasks, allPersonnel, onUpdateTask }: TaskListDialogProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const getNamesFromTT = (tts: number[]) => {
    return tts
      .map((tt) => allPersonnel.find((p) => p.TT === tt))
      .filter(Boolean)
      .map((p) => p!["Họ và tên"])
      .join(", ")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Các công việc đang tiến hành</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 gap-4">
          <Label className="mb-2">Danh sách công việc ({tasks.length})</Label>
          <ScrollArea className="flex-1 min-h-0 rounded-lg border p-3">
            <div className="space-y-3">
              {tasks.length === 0 && <div className="text-sm text-muted-foreground">Không có công việc nào.</div>}
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{task.name}</div>
                      <div className="text-xs text-muted-foreground">{task.location} • {new Date(task.createdAt).toLocaleString()}</div>
                      <div className="text-sm mt-2">Số người: {task.selectedTT.length}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-2 py-1 rounded text-sm ${task.status === "progressing" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                        {task.status}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setExpanded(expanded === task.id ? null : task.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Chi tiết
                        </Button>
                        {task.status === "progressing" ? (
                          <Button size="sm" onClick={() => onUpdateTask(task.id, "done")}>
                            <Check className="w-4 h-4 mr-2" />
                            Đã hoàn thành
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => onUpdateTask(task.id, "progressing")}>
                            <X className="w-4 h-4 mr-2" />
                            Mở lại
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {expanded === task.id && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      <div className="mb-2 font-medium">Danh sách thành viên:</div>
                      <div>{getNamesFromTT(task.selectedTT) || "Không có"}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
