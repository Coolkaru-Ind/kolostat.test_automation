const { test, expect } = require('@playwright/test');
const xlsx = require('xlsx');
const path = require('path');

// Extend test timeout to allow complete execution
test('Login Test', async ({ page }) => {
  test.setTimeout(120000); // 2-minute timeout for this test

  // 🔹 1. Login to the application
  await page.goto('https://kolostattechapptest.coolkaru.com/login', {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });

  // Wait for login form and fill credentials
  await page.getByRole('textbox', { name: "* Nom d'utilisateur" }).waitFor({ timeout: 30000 });
  await page.getByRole('textbox', { name: "* Nom d'utilisateur" }).fill('sujithra');
  await page.getByRole('textbox', { name: "* Mot de passe" }).fill('Coolkaru@22');
  await page.getByRole('button', { name: "S'identifier" }).click();

  // Ensure login is successful and switch language to English
  await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
  await page.locator('.ant-dropdown-trigger').first().click();
  await page.getByText('English').click();

  // 🔹 2. Select a random appointment card
  await page.waitForSelector('.ant-card');
  const appointments = await page.locator('.ant-card').all();
  const randomIndex = Math.floor(Math.random() * appointments.length);
  const selectedAppointment = appointments[randomIndex];

  // 🔹 3. Determine appointment status
  const status = await selectedAppointment.locator('text=Not Started').count()
    ? 'Not Started'
    : await selectedAppointment.locator('text=In Process').count()
    ? 'In Process'
    : 'Unknown';

  // 🔹 4. Open the appointment card
  await selectedAppointment.click();

  // 🔹 5. Start the appointment if it's not started
  if (status === 'Not Started') {
    await page.locator('.ant-card.card-active .ant-dropdown-trigger').click();
    await page.getByText('Start', { exact: true }).click();
  }

  // 🔹 6. Go to the Labour tab
  const labourTab = page.getByRole('menuitem', { name: ' Labour' });
  await labourTab.waitFor({ state: 'visible', timeout: 20000 });
  await labourTab.click();

  // 🔹 7. Open Labour log editor
  await page.getByRole('tabpanel', { name: 'Present appointment' }).locator('a').click();
  await page.getByRole('button', { name: '' }).click();

  // 🔹 8. Randomize time
  const randomMinute = Math.floor(Math.random() * 60);
  const hourString = new Date().getHours().toString().padStart(2, '0');
  const minuteString = randomMinute.toString().padStart(2, '0');
  const today = new Date().getDate().toString().padStart(2, '0');

  // 🔹 9. Fill time picker
  await page.locator('div:nth-child(4) .ant-picker-input').click();
  await page.getByTitle(`-07-${today}`).locator('div').click();
  await page.getByText(hourString.replace(/^0/, ''), { exact: true }).nth(1).click();

  const minuteColumn = page.locator('.ant-picker-time-panel-column').nth(1);
  await minuteColumn.waitFor({ state: 'visible', timeout: 5000 });
  await minuteColumn.locator(`div:has-text("${minuteString.replace(/^0/, '')}")`).first().click();
  await page.getByRole('button', { name: 'OK' }).click();

  // 🔹 10. Save Labour log
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: '' }).click(); // Close log popup

  // ---------------------------- Add Parts ----------------------------

  // 🔹 11. Load parts from Excel
  const workbook = xlsx.readFile(path.resolve('Data/Partdetails.xlsx'));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const parts = xlsx.utils.sheet_to_json(sheet);

  // 🔹 12. Navigate to Parts tab
  const partsTab = page.getByRole('menuitem', { name: ' Parts' });
  await partsTab.waitFor({ state: 'visible', timeout: 10000 });
  await partsTab.click();

  // 🔹 13. Loop through each part and add it
  for (const part of parts) {
    await page.getByRole('main').getByRole('button', { name: '' }).click(); // Add button

    // 🔸 Inventory ID selection
    await page.locator('div[class*="ant-select-selector"]').first().click();
    const inventorySearchInput = page.locator('input#basic_InventoryID');
    await inventorySearchInput.waitFor({ state: 'visible', timeout: 15000 });
    await inventorySearchInput.fill(part.InventoryID);
    const dropdownOption = page.locator(`.ant-select-item-option[title="${part.InventoryID}"]`);
    await dropdownOption.waitFor({ state: 'visible', timeout: 15000 });
    await dropdownOption.click();

    // 🔸 Equipment selection (optional)
    if (part.Equipment) {
      const equipmentInput = page.locator('input#basic_Equipment');
      await equipmentInput.waitFor({ state: 'visible', timeout: 10000 });
      await equipmentInput.scrollIntoViewIfNeeded();
      await equipmentInput.click();
      await equipmentInput.fill(part.Equipment);
      await page.keyboard.press('ArrowDown'); // trigger dropdown
      await page.waitForTimeout(1000);

      const equipmentOption = page.locator('.ant-select-item-option').filter({ hasText: part.Equipment });
      const optionCount = await equipmentOption.count();

      if (optionCount > 0) {
        await equipmentOption.first().waitFor({ state: 'visible', timeout: 10000 });
        await equipmentOption.first().click();
      } else {
        console.warn(`⚠️ Equipment option not found for: ${part.Equipment}. Skipping selection.`);
      }
    }

    // 🔸 Fill numeric fields
    await page.getByPlaceholder('Actual quantity').fill(part.Actualquantity.toString());
    await page.getByPlaceholder('Unit cost').fill(part.Unitcost.toString());
    await page.getByPlaceholder('Unit price').fill(part.Unitprice.toString());

    // 🔸 Notes field (optional, needs scroll workaround)
    if (part.Notes) {
      const modalBody = page.locator('.ant-modal-body'); // scroll container
      const notesInput = page.locator('#basic_AdditionalComments'); // reliable selector

      for (let i = 0; i < 3; i++) {
        try {
          await modalBody.evaluate(el => el.scrollTop = el.scrollHeight);
          await notesInput.waitFor({ state: 'visible', timeout: 5000 });
          await notesInput.fill(part.Notes);
          break;
        } catch (err) {
          if (i === 2) throw err;
          await page.waitForTimeout(1000); // Retry
        }
      }
    }

    // 🔸 Save the part
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000); // wait before next part
  }
});
