import type { PersonData } from "@/types"

const UNIT_CATEGORIES = [
  { id: "c-bo", name: "C bộ", codes: ["c2"] },
  { id: "trung-doi-4", name: "Trung đội 4", codes: ["a1", "a2", "a3"] },
  { id: "trung-doi-5", name: "Trung đội 5", codes: ["a4", "a5", "a6"] },
  { id: "trung-doi-6", name: "Trung đội 6", codes: ["a7", "a8", "a9"] },
  { id: "trung-doi-hl", name: "Trung đội HL", codes: ["a10", "a11", "a12"] },
]

/**
 * Export attendance data to Excel file
 * Creates a file with four sheets: Summary, Absent by Unit, Absent List, and Full List
 */
export async function exportAttendanceToExcel(data: PersonData[]) {
  try {
    // Dynamically import xlsx to reduce initial bundle size
    const XLSX = await import("xlsx")
    // Prepare summary data
    const present = data.filter((p) => !p._present).length
    const absent = data.filter((p) => p._present).length
    const total = data.length

    // Calculate absent count by unit category
    const absentByUnit = UNIT_CATEGORIES.map((category) => {
      const absentInUnit = data.filter(
        (person) =>
          person._present && // Is absent
          category.codes.some((code) => person["Đơn vị"]?.includes(code))
      ).length

      const totalInUnit = data.filter((person) =>
        category.codes.some((code) => person["Đơn vị"]?.includes(code))
      ).length

      return {
        "Đơn vị": category.name,
        "Tổng quân số": totalInUnit,
        "Quân số vắng": absentInUnit,
        "Quân số có mặt": totalInUnit - absentInUnit,
      }
    })

    // Summary sheet data
    const summaryData = [
      { Metric: "Tổng quân số", Value: total },
      { Metric: "Quân số có mặt", Value: present },
      { Metric: "Quân số vắng", Value: absent },
      { Metric: "", Value: "" }, // Empty row
      { Metric: "Ngày xuất báo cáo", Value: new Date().toLocaleDateString("vi-VN") },
    ]

    // Detailed list - only absent personnel with reasons
    const absentData = data
      .filter((p) => p._present) // Only absent people
      .map((person, index) => ({
        STT: index + 1,
        TT: person.TT,
        "Họ và tên": person["Họ và tên"],
        "Chức vụ": person["Chức vụ"],
        "Đơn vị": person["Đơn vị"],
        "Lý do vắng": person._reason || "(Chưa có lý do)",
      }))

    // Also include present personnel for complete view
    const allData = data.map((person, index) => ({
      STT: index + 1,
      TT: person.TT,
      "Họ và tên": person["Họ và tên"],
      "Chức vụ": person["Chức vụ"],
      "Đơn vị": person["Đơn vị"],
      "Trạng thái": person._present ? "Vắng" : "Có mặt",
      "Lý do vắng": person._present ? person._reason || "(Chưa có lý do)" : "-",
    }))

    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Create summary sheet
    const summarySheet = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Tóm tắt")

    // Create absent by unit breakdown sheet
    const absentByUnitSheet = XLSX.utils.json_to_sheet(absentByUnit)
    // Set column widths
    absentByUnitSheet["!cols"] = [
      { wch: 20 }, // Đơn vị
      { wch: 15 }, // Tổng quân số
      { wch: 15 }, // Quân số vắng
      { wch: 15 }, // Quân số có mặt
    ]
    XLSX.utils.book_append_sheet(workbook, absentByUnitSheet, "Vắng theo đơn vị")

    // Create absent personnel sheet (only if there are absent people)
    if (absentData.length > 0) {
      const absentSheet = XLSX.utils.json_to_sheet(absentData)
      // Set column widths
      absentSheet["!cols"] = [
        { wch: 8 }, // STT
        { wch: 8 }, // TT
        { wch: 30 }, // Họ và tên
        { wch: 25 }, // Chức vụ
        { wch: 20 }, // Đơn vị
        { wch: 40 }, // Lý do vắng
      ]
      XLSX.utils.book_append_sheet(workbook, absentSheet, "Danh sách vắng")
    } else {
      // Add empty sheet with message if no absent personnel
      const emptySheet = XLSX.utils.json_to_sheet([{ Message: "Không có quân số vắng" }])
      XLSX.utils.book_append_sheet(workbook, emptySheet, "Danh sách vắng")
    }

    // Create all personnel sheet
    const allSheet = XLSX.utils.json_to_sheet(allData)
    // Set column widths
    allSheet["!cols"] = [
      { wch: 8 }, // STT
      { wch: 8 }, // TT
      { wch: 30 }, // Họ và tên
      { wch: 25 }, // Chức vụ
      { wch: 20 }, // Đơn vị
      { wch: 15 }, // Trạng thái
      { wch: 40 }, // Lý do vắng
    ]
    XLSX.utils.book_append_sheet(workbook, allSheet, "Toàn bộ danh sách")

    // Generate filename with current date (Vietnamese format: DDMMYYYY)
    const now = new Date()
    const day = String(now.getDate()).padStart(2, "0")
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const year = now.getFullYear()
    const filename = `BaoCaoDiemDanh_${day}${month}${year}.xlsx`

    // Write file
    XLSX.writeFile(workbook, filename)

    return { success: true, filename }
  } catch (error) {
    console.error("[Export] Error exporting to Excel:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

