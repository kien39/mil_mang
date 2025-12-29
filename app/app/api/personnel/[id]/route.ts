import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { readFile } from "fs/promises"
import { join } from "path"

const EXCEL_FILE_PATH = join(process.cwd(), "data", "detail.xlsx")

async function readExcelFile() {
  try {
    const fileBuffer = await readFile(EXCEL_FILE_PATH)
    const workbook = XLSX.read(fileBuffer, { type: "buffer" })
    const worksheet = workbook.Sheets["Sheet1"]
    const data = XLSX.utils.sheet_to_json(worksheet)
    return data
  } catch (error) {
    console.error("[v0] Error reading Excel file:", error)
    return []
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const personnelData = await readExcelFile()

    if (id >= 0 && id < personnelData.length) {
      return NextResponse.json(personnelData[id])
    }

    return NextResponse.json({ error: "Person not found" }, { status: 404 })
  } catch (error) {
    console.error("[v0] Error fetching person detail:", error)
    return NextResponse.json({ error: "Failed to fetch person detail" }, { status: 500 })
  }
}
