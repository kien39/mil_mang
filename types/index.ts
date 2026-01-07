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
