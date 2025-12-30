import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { readFile } from "fs/promises"
import { join } from "path"

const EXCEL_FILE_PATH = join(process.cwd(), "data", "detail.xlsx")

function formatExcelDate(value: any): string | number | boolean {
  // If value is already a Date object (XLSX might convert it)
  if (value instanceof Date) {
    // Use UTC methods to avoid timezone shifts
    const day = String(value.getUTCDate()).padStart(2, "0")
    const month = String(value.getUTCMonth() + 1).padStart(2, "0")
    const year = value.getUTCFullYear()
    return `${day}/${month}/${year}`
  }

  if (typeof value === "string") {
    // If it looks like a date string already (dd/mm/yyyy), return as-is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      return value
    }
    // Try to parse other date formats
    const dateMatch = value.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
    if (dateMatch) {
      const [, day, month, year] = dateMatch
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`
    }
  }

  if (typeof value === "number" && value >= 1 && value < 50000) {
    // Excel serial date: Excel uses January 1, 1900 as day 1
    // To avoid timezone issues, calculate using UTC methods
    // Excel epoch: January 1, 1900 (but Excel incorrectly treats 1900 as leap year)
    // So we use December 30, 1899 as the actual epoch
    
    // Convert Excel serial to days since epoch
    const excelEpochUTC = Date.UTC(1899, 11, 30) // December 30, 1899 in UTC
    const daysSinceEpoch = value - 1 // Excel day 1 = Jan 1, 1900
    const milliseconds = excelEpochUTC + daysSinceEpoch * 24 * 60 * 60 * 1000
    
    // Create date using UTC to avoid timezone shifts
    const date = new Date(milliseconds)
    
    // Use UTC methods to extract date components (avoids timezone issues)
    const day = String(date.getUTCDate()).padStart(2, "0")
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const year = date.getUTCFullYear()

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
    // Use raw: false to get formatted dates, but we'll still process them manually
    // to ensure consistent formatting without timezone issues
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null })

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
