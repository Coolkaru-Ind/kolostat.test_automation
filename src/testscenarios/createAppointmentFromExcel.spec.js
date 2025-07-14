import { test, expect } from '@playwright/test';
import { loginToKolotech } from '../common/Loginhelper.spec.js';
import xlsx from 'xlsx';

// Extend timeout to allow bulk data creation
test.setTimeout(180000); // 3 minutes max execution time

// 🔹 1. Load Excel sheet
const workbook = xlsx.readFile('Data/appointments.xlsx'); // Load the Excel file
const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Pick the first sheet
const appointmentData = xlsx.utils.sheet_to_json(sheet); // Convert to JSON rows

// 🔹 2. Create multiple appointments using loop
test('Create multiple appointments from Excel', async ({ page }) => {
  for (let index = 0; index < appointmentData.length; index++) {
    const row = appointmentData[index]; // One appointment row from Excel

    const serviceOrder = row['ServiceOrder'];
    const customer     = row['Customer'];
    const location     = row['Location'];
    const project      = row['Project'];
    const description  = row['Description'];
    const inventory    = row['Inventory'];

    // 🔹 3. Login only once
    if (index === 0) {
      await loginToKolotech(page);
    }

    // 🔹 4. Open "Create Appointment" screen
    await page.getByRole('button', { name: '' }).click();

    // 🔹 5. Fill appointment form fields
    await page.getByRole('combobox', { name: '* Service order type' }).click();
    await page.getByText(serviceOrder, { exact: true }).click();

    await page.getByRole('combobox', { name: '* Customer' }).click();
    await page.getByRole('combobox', { name: '* Customer' }).fill(customer);
    await page.waitForSelector(`text=${customer}`, { timeout: 5000 });
    await page.getByText(customer, { exact: false }).click();

    await page.getByRole('combobox', { name: '* Location' }).click();
    await page.getByText(location, { exact: true }).click();

    await page.getByRole('combobox', { name: '* Project' }).click();
    await page.getByText(project, { exact: true }).click();

    await page.getByRole('textbox', { name: '* Problem description' }).fill(description);

    await page.getByRole('combobox', { name: '* Inventory' }).click();
    await page.getByText(inventory, { exact: true }).click();

    // 🔹 6. Submit the appointment
    await page.getByRole('button', { name: 'Create appointment' }).click();

    // 🔹 7. Wait before next iteration
    await page.waitForTimeout(9000);
  }
});
