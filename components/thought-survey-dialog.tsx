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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import type { PersonData, ThoughtEvaluation } from "@/types"

interface ThoughtSurveyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person: PersonData | null
  onSave: (evaluation: ThoughtEvaluation) => void
  allPersonnel?: PersonData[]
}

// Updated survey questions with specific scoring for each answer
const SURVEY_SECTIONS = [
  {
    title: "II. TÌNH TRẠNG SỨC KHỎE TINH THẦN",
    questions: [
      {
        id: 0,
        question: "Trong thời gian gần đây, tâm trạng chung của đồng chí:",
        answers: [
          { text: "Rất tốt", score: 5 },
          { text: "Tốt", score: 4 },
          { text: "Bình thường", score: 3 },
          { text: "Căng thẳng", score: 2 },
          { text: "Rất căng thẳng", score: 1 },
        ],
      },
      {
        id: 1,
        question: "Đồng chí có thường xuyên cảm thấy mệt mỏi, chán nản không?",
        answers: [
          { text: "Không", score: 4 },
          { text: "Ít", score: 3 },
          { text: "Thỉnh thoảng", score: 2 },
          { text: "Thường xuyên", score: 1 },
        ],
      },
      {
        id: 2,
        question: "Giấc ngủ của đồng chí dạo gần đây:",
        answers: [
          { text: "Ngủ tốt", score: 4 },
          { text: "Khó ngủ nhẹ", score: 3 },
          { text: "Hay tỉnh giấc", score: 2 },
          { text: "Mất ngủ kéo dài", score: 1 },
        ],
      },
      {
        id: 3,
        question: "Khi gặp áp lực tinh thần, đồng chí:",
        answers: [
          { text: "Có người chia sẻ", score: 4 },
          { text: "Chỉ chia sẻ một phần", score: 3 },
          { text: "Khó chia sẻ", score: 2 },
          { text: "Không chia sẻ với ai", score: 1 },
        ],
      },
    ],
  },
  {
    title: "III. ĐỜI SỐNG – SINH HOẠT – HUẤN LUYỆN",
    questions: [
      {
        id: 4,
        question: "Đồng chí đánh giá môi trường sinh hoạt, ăn ở tại đơn vị:",
        answers: [
          { text: "Rất tốt", score: 4 },
          { text: "Tốt", score: 3 },
          { text: "Tạm ổn", score: 2 },
          { text: "Chưa phù hợp", score: 1 },
        ],
      },
      {
        id: 5,
        question: "Quan hệ của đồng chí với đồng đội:",
        answers: [
          { text: "Hòa đồng, đoàn kết", score: 4 },
          { text: "Bình thường", score: 3 },
          { text: "Có va chạm nhỏ", score: 2 },
          { text: "Khó hòa nhập", score: 1 },
        ],
      },
      {
        id: 6,
        question: "Khối lượng công việc, huấn luyện hiện nay:",
        answers: [
          { text: "Phù hợp", score: 4 },
          { text: "Hơi nặng", score: 3 },
          { text: "Nặng", score: 2 },
          { text: "Quá sức", score: 1 },
        ],
      },
      {
        id: 7,
        question: "Đồng chí có cảm thấy ý kiến của mình được lắng nghe trong đơn vị không?",
        answers: [
          { text: "Có", score: 4 },
          { text: "Thỉnh thoảng", score: 3 },
          { text: "Ít", score: 2 },
          { text: "Không", score: 1 },
        ],
      },
      {
        id: 8,
        question: "Đồng chí có gặp vướng mắc gì trong sinh hoạt, chế độ, tiêu chuẩn không?",
        answers: [
          { text: "Không", score: 5 },
          { text: "Có", score: 1 },
        ],
        hasNote: true,
      },
    ],
  },
  {
    title: "IV. HOÀN CẢNH GIA ĐÌNH – CÁ NHÂN",
    questions: [
      {
        id: 9,
        question: "Hiện tại, đồng chí có đang lo lắng về vấn đề gia đình không?",
        answers: [
          { text: "Không", score: 4 },
          { text: "Ít", score: 3 },
          { text: "Có", score: 2 },
          { text: "Rất nhiều", score: 1 },
        ],
      },
      {
        id: 10,
        question: "Việc nhớ nhà, lo cho gia đình có ảnh hưởng đến tâm lý, công tác không?",
        answers: [
          { text: "Không", score: 4 },
          { text: "Ít", score: 3 },
          { text: "Có", score: 2 },
          { text: "Ảnh hưởng nhiều", score: 1 },
        ],
      },
      {
        id: 11,
        question: "Hoàn cảnh gia đình hiện nay:",
        answers: [
          { text: "Ổn định", score: 3 },
          { text: "Có khó khăn tạm thời", score: 2 },
          { text: "Có khó khăn kéo dài", score: 1 },
        ],
      },
      {
        id: 12,
        question: "Khi gia đình gặp khó khăn, đồng chí:",
        answers: [
          { text: "Có người hỗ trợ", score: 3 },
          { text: "Tự xoay xở", score: 2 },
          { text: "Cảm thấy áp lực, bế tắc", score: 1 },
        ],
      },
    ],
  },
  {
    title: "V. TÌNH HÌNH TÀI CHÍNH – NỢ NẦN",
    questions: [
      {
        id: 13,
        question: "Tình hình tài chính cá nhân hiện nay:",
        answers: [
          { text: "Ổn định", score: 3 },
          { text: "Tạm đủ", score: 2 },
          { text: "Khó khăn", score: 1 },
        ],
      },
      {
        id: 14,
        question: "Đồng chí hiện có nợ không?",
        answers: [
          { text: "Không có", score: 3 },
          { text: "Có nợ nhỏ", score: 2 },
          { text: "Có nợ kéo dài", score: 1 },
        ],
      },
      {
        id: 15,
        question: "Áp lực tài chính có ảnh hưởng đến tư tưởng, công tác không?",
        answers: [
          { text: "Không", score: 4 },
          { text: "Ít", score: 3 },
          { text: "Có", score: 2 },
          { text: "Ảnh hưởng nhiều", score: 1 },
        ],
      },
    ],
  },
  {
    title: "VI. QUAN HỆ CÁ NHÂN – NGUYỆN VỌNG",
    questions: [
      {
        id: 16,
        question: "Đồng chí có vướng mắc trong quan hệ cá nhân (gia đình, tình cảm, xã hội) không?",
        answers: [
          { text: "Không", score: 4 },
          { text: "Ít", score: 3 },
          { text: "Có", score: 2 },
          { text: "Khó giải quyết", score: 1 },
        ],
      },
      {
        id: 17,
        question: "Khi có vấn đề cá nhân, đồng chí mong muốn:",
        answers: [
          { text: "Được trò chuyện riêng", score: 4 },
          { text: "Được tư vấn, động viên", score: 3 },
          { text: "Tự giải quyết", score: 2 },
          { text: "Chưa sẵn sàng chia sẻ", score: 1 },
        ],
      },
    ],
  },
]

