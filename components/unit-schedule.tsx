"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function UnitSchedule() {
  const [sheets, setSheets] = useState<Record<string, any[]>>({})
  const [activeSheet, setActiveSheet] = useState<string | null>(null)

  const handleFile = async (file?: File) => {
    try {
      const f = file
      if (!f) return
      const data = await f.arrayBuffer()
      const wb = XLSX.read(data)
      const parsed: Record<string, any[]> = {}
      wb.SheetNames.forEach((name) => {
        const ws = wb.Sheets[name]
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" })
        parsed[name] = json
      })
      setSheets(parsed)
      setActiveSheet(Object.keys(parsed)[0] || null)
    } catch (err) {
      console.error("Failed to parse schedule file:", err)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold">Lịch công tác đơn vị</h3>
          <p className="text-sm text-muted-foreground">Tải file Excel lịch công tác để hiển thị</p>
        </div>
        <div>
          <input
            id="schedule-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFile(e.target.files ? e.target.files[0] : undefined)}
            className="hidden"
          />
          <label htmlFor="schedule-file">
            <Button size="sm">Tải lên Excel</Button>
          </label>
        </div>
      </div>

      <div>
        {Object.keys(sheets).length === 0 && (
          <div className="text-sm text-muted-foreground">Chưa có lịch. Vui lòng tải file Excel.</div>
        )}

        {Object.keys(sheets).length > 0 && (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {Object.keys(sheets).map((name) => (
                <button
                  key={name}
                  onClick={() => setActiveSheet(name)}
                  className={`px-3 py-1 rounded text-sm ${activeSheet === name ? "bg-primary text-primary-foreground" : "bg-secondary/20 text-muted-foreground"}`}
                >
                  {name}
                </button>
              ))}
            </div>

            {activeSheet && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/30">
                      {Object.keys(sheets[activeSheet][0] || {}).map((col) => (
                        <th key={col} className="px-2 py-1 text-left font-medium">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sheets[activeSheet].map((row: any, idx: number) => (
                      <tr key={idx} className="odd:bg-white even:bg-secondary/10">
                        {Object.keys(row).map((col) => (
                          <td key={col} className="px-2 py-1 truncate">{String(row[col] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
