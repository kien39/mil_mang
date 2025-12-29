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

    // Add attendance field if missing
    const processedData = data.map((row) => ({
      ...row,
      "Điểm danh": row["Điểm danh"] !== undefined ? row["Điểm danh"] : false,
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
