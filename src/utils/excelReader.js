// utils/excelReader.js
import * as XLSX from 'xlsx';
import path from 'path';

export function readAppointmentDataFromExcel(fileName) {
  const filePath = path.resolve('Data', fileName);
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet);

  const filtered = jsonData.filter(row =>
    Object.values(row).some(cell => {
      if (typeof cell === 'string') return cell.trim() !== '';
      return cell !== null && cell !== undefined;
    })
  );

  console.log(`✅ Filtered Rows Count: ${filtered.length}`);
  return filtered;
}