export default function ThoughtSurveyDialog({
  open,
  onOpenChange,
  person,
  onSave,
  allPersonnel = [],
}: ThoughtSurveyDialogProps) {
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [infoFields, setInfoFields] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submittedEvaluation, setSubmittedEvaluation] = useState<ThoughtEvaluation | null>(null)
  const [fullNameInput, setFullNameInput] = useState("")
  const [filteredMatches, setFilteredMatches] = useState<PersonData[]>([])
  const [selectedFullName, setSelectedFullName] = useState<string | null>(null)

  const handleFullNameInputChange = (value: string) => {
    setFullNameInput(value || "")
    setSelectedFullName(null)
    
    if (!value || value.trim() === "") {
      setFilteredMatches([])
      return
    }

    const searchValue = (value || "").toLowerCase()
    const filtered = (allPersonnel || []).filter((p) => {
      const personName = (p["Họ và tên"] || "").toLowerCase()
      return personName.includes(searchValue)
    })
    setFilteredMatches(filtered)
  }

  const handleSelectFullName = (person: PersonData) => {
    const name = person["Họ và tên"]
    setFullNameInput(name)
    setSelectedFullName(name)
    setInfoFields((prev) => ({ ...prev, fullName: name }))
    setFilteredMatches([])
  }

  const handleResponseChange = (questionId: number, answer: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNoteChange = (questionId: number, note: string) => {
    setNotes((prev) => ({ ...prev, [questionId]: note }))
  }

  const handleInfoChange = (fieldId: string, value: string) => {
    setInfoFields((prev) => ({ ...prev, [fieldId]: value }))
  }

  const calculateTotalScore = (): { total: number; max: number } => {
    let total = 0
    let max = 0

    // Iterate through sections and questions (exclude questions 18 & 19 which are open-ended)
    SURVEY_SECTIONS.forEach((section) => {
      section.questions?.forEach((question) => {
        if (question.id >= 18) return // Skip open-ended questions (19, 20)

        const selectedAnswer = responses[question.id]
        if (selectedAnswer) {
          // Find the answer object and get its score
          const answerObj = question.answers.find((a: any) => 
            (a.text === selectedAnswer || a === selectedAnswer)
          )
          if (answerObj) {
            const score = typeof answerObj === 'string' ? 0 : answerObj.score
            total += score
          }
        }

        // Max score is sum of highest score for each question
        const maxScore = Math.max(...(question.answers as any[]).map((a: any) => 
          typeof a === 'string' ? 0 : a.score
        ))
        max += maxScore
      })
    })

    return { total, max }
  }

  const calculateLevel = (total: number, max: number): { level: "an-tam-cong-tac" | "can-tu-van" | "can-de-y-giam-sat"; label: string } => {
    const percentage = max > 0 ? (total / max) * 100 : 0

    if (percentage >= 75) {
      return { level: "an-tam-cong-tac", label: "An tâm công tác" }
    } else if (percentage >= 50) {
      return { level: "can-tu-van", label: "Cần tư vấn" }
    } else {
      return { level: "can-de-y-giam-sat", label: "Cần để ý giám sát" }
    }
  }

  const handleSubmit = () => {
    if (!selectedFullName) {
      alert("Vui lòng chọn họ và tên từ danh sách quân nhân")
      return
    }

    const personData = (allPersonnel || []).find((p) => p["Họ và tên"] === selectedFullName)
    if (!personData) {
      alert("Không tìm thấy quân nhân trong danh sách")
      return
    }

    const { total, max } = calculateTotalScore()
    const { level, label } = calculateLevel(total, max)

    const evaluation: ThoughtEvaluation = {
      tt: personData.TT,
      name: personData["Họ và tên"],
      responses,
      notes,
      infoFields,
      totalScore: Math.round(total * 10) / 10,
      maxScore: max,
      level,
      levelLabel: label,
      evaluatedAt: new Date().toISOString(),
    }

    onSave(evaluation)
    setSubmittedEvaluation(evaluation)
    setSubmitted(true)
    setTimeout(() => {
      onOpenChange(false)
      setResponses({})
      setNotes({})
      setInfoFields({})
      setFullNameInput("")
      setSelectedFullName(null)
      setSubmitted(false)
      setSubmittedEvaluation(null)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            PHIẾU KHẢO SÁT
            <p className="text-sm font-normal mt-2 text-muted-foreground">
              NẮM TÌNH HÌNH TƯ TƯỞNG – ĐỜI SỐNG – TÂM LÝ QUÂN NHÂN
            </p>
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-4 italic">
            (Phiếu dùng cho công tác nắm tư tưởng, phục vụ công tác Đảng – công tác chính trị.
            Thông tin được bảo mật, không dùng làm căn cứ xử lý kỷ luật.)
          </p>
        </DialogHeader>

        {submitted ? (
          <Card className="p-6 bg-blue-50 border-blue-200 text-center">
            <p className="text-lg font-semibold text-blue-700">✓ Khảo sát đã được ghi nhận</p>
            <p className="text-sm text-blue-600 mt-2">Kết quả sẽ được cập nhật trong hồ sơ quân nhân</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* General Info Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm border-b pb-2">I. THÔNG TIN CHUNG (tự nguyện / có thể không ghi tên)</h3>
              <div className="space-y-2 ml-2">
                <div className="relative">
                  <Label className="text-xs">
                    <span className="text-red-500">*</span> Họ và tên
                  </Label>
                  <input
                    type="text"
                    className="w-full border border-border rounded px-2 py-1 text-sm mt-1"
                    value={fullNameInput}
                    onChange={(e) => handleFullNameInputChange(e.target.value)}
                    placeholder="Nhập tên để tìm kiếm..."
                  />
                  {filteredMatches.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 border border-border rounded bg-card shadow-lg max-h-40 overflow-y-auto">
                      {filteredMatches.map((p) => (
                        <button
                          key={p.TT}
                          className="w-full text-left px-2 py-2 hover:bg-secondary/30 text-sm border-b border-border last:border-b-0"
                          onClick={() => handleSelectFullName(p)}
                        >
                          <div className="font-medium">{p["Họ và tên"]}</div>
                          <div className="text-xs text-muted-foreground">{p["Chức vụ"]} - {p["Đơn vị"]}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedFullName && (
                    <p className="text-xs text-green-600 mt-1">✓ Đã chọn: {selectedFullName}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs">Cấp bậc, chức vụ</Label>
                  <input
                    type="text"
                    className="w-full border border-border rounded px-2 py-1 text-sm mt-1 bg-muted disabled:cursor-not-allowed"
                    value={
                      selectedFullName
                        ? allPersonnel.find((p) => p["Họ và tên"] === selectedFullName)?.["Chức vụ"] || ""
                        : ""
                    }
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-xs">Đơn vị</Label>
                  <input
                    type="text"
                    className="w-full border border-border rounded px-2 py-1 text-sm mt-1 bg-muted disabled:cursor-not-allowed"
                    value={
                      selectedFullName
                        ? allPersonnel.find((p) => p["Họ và tên"] === selectedFullName)?.["Đơn vị"] || ""
                        : ""
                    }
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-xs">Thời gian công tác tại đơn vị</Label>
                  <input
                    type="text"
                    className="w-full border border-border rounded px-2 py-1 text-sm mt-1"
                    value={infoFields.duration || ""}
                    onChange={(e) => handleInfoChange("duration", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Questions by section */}
            {SURVEY_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="font-semibold text-sm border-b pb-2">{section.title}</h3>
                <div className="space-y-5 ml-2">
                  {section.questions?.map((question) => (
                    <div key={question.id} className="space-y-2">
                      <p className="font-medium text-sm">
                        {question.id + 1}. {question.question}
                      </p>
                      <RadioGroup
                        value={responses[question.id] || ""}
                        onValueChange={(value) => handleResponseChange(question.id, value)}
                      >
                        <div className="space-y-1 ml-4">
                          {question.answers.map((answer, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <RadioGroupItem value={answer.text} id={`q${question.id}-a${idx}`} />
                              <Label htmlFor={`q${question.id}-a${idx}`} className="cursor-pointer text-sm font-normal">
                                ☐ {answer.text}
                                <span className="text-xs text-muted-foreground ml-2">({answer.score}đ)</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                      {question.hasNote && responses[question.id] === "Có" && (
                        <textarea
                          className="w-full border border-border rounded px-2 py-1 text-sm mt-2 min-h-16"
                          placeholder="Ghi ngắn gọn..."
                          value={notes[question.id] || ""}
                          onChange={(e) => handleNoteChange(question.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Open-ended fields */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">VII. ĐỀ XUẤT VÀ CHIA SẺ RIÊNG</h3>
              <div className="space-y-3 ml-2">
                <div>
                  <Label className="text-sm font-medium">19. Đồng chí có đề xuất, kiến nghị gì với đơn vị?</Label>
                  <textarea
                    className="w-full border border-border rounded px-2 py-1 text-sm mt-2 min-h-16"
                    value={notes[18] || ""}
                    onChange={(e) => handleNoteChange(18, e.target.value)}
                    placeholder="(Không bắt buộc)"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">20. Điều đồng chí muốn chia sẻ riêng (nếu có)</Label>
                  <textarea
                    className="w-full border border-border rounded px-2 py-1 text-sm mt-2 min-h-16"
                    value={notes[19] || ""}
                    onChange={(e) => handleNoteChange(19, e.target.value)}
                    placeholder="(Không bắt buộc)"
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Lưu ý:</strong> Kết quả khảo sát sẽ được cập nhật trong mục "Tư tưởng" của hồ sơ quân nhân.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {submitted ? "Đóng" : "Hủy"}
          </Button>
          {!submitted && (
            <Button onClick={handleSubmit}>
              Gửi khảo sát
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
