import { test, expect } from '@playwright/test';
import { loginToAcumatica } from '../common/acumaticaloginhelper.spec.js';
import { readAppointmentDataFromExcel } from '../utils/excelReader.js';

const appointments = readAppointmentDataFromExcel('pmappointment.xlsx');

test.describe('Create Appointment from Excel', () => {
  console.log(`✅ Filtered Rows Count: ${appointments.length}`);

  appointments.forEach((data, index) => {
    test(`Create appointment entry ${index + 1}`, async ({ page }) => {
      await loginToAcumatica(page);
      await page.goto('https://kolostat-sandbox.acumatica.com/Main?CompanyID=Beaver+-+Production&ScreenId=FS300200');

      const frame = page.frameLocator('iframe[name="main"]');

      // Service Order Type
      const serviceOrderInput = frame.locator('#ctl00_phF_mainForm_t0_edSrvOrdType_text');
      await serviceOrderInput.waitFor({ state: 'visible', timeout: 20000 });
      await serviceOrderInput.click({ clickCount: 3 });
      await serviceOrderInput.press('Backspace');
      const orderType = data.ServiceOrderType?.toString().trim() || 'PM';
      await serviceOrderInput.fill(orderType);
      await serviceOrderInput.press('Tab');
      await page.waitForTimeout(1500);

      // Scheduled Start Date
      if (data.ScheduledStartDate) {
        const schedStart = frame.locator('#ctl00_phF_mainForm_t0_ScheduledDateTimeBegin_Date_text');
        await schedStart.waitFor({ state: 'visible', timeout: 10000 });
        await schedStart.click({ clickCount: 3 });
        await schedStart.press('Backspace');
        await schedStart.type(data.ScheduledStartDate.toString(), { delay: 100 });
        await schedStart.press('Tab');
        await page.waitForTimeout(1000);
      }

      // Actual Start Date
      if (data.ActualStartDate) {
        const actualStart = frame.locator('#ctl00_phF_mainForm_t0_edExecutionDate_text');
        await actualStart.waitFor({ state: 'visible', timeout: 10000 });
        await actualStart.click({ clickCount: 3 });
        await actualStart.press('Backspace');
        await actualStart.type(data.ActualStartDate.toString(), { delay: 100 });
        await actualStart.press('Tab');
        await page.waitForTimeout(1000);
      }

      // Customer
      if (data.Customer) {
        const customerInput = frame.locator('#ctl00_phF_mainForm_t0_edCustomerID_text');
        await customerInput.waitFor({ state: 'visible', timeout: 10000 });
        await customerInput.click({ clickCount: 3 });
        await customerInput.press('Backspace');
        await customerInput.type(data.Customer.toString().substring(0, 4), { delay: 100 });
        await page.waitForTimeout(1500);
        await customerInput.press('ArrowDown');
        await customerInput.press('Enter');
        await page.waitForTimeout(1000);
      }

      // Location
      if (data.Location) {
        const locationInput = frame.locator('#ctl00_phF_mainForm_t0_ServiceOrderHeader_edLocationID_text');
        await locationInput.waitFor({ state: 'visible', timeout: 10000 });
        await locationInput.click({ clickCount: 3 });
        await locationInput.press('Backspace');
        await locationInput.type(data.Location.toString().substring(0, 3), { delay: 100 });
        await page.waitForTimeout(1500);
        await locationInput.press('ArrowDown');
        await locationInput.press('Enter');
        await page.waitForTimeout(1000);
      }

      // Branch Location
      if (data.BranchLocation) {
        const branchLocInput = frame.locator('#ctl00_phF_mainForm_t0_ServiceOrderHeader_edBranchLocationID_text');
        await branchLocInput.waitFor({ state: 'visible', timeout: 10000 });
        await branchLocInput.click({ clickCount: 3 });
        await branchLocInput.press('Backspace');
        await branchLocInput.type(data.BranchLocation.toString().substring(0, 4), { delay: 100 });
        await page.waitForTimeout(1500);
        await branchLocInput.press('ArrowDown');
        await branchLocInput.press('Enter');
        await page.waitForTimeout(1000);
      }

      // Service Contract
      if (data.ServiceContract) {
        const serviceContractInput = frame.locator('#ctl00_phF_mainForm_t0_ServiceOrderHeader_edBillServiceContractID_text');
        await serviceContractInput.waitFor({ state: 'visible', timeout: 30000 });
        await serviceContractInput.click({ clickCount: 3 });
        await serviceContractInput.press('Backspace');
        await serviceContractInput.type(data.ServiceContract.toString().substring(0, 6), { delay: 100 });
        await page.waitForTimeout(1500);
        await serviceContractInput.press('ArrowDown');
        await serviceContractInput.press('Enter');
        await page.waitForTimeout(1000);
      }

      // Save Appointment
      const saveButton = frame.locator('#ctl00_phDS_ds_ToolBar_Save div.au-target.main-icon-img.main-Save');
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });
      await saveButton.click();
      await page.waitForTimeout(3000);

      // Capture RefNbr
      const url = page.url();
      const refMatch = url.match(/RefNbr=([^&]+)/);
      if (refMatch) {
        const refNumber = decodeURIComponent(refMatch[1]);
        console.log(`✅ Appointment saved with RefNbr: ${refNumber}`);
      } else {
        throw new Error('❌ RefNbr not found in URL after saving.');
      }

      // Open Details Tab
      const detailsTab = frame.locator('#ctl00_phG_tab_tab1');
      await detailsTab.waitFor({ state: 'visible', timeout: 10000 });
      await detailsTab.click();

      // Add Line
      const addButton = frame.locator('#ctl00_phG_tab_t1_PXGridDetails_at_tlb_ul > li:nth-child(2) > .toolsBtn[data-cmd="AddNew"]');
      await addButton.waitFor({ state: 'visible', timeout: 10000 });
      await addButton.click();

      // Line Type
      await frame.locator('.edit > td:nth-child(10)').first().click();
      await frame.locator('[id*="edULineType"] div').nth(1).click();
      await frame.locator('[id*="edULineType_dd"]').getByText('Service', { exact: true }).click();

      // Inventory
      await frame.locator('.edit > td:nth-child(13)').click();
      await page.waitForTimeout(500);
      const inventoryInput = frame.locator('#_ctl00_phG_tab_t1_PXGridDetails_lv0_edUInventoryID_text');
      await inventoryInput.waitFor({ state: 'visible', timeout: 5000 });
      await inventoryInput.fill('s.comb');
      await page.waitForTimeout(1000);
      await inventoryInput.press('ArrowDown');
      await inventoryInput.press('Enter');
    
      await frame.locator('textarea[id*="PXGridDetails_lv0_edUTranDesc"]').press('Tab');

      // 1. Click into the Target Equipment ID cell
      await frame.locator('.edit > td:nth-child(17)').click();
      await page.waitForTimeout(500);
      const equipmentInputs = frame.locator('input[id*="edUSMEquipmentID_text"]');
      await expect(equipmentInputs.first()).toBeVisible({ timeout: 5000 });
      await equipmentInputs.first().click();
      await equipmentInputs.first().fill('A/C1');
      await page.waitForTimeout(1500);
      await equipmentInputs.first().press('ArrowDown');
      await equipmentInputs.first().press('Enter');

 // --- Stable Staff Selection (EMP0000901 - Sujithra Arun) ---
await frame.locator('.edit').click(); // avoid targeting the specific column immediately
await page.waitForTimeout(500);

// Step 2: Re-fetch the exact staff field cell
const staffCell = frame.locator('.edit > td:nth-child(21)');
await staffCell.click(); // This is now less likely to detach
await page.waitForTimeout(300);
const staffInput = frame.locator('input[id*="edUStaffID_text"]').first();
await expect(staffInput).toBeVisible({ timeout: 5000 });
const input = staffInput.first();
await input.click();
await staffInput.first().fill('suji');
await page.waitForTimeout(1500);

// Click the matching dropdown option
const staffOption = frame.getByText('EMP0000901 - Sujithra Arun', { exact: true }).first();
await expect(staffOption).toBeVisible({ timeout: 5000 });
await staffOption.click();


      // Final Save
      await frame.locator('#ctl00_phDS_ds_ToolBar_Save div').nth(3).click();
      console.log('✅ Final Save completed');
    });
  });
});
