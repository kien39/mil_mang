"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { PersonData } from "@/types"

interface DetailProfileProps {
  person: PersonData | null
  onBack: () => void
}

export default function DetailProfile({ person, onBack }: DetailProfileProps) {
  if (!person) return null

  const displayFields = ["TT", "Họ và tên", "Chức vụ", "Ngày sinh", "Quê quán", "Email", "Điện thoại", "Điểm danh", "Sức khỏe", "Tư tưởng"]

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <Button onClick={onBack} variant="outline" className="gap-2 border-border hover:bg-secondary/50 bg-transparent">
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Button>

        {/* Profile Card */}
        <Card className="bg-card border-border p-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Hồ sơ chi tiết</h1>
            <p className="text-lg text-primary font-semibold">{person["Họ và tên"]}</p>
          </div>

          {/* Profile Details Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {displayFields.map((field) => (
                  <tr key={field} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-primary w-1/3 md:w-1/4">{field}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {field === "Điểm danh" ? (
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            person[field] ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${person[field] ? "bg-green-500" : "bg-red-500"}`} />
                          {person[field] ? "Có mặt" : "Vắng"}
                        </span>
                      ) : (
                        person[field] || "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Additional Info */}
        <Card className="bg-secondary/20 border-border p-6">
          <p className="text-sm text-muted-foreground">
            Hồ sơ này chứa các thông tin cơ bản về nhân sự. Để cập nhật thông tin, vui lòng liên hệ quản lý.
          </p>
        </Card>
      </div>
    </div>
  )
}
