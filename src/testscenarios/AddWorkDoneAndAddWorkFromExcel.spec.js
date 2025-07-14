const { test, expect } = require('@playwright/test');
const xlsx = require('xlsx');
const path = require('path');

test('Update work done and additional work from Excel', async ({ page }) => {
  test.setTimeout(180000);

  // Load Excel data
  const workbook = xlsx.readFile(path.resolve('Data/Workdoneaddworkdetails.xlsx'));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);
  const { AppointmentNumber, WorkDoneText, Equipment, AdditionalWorkDescription } = data[0];

  // 1. Login
  await page.goto('https://kolostattechapptest.coolkaru.com/login');
  await page.getByRole('textbox', { name: "* Nom d'utilisateur" }).fill('sujithra');
  await page.getByRole('textbox', { name: "* Mot de passe" }).fill('Coolkaru@22');
  await page.getByRole('button', { name: "S'identifier" }).click();

  // 2. Switch language
  await page.locator('.ant-dropdown-trigger').first().click();
  await page.getByText('English').click();

  // 3. Search appointment
  await page.getByRole('button', { name: 'Past' }).click();
  await page.waitForTimeout(2000);
  await page.locator('i[class*="iconsminds-filter-2"]').click(); // Clear filter
  await page.getByRole('textbox', { name: 'Input search text' }).fill(AppointmentNumber.toString());
  await page.getByRole('button', { name: 'Search' }).click();
  await page.waitForTimeout(2000);
  await page.locator(`.ant-card:has-text("${AppointmentNumber}")`).first().click();

  // 4. Go to Work done tab
  await page.getByRole('menuitem', { name: ' Work done' }).click();
  await page.waitForTimeout(2000);

  // 5. Click "Add Standard Text"
 for (let i = 0; i < maxScrolls; i++) {
  const options = await page.locator('div[role="option"]').all();

  for (const option of options) {
    const optionText = await option.innerText();
    if (optionText.trim() === WorkDoneText.trim()) {
      await option.hover(); // move focus to the option
      await page.keyboard.press('Enter'); // this will properly trigger the value
      found = true;
      break;
    }
  }

  if (found) break;

  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(300);
}


if (!found) {
  throw new Error(`❌ Could not find WorkDoneText "${WorkDoneText}" in dropdown.`);
}

// ✅ Wait for the rich text editor to populate with the selected value
await page.waitForTimeout(1500);


  // 7. Click Save
  const saveBtn = page.getByRole('button', { name: 'Save' });
  await expect(saveBtn).toBeEnabled({ timeout: 5000 });
  await saveBtn.click();
  await page.waitForTimeout(2000);

  // ---------------- Add Additional Work ----------------
  await page.getByRole('menuitem', { name: ' Add\'l work' }).click();
  await page.getByRole('main').getByRole('button', { name: '' }).click();
  await page.waitForTimeout(1000);

  // Equipment field (optional)
  const equipmentInput = page.locator('input#basic_Equipment');
  if (await equipmentInput.isVisible() && await equipmentInput.isEnabled()) {
    await equipmentInput.fill(Equipment);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  }

  // Fill Additional Work Description and Save
  await page.getByPlaceholder('Description').fill(AdditionalWorkDescription);
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(1000);
});
