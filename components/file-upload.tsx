"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import * as XLSX from "xlsx"

interface FileUploadProps {
  onDataLoaded: (data: any[]) => void
  onError: (error: string) => void
}

export default function FileUpload({ onDataLoaded, onError }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      onError("Please upload an Excel file (.xlsx or .xls)")
      return
    }

    setIsLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result as ArrayBuffer
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          if (jsonData.length === 0) {
            onError("Excel file is empty")
            return
          }

          onDataLoaded(jsonData)
        } catch (err) {
          onError("Failed to parse Excel file")
          console.error("[v0] Parse error:", err)
        } finally {
          setIsLoading(false)
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (err) {
      onError("Failed to read file")
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files[0]) {
      const inputEvent = {
        target: { files },
      } as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(inputEvent)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="min-h-screen bg-gradient-to-br from-background to-background p-6 md:p-8 flex items-center justify-center"
    >
      <Card className="bg-card border-border w-full max-w-md p-8">
        <div className="space-y-6">
          <div className="text-center">
            <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Upload Excel File</h1>
            <p className="text-muted-foreground">Drag and drop your .xlsx file or click to select</p>
          </div>

          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-primary text-primary-foreground hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Select Excel File"}
            </Button>
          </div>

          <div className="bg-secondary/20 border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">
              Supported formats: .xlsx, .xls
              <br />
              The app will parse the first sheet and display all data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
