"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Task } from "@/types"
import type { PersonData } from "@/types"

interface TaskHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: Task[]
  allPersonnel: PersonData[]
  onDeleteTask?: (taskId: string) => void
}

export default function TaskHistoryDialog({ open, onOpenChange, tasks, allPersonnel, onDeleteTask }: TaskHistoryDialogProps) {
  const completedTasks = tasks.filter((t) => t.status === "done")

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
          <DialogTitle>Lịch sử công việc hoàn thành</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 gap-4">
          <ScrollArea className="flex-1 min-h-0 rounded-lg border p-3">
            <div className="space-y-3">
              {completedTasks.length === 0 && (
                <div className="text-sm text-muted-foreground">Chưa có công việc hoàn thành nào.</div>
              )}
              {completedTasks.map((task) => (
                <div key={task.id} className="p-3 border rounded bg-green-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold">{task.name}</div>
                      <div className="text-xs text-muted-foreground">Địa điểm: {task.location}</div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>Bắt đầu: {new Date(task.createdAt).toLocaleString()}</div>
                      <div>Hoàn thành: {task.completedAt ? new Date(task.completedAt).toLocaleString() : "—"}</div>
                      {onDeleteTask && (
                        <div className="mt-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (!confirm("Bạn có chắc muốn xóa công việc này?")) return
                              onDeleteTask(task.id)
                            }}
                          >
                            Xóa
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium mb-1">Thành viên ({task.selectedTT.length}):</div>
                    <div className="text-muted-foreground">{getNamesFromTT(task.selectedTT)}</div>
                  </div>
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
