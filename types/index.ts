export interface PersonData {
  TT: number
  "Họ và tên": string
  "Chức vụ": string
  "Đơn vị": string
  "Điểm danh"?: boolean
  _present?: boolean
  _reason?: string
  [key: string]: any
}

export interface AttendanceRecord {
  tt: number
  present: boolean
  reason: string
}

export interface Task {
  id: string
  name: string
  location: string
  selectedTT: number[]
  createdAt: string
  status: "progressing" | "done"
  completedAt?: string
}

export interface ThoughtEvaluation {
  tt: number
  name: string
  responses: Record<number, string> // question index -> answer text
  notes?: Record<number, string> // question index -> notes/explanations
  infoFields?: Record<string, string> // personal info fields
  totalScore: number
  maxScore?: number
  level: "an-tam-cong-tac" | "can-tu-van" | "can-de-y-giam-sat"
  levelLabel: string
  evaluatedAt: string
}
