import { test, expect } from '@playwright/test';
import { loginToAcumatica } from '../common/acumaticaloginhelper.spec.js';
import { readAppointmentDataFromExcel } from '../utils/excelReader.js';
import { loginToKolotech } from '../common/Loginhelper.spec.js';
import { readInstructionLinesFromExcel } from '../utils/excelReader.js';

// --- Robust click helper ---
async function robustClick(locator, options = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      await locator.waitFor({ state: 'attached', timeout: 10000 });
      await locator.click(options);
      return;
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise(res => setTimeout(res, 1000));
    }
  }
}

const appointments = readAppointmentDataFromExcel('pmappointment.xlsx');

// --- IMPORTANT: INCREASE OVERALL TEST TIMEOUT ---
// Set a very generous timeout for each test to accommodate your remaining waitForTimeout calls.
// This is 5 minutes (300,000 ms). Adjust as needed.
test.setTimeout(300000); // 5 minutes

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
      await robustClick(serviceOrderInput, { clickCount: 3 });
      await serviceOrderInput.press('Backspace');
      const orderType = data.ServiceOrderType?.toString().trim() || 'PM';
      await serviceOrderInput.fill(orderType);
      await serviceOrderInput.press('Tab');
      await page.waitForTimeout(1500); // Reduced this one as it's not 100s

      // Scheduled Start Date
      if (data.ScheduledStartDate) {
        const schedStart = frame.locator('#ctl00_phF_mainForm_t0_ScheduledDateTimeBegin_Date_text');
        await schedStart.waitFor({ state: 'visible', timeout: 10000 });
        await robustClick(schedStart, { clickCount: 3 });
        await schedStart.press('Backspace');
        await schedStart.type(data.ScheduledStartDate.toString(), { delay: 100 });
        await schedStart.press('Tab');
        await page.waitForTimeout(1000); // Reduced this one
      }

      // Actual Start Date
      if (data.ActualStartDate) {
        const actualStart = frame.locator('#ctl00_phF_mainForm_t0_edExecutionDate_text');
        await actualStart.waitFor({ state: 'visible', timeout: 10000 });
        await robustClick(actualStart, { clickCount: 3 });
        await actualStart.press('Backspace');
        await actualStart.type(data.ActualStartDate.toString(), { delay: 100 });
        await actualStart.press('Tab');
        await page.waitForTimeout(1000); // Reduced this one
      }

      // Customer
      if (data.Customer) {
        const customerInput = frame.locator('#ctl00_phF_mainForm_t0_edCustomerID_text');
        await customerInput.waitFor({ state: 'visible', timeout: 10000 });
        await robustClick(customerInput, { clickCount: 3 });
        await customerInput.press('Backspace');
        await customerInput.type(data.Customer.toString().substring(0, 4), { delay: 100 });
        await page.waitForTimeout(1500); // Reduced this one
        await customerInput.press('ArrowDown');
        await customerInput.press('Enter');
        await page.waitForTimeout(1000); // Reduced this one
      }

      // Location
      if (data.Location) {
        const locationInput = frame.locator('#ctl00_phF_mainForm_t0_ServiceOrderHeader_edLocationID_text');
        await locationInput.waitFor({ state: 'visible', timeout: 10000 });
        await robustClick(locationInput, { clickCount: 3 });
        await locationInput.press('Backspace');
        await locationInput.type(data.Location.toString().substring(0, 3), { delay: 100 });
        await page.waitForTimeout(1500); // Reduced this one
        await locationInput.press('ArrowDown');
        await locationInput.press('Enter');
        await page.waitForTimeout(1000); // Reduced this one
      }

      // Branch Location
      if (data.BranchLocation) {
        const branchLocInput = frame.locator('#ctl00_phF_mainForm_t0_ServiceOrderHeader_edBranchLocationID_text');
        await branchLocInput.waitFor({ state: 'visible', timeout: 10000 });
        await robustClick(branchLocInput, { clickCount: 3 });
        await branchLocInput.press('Backspace');
        await branchLocInput.type(data.BranchLocation.toString().substring(0, 4), { delay: 100 });
        await page.waitForTimeout(1500); // Reduced this one
        await branchLocInput.press('ArrowDown');
        await branchLocInput.press('Enter');
        await page.waitForTimeout(1000); // Reduced this one
      }

      // Service Contract
      if (data.ServiceContract) {
        const serviceContractInput = frame.locator('#ctl00_phF_mainForm_t0_ServiceOrderHeader_edBillServiceContractID_text');
        await serviceContractInput.waitFor({ state: 'visible', timeout: 30000 });
        await robustClick(serviceContractInput, { clickCount: 3 });
        await serviceContractInput.press('Backspace');
        await serviceContractInput.type(data.ServiceContract.toString().substring(0, 6), { delay: 100 });
        await page.waitForTimeout(1500); // Reduced this one
        await serviceContractInput.press('ArrowDown');
        await serviceContractInput.press('Enter');
        await page.waitForTimeout(1000); // Reduced this one
      }

      // Save Appointment
      const saveButton = frame.locator('#ctl00_phDS_ds_ToolBar_Save div.au-target.main-icon-img.main-Save');
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });
      await robustClick(saveButton);
      await page.waitForTimeout(3000); // Reduced this one

      // Open Details Tab
      const detailsTab = frame.locator('#ctl00_phG_tab_tab1');
      await detailsTab.waitFor({ state: 'visible', timeout: 10000 });
      await robustClick(detailsTab);

      // Add Line
      const addButton = frame.locator('#ctl00_phG_tab_t1_PXGridDetails_at_tlb_ul > li:nth-child(2) > .toolsBtn[data-cmd="AddNew"]');
      await addButton.waitFor({ state: 'visible', timeout: 10000 });
      await robustClick(addButton);

      // Line Type
      await robustClick(frame.locator('.edit > td:nth-child(10)').first());
      await robustClick(frame.locator('[id*="edULineType"] div').nth(1));
      await robustClick(frame.locator('[id*="edULineType_dd"]').getByText('Service', { exact: true }));

      // Inventory
      await robustClick(frame.locator('.edit > td:nth-child(13)'));
      await page.waitForTimeout(500); // Keep short waits if truly necessary for UI rendering
      const inventoryInput = frame.locator('#_ctl00_phG_tab_t1_PXGridDetails_lv0_edUInventoryID_text');
      await inventoryInput.waitFor({ state: 'visible', timeout: 5000 });
      await inventoryInput.fill('s.comb');
      await page.waitForTimeout(1000); // Keep short waits if truly necessary
      await inventoryInput.press('ArrowDown');
      await inventoryInput.press('Enter');
      await frame.locator('textarea[id*="PXGridDetails_lv0_edUTranDesc"]').press('Tab');

      // Equipment
      await robustClick(frame.locator('.edit > td:nth-child(17)'));
      await page.waitForTimeout(500); // Keep short waits if truly necessary
      const equipmentInputs = frame.locator('input[id*="edUSMEquipmentID_text"]');
      await expect(equipmentInputs.first()).toBeVisible({ timeout: 5000 });
      await robustClick(equipmentInputs.first());
      await equipmentInputs.first().fill('A/C1');
      await page.waitForTimeout(1500); // Keep short waits if truly necessary
      await equipmentInputs.first().press('ArrowDown');
      await equipmentInputs.first().press('Enter');

      // Staff Selection
      await robustClick(frame.locator('.edit')); // open editable row
      await page.waitForTimeout(500); // Keep short waits if truly necessary

      const staffCell = frame.locator('.edit > td:nth-child(21)');
      await robustClick(staffCell);
      // REPLACED: await page.waitForTimeout(100000);
      await page.waitForTimeout(3000); // Reduced from 100 seconds

      const staffInput = frame.locator('input[id*="edUStaffID_text"]:visible').first();
      // Increased timeout for this specific expectation, but prefer waiting for an action.
      // Better to wait for fill() to complete.
      await expect(staffInput).toBeVisible({ timeout: 10000 }); // Reduced from 100s
      await robustClick(staffInput);
      await staffInput.fill('suji');
      // REPLACED: await page.waitForTimeout(100000);
      await page.waitForTimeout(3000); // Reduced from 100 seconds

      const staffOption = frame.getByText('EMP0000901 - Sujithra Arun', { exact: true }).first();
      // Increased timeout for this specific expectation
      await expect(staffOption).toBeVisible({ timeout: 10000 }); // Reduced from 100s
      await robustClick(staffOption);
      // REPLACED: await page.waitForTimeout(100000);
      await page.waitForTimeout(3000); // Reduced from 100 seconds

      const instructionFinalSaveBtn = frame.locator('#ctl00_phDS_ds_ToolBar_Save div').nth(3);
      // Increased timeout for this specific expectation
      await instructionFinalSaveBtn.waitFor({ state: 'visible', timeout: 10000 }); // Reduced from 100s
      await robustClick(instructionFinalSaveBtn);

      const instructionLines = readInstructionLinesFromExcel('instructionline.xlsx');
      for (const instruction of instructionLines) {
        const { servicetemplateid, description, targetequipmentid } = instruction;

        // Click "Add Line"
        const addLineBtn = frame.locator('#ctl00_phG_tab_t1_PXGridDetails_at_tlb_ul > li:nth-child(2) > .toolsBtn[data-cmd="AddNew"]');
        // Increased timeout for this specific expectation
        await addLineBtn.waitFor({ state: 'visible', timeout: 10000 }); // Reduced from 100s
        await robustClick(addLineBtn);

        // Set Line Type = Instruction
        await robustClick(frame.locator('.edit > td:nth-child(10)').first());
        await robustClick(frame.locator('[id*="edULineType"] div').nth(1));
        await robustClick(frame.locator('[id*="edULineType_dd"]').getByText('Instruction', { exact: true }));
        // REPLACED: await page.waitForTimeout(100000);
        await page.waitForTimeout(3000); // Reduced from 100 seconds

        // Fill Service Template
        const templateCell = frame.locator('.edit > td:nth-child(11)');
        await robustClick(templateCell);
        // REPLACED: await page.waitForTimeout(100000);
        await page.waitForTimeout(3000); // Reduced from 100 seconds
        const selectorInput = frame.locator('input[id*="PXGridDetails_lv0_es_text"]').first();
        await selectorInput.waitFor({ state: 'visible', timeout: 10000 }); // Reduced from 60s
        await robustClick(selectorInput);

        // Step 3: Type and select the service template (if needed), or proceed to popup flow
        await selectorInput.fill(servicetemplateid?.toString() || '');
        // REPLACED: await page.waitForTimeout(100000);
        await page.waitForTimeout(3000); // Reduced from 100 seconds
        await robustClick(selectorInput);
        await selectorInput.press('Tab');
        // REPLACED: await page.waitForTimeout(100000);
        await page.waitForTimeout(3000); // Reduced from 100 seconds
        const descTextarea = frame.locator('textarea[id*="PXGridDetails_lv0_edUTranDesc"]:visible');
        // Increased timeout for this specific expectation
        await descTextarea.waitFor({ state: 'visible', timeout: 10000 }); // Reduced from 100s

        // Step: Fill it with description from Excel
        if (description) {
          await robustClick(descTextarea, { timeout: 10000 }); // Reduced from 100s
          await descTextarea.fill(description.toString());
          await descTextarea.press('Tab');
        }

        if (targetequipmentid) {
          const equipmentInput = frame.locator('input[id*="edUSMEquipmentID_text"]:visible');
          await equipmentInput.waitFor({ state: 'visible', timeout: 10000 }); // Reduced from 100s
          await robustClick(equipmentInput, { timeout: 10000 }); // Reduced from 100s
          await equipmentInput.fill(targetequipmentid.toString());
          await page.waitForTimeout(1000); // Keep short waits if truly necessary
          await equipmentInput.press('ArrowDown');
          await equipmentInput.press('Enter');
        }
      }
      // Final Save
      const finalSaveBtn = frame.locator('#ctl00_phDS_ds_ToolBar_Save div').nth(3);
      await finalSaveBtn.waitFor({ state: 'visible', timeout: 10000 });
      await robustClick(finalSaveBtn);
      console.log('✅ Final Save completed');
      await expect(page).toHaveURL(/RefNbr=/, { timeout: 10000 });
      const acumaticaUrl = page.url();
      const refMatch2 = acumaticaUrl.match(/RefNbr=([^&]+)/);
      const appointmentNumber = refMatch2 ? decodeURIComponent(refMatch2[1]) : null;
      if (!appointmentNumber) {
        throw new Error('❌ Appointment number not found in URL.');
      }
      console.log(`✅ Appointment number extracted: ${appointmentNumber}`);
      await loginToKolotech(page);
      // Navigate to the appropriate appointment search tab in Kolotech
      await page.locator('a').nth(2).click();
      await page.getByRole('textbox', { name: 'Input search text' }).fill(appointmentNumber);
      await page.getByRole('button', { name: 'Search' }).click();
      const appointmentResult = page.getByText(appointmentNumber, { exact: false });
      const foundInPresent = await appointmentResult.isVisible().catch(() => false);
      if (!foundInPresent) {
        // If not found, switch to the Past tab and adjust date filters (if needed)
        await page.getByRole('button', { name: 'Past' }).click();
        await page.locator('a').nth(2).click();
        await page.getByRole('textbox', { name: 'Start date' }).click();
        await page.getByTitle('-06-01').locator('div').click();
        await page.getByTitle('-07-23').locator('div').click();
        await page.getByRole('textbox', { name: 'Input search text' }).fill(appointmentNumber);
        await page.getByRole('button', { name: 'Search' }).click();
        const foundInPast = await page.getByText(appointmentNumber, { exact: false }).isVisible().catch(() => false);
        if (foundInPast) {
          console.log(`✅ Found appointment ${appointmentNumber} in Past`);
        } else {
          console.log(`❌ Appointment ${appointmentNumber} not found in Present or Past`);
        }
      } else {
        console.log(`✅ Found appointment ${appointmentNumber} in Present`);
      }
    });
  });
});