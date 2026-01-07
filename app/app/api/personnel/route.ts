import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { readFile } from "fs/promises"
import { join } from "path"

const EXCEL_FILE_PATH = join(process.cwd(), "data", "detail.xlsx")

function formatExcelDate(value: any): string | number | boolean {
  if (typeof value === "string") {
    // If it looks like a date string already (dd/mm/yyyy), return as-is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      return value
    }
  }

  if (typeof value === "number" && value >= 100 && value < 60000) {
    // Excel epoch is December 30, 1899
    const excelEpoch = new Date(1899, 11, 30)
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000)

    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  }
  return value
}

function formatRowDates(row: any): any {
  const formatted: any = {}
  for (const [key, value] of Object.entries(row)) {
    formatted[key] = formatExcelDate(value)
  }
  return formatted
}

async function readExcelFile() {
  try {
    const fileBuffer = await readFile(EXCEL_FILE_PATH)
    const workbook = XLSX.read(fileBuffer, { type: "buffer" })

    const sheetName = workbook.SheetNames[0]
    console.log("[v0] Found sheet names:", workbook.SheetNames)
    console.log("[v0] Reading from sheet:", sheetName)

    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    console.log("[v0] Excel data loaded successfully:", data.length, "rows")

    return data.map((row: any) => ({
      ...formatRowDates(row),
      "Điểm danh": row["Điểm danh"] ?? false,
    }))
  } catch (error) {
    console.error("[v0] Error reading Excel file:", error)
    console.error("[v0] Looking for file at:", EXCEL_FILE_PATH)
    throw error
  }
}

export async function GET() {
  try {
    const personnelData = await readExcelFile()
    return NextResponse.json(personnelData)
  } catch (error) {
    console.error("[v0] Error fetching personnel data:", error)
    return NextResponse.json(
      { error: "Failed to fetch personnel data. Check server logs for details." },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { index, attendance } = body

    if (index === undefined || attendance === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const personnelData = await readExcelFile()

    if (index >= 0 && index < personnelData.length) {
      personnelData[index]["Điểm danh"] = attendance
      console.log(`[v0] Updated attendance for row ${index}:`, attendance)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating attendance:", error)
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 })
  }
}
