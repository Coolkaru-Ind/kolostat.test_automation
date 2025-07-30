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
export function readInstructionLinesFromExcel(fileName) {
  const filePath = path.resolve('Data', fileName);
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet);
    const camelCaseJson = jsonData.map(row => {
    const newRow = {};
    for (const key in row) {
      const camelKey = key
        .replace(/\s(.)/g, (_, char) => char.toUpperCase())  // capitalize after space
        .replace(/^./, char => char.toLowerCase());           // lowercase first char
      newRow[camelKey] = row[key];
    }
    return newRow;
  });
  const filtered = jsonData.filter(row =>
    Object.values(row).some(cell => {
      if (typeof cell === 'string') return cell.trim() !== '';
      return cell !== null && cell !== undefined;
    })
  );

  console.log(`✅ Instruction Lines Count: ${filtered.length}`);
  return filtered;
}
