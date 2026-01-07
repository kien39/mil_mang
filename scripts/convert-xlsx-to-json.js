const fs = require("fs")
const path = require("path")
const XLSX = require("xlsx")

const EXCEL_FILE_PATH = "C://Users//Administrator//Desktop//detail.xlsx"
const OUTPUT_JSON_PATH = path.join(process.cwd(), "public/personnel.json")

function convertExcelToJson() {
  try {
    console.log("[v0] Reading Excel file from:", EXCEL_FILE_PATH)

    // Read Excel file
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      console.warn("[v0] Excel file not found at:", EXCEL_FILE_PATH)
      console.log("[v0] Skipping conversion. Using existing JSON if available.")
      return
    }

    const workbook = XLSX.readFile(EXCEL_FILE_PATH)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet)

    console.log(`[v0] Read ${data.length} rows from Excel`)

    // Map Đơn vị codes to unit groups
    const UNIT_CATEGORIES = [
      { id: "c-bo", name: "C bộ", codes: ["c2"] },
      { id: "trung-doi-4", name: "Trung đội 4", codes: ["a1", "a2", "a3"] },
      { id: "trung-doi-5", name: "Trung đội 5", codes: ["a4", "a5", "a6"] },
      { id: "trung-doi-6", name: "Trung đội 6", codes: ["a7", "a8", "a9"] },
      { id: "trung-doi-hl", name: "Trung đội HL", codes: ["a10", "a11", "a12"] },
    ]

    function normalizeUnit(unitField) {
      if (!unitField) return "Khác"
      const s = String(unitField).toLowerCase()
      const cat = UNIT_CATEGORIES.find((c) => c.codes.some((code) => s.includes(code)))
      return cat ? cat.name : "Khác"
    }

    // Add attendance field if missing and normalized unit
    const processedData = data.map((row) => ({
      ...row,
      "Điểm danh": row["Điểm danh"] !== undefined ? row["Điểm danh"] : false,
      "Đơn vị nhóm": normalizeUnit(row["Đơn vị"]),
    }))

    // Write to JSON
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(processedData, null, 2), "utf-8")

    console.log(`[v0] ✅ Successfully converted!`)
    console.log(`[v0] Saved to: ${OUTPUT_JSON_PATH}`)
    console.log(`[v0] Total records: ${processedData.length}`)
  } catch (error) {
    console.error("[v0] Error converting Excel:", error.message)
    process.exit(1)
  }
}

convertExcelToJson()
