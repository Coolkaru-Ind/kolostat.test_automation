const { test, expect } = require('@playwright/test');

test('Login Test', async ({ page }) => { test.setTimeout(120000);
  await page.goto('https://kolostattechapptest.coolkaru.com/login', {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });

  await page.getByRole('textbox', { name: "* Nom d'utilisateur" }).waitFor({ timeout: 30000 });
  await page.getByRole('textbox', { name: "* Nom d'utilisateur" }).fill('sujithra');
  await page.getByRole('textbox', { name: "* Mot de passe" }).fill('Coolkaru@22');
  await page.getByRole('button', { name: "S'identifier" }).click();

  await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
  await page.locator('.ant-dropdown-trigger').first().click();
  await page.getByText('English').click();

  await page.getByRole('button', { name: '' }).click();
  const serviceOptions = [
  'TMVT - Temps et Matériels Ventilation',
  'TMCB - Temps et Matériels Combustion',
  'TMCT - Temps et Matériels Contrôle',
  ];
  const randomOption = serviceOptions[Math.floor(Math.random() * serviceOptions.length)];
  const serviceDropdown = page.getByRole('combobox', { name: '* Service order type' });
  await serviceDropdown.waitFor({ timeout: 10000 });
  await serviceDropdown.click();
  await page.getByText(randomOption, { exact: true }).click();

  // 4. Select Client
  await page.getByRole('combobox', { name: '* Customer' }).waitFor();
  await page.getByRole('combobox', { name: '* Customer' }).click();
  await page.getByRole('combobox', { name: '* Customer' }).fill('155');
  // ✅ Wait for the matching suggestion to appear
  await page.waitForSelector('text=EDIFICE PLACE RL', { timeout: 5000 });
  await page.getByText('EDIFICE PLACE RL', { exact: false }).click();

  // 5. Select Emplacement
  await page.getByRole('combobox', { name: '* Location' }).waitFor();
  await page.getByRole('combobox', { name: '* Location' }).click();
  await page.getByText('MAIN - Primary location', { exact: true }).click();

  // 6. Select Projet
  await page.getByRole('combobox', { name: '* Project' }).waitFor();
  await page.getByRole('combobox', { name: '* Project' }).click();
  await page.getByText('X - Non-Project Code.', { exact: true }).click();

  // 7. Fill Description
  await page.getByRole('textbox', { name: '* Problem description' }).waitFor();
  await page.getByRole('textbox', { name: '* Problem description' }).fill('test appointment');

  // 8. Select Inventaire
  const inventoryOptions = [
  'S.COMBU CCQ REG - Technicien Combustion CCQ - Temps Régulier',
  'S.COMBU CCQ TD - Technicien Combustion CCQ - Temps Double',
  'S.COMBU REG - Technicien Combustion Non CCQ - Temps Régulier',
  'S.COMBU TD - Technicien Combustion Non CCQ - Temps Double',
  'S.CTRL REG - Technicien Contrôle - Temps Régulier',
  'S.CTRL TD - Technicien Contrôle - Temps Double',
  'S.VENTI CCQ REG - Technicien Ventilation CCQ - Temps Régulier',
  'S.VENTI CCQ TD - Technicien Ventilation CCQ - Temps Double',
  ];

  const randomInventory = inventoryOptions[Math.floor(Math.random() * inventoryOptions.length)];
  const inventoryDropdown = page.getByRole('combobox', { name: '* Inventory' });
  await inventoryDropdown.waitFor({ timeout: 10000 });
  await inventoryDropdown.click();
  await page.waitForSelector(`text=${randomInventory}`, { timeout: 5000 });
  await page.getByText(randomInventory, { exact: true }).click();

  // 9. Click Submit Button
  await page.getByRole('button', { name: 'Create appointment' }).waitFor();
  await page.getByRole('button', { name: 'Create appointment' }).click();
  await page.locator('.ant-card .ant-tag:has-text("Not Started")').first().waitFor();

  // Get the appointment card containing the first "Not Started"
  const firstNotStartedCard = page.locator('.ant-card').filter({
  has: page.locator('.ant-tag:has-text("Not Started")')
  }).first();

  // Click the appointment card
  await firstNotStartedCard.click();

  // Open the 3-dot dropdown menu
  await firstNotStartedCard.locator('.ant-dropdown-trigger').click();

  // Click "Start"
  await page.getByText('Start', { exact: true }).click();

  // Open dropdown again and click "Pause"
  await firstNotStartedCard.locator('.ant-dropdown-trigger').click();
  await page.getByText('Pause', { exact: true }).click();
  // 1. Locate and click the first appointment with status "In Process"
  const inProcessCard = page.locator('.ant-card').filter({
  has: page.locator('.ant-tag:has-text("In Process")')
  }).first();
  await inProcessCard.waitFor({ timeout: 10000 });
  await inProcessCard.click();

  // 2. Navigate to Labour tab (robust wait and fallback handling)
  const labourTab = page.locator('[role="menuitem"]', { hasText: 'Labour' }).first();
  await labourTab.waitFor({ state: 'visible', timeout: 10000 });
  await labourTab.click();

  // 3. Open labour log
  await page.getByRole('tabpanel', { name: 'Present appointment' }).locator('a').click();
  await page.getByRole('button', { name: '' }).click();

  // 4. Generate random time
  const randomMinute = Math.floor(Math.random() * 60);
  const hourString = new Date().getHours().toString().padStart(2, '0');
  const minuteString = randomMinute.toString().padStart(2, '0');
  const today = new Date().getDate().toString().padStart(2, '0');

  // 5. Pick date & time in the popup
  await page.locator('div:nth-child(4) .ant-picker-input').click();
  await page.getByTitle(`-07-${today}`).locator('div').click(); // pick today
  await page.getByText(hourString.replace(/^0/, ''), { exact: true }).nth(1).click(); // hour
  // Scope minute selection inside the minute column
  const minuteColumn = page.locator('.ant-picker-time-panel-column').nth(1);
  await minuteColumn.waitFor({ state: 'visible', timeout: 5000 });

  const minuteOption = minuteColumn.locator(`div:has-text("${minuteString.replace(/^0/, '')}")`);
  await minuteOption.first().click();
  await page.getByRole('button', { name: 'OK' }).click();

  // 6. Save the updated labour log
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: '' }).click(); // Close
  // 1. Click on Parts tab
  const partsTab = page.getByRole('menuitem', { name: ' Parts' });
  await partsTab.waitFor({ state: 'visible', timeout: 10000 });
  await partsTab.click();
  // 2. Click Add Parts button
  await page.getByRole('main').getByRole('button', { name: '' }).click();

  // 3. Click Inventory ID dropdown and choose a random option

await page.getByRole('combobox', { name: '* Inventory ID' }).click();

// Retry loop for slow loading dropdown items
let inventoryOptionsp = [];
for (let i = 0; i < 10; i++) {  // Retry up to 10 times (roughly 10 seconds)
  await page.waitForTimeout(1000);  // Wait 1 second between attempts
  inventoryOptionsp = await page.locator('.ant-select-item-option-content').allTextContents();
  if (inventoryOptionsp.length > 0) break;
}

if (inventoryOptionsp.length === 0) {
  throw new Error('No Inventory ID options found after waiting.');
}

const randomInventoryp = inventoryOptionsp[Math.floor(Math.random() * inventoryOptionsp.length)];
await page.getByText(randomInventoryp, { exact: false }).click();

  // 4. Try to click Equipment dropdown
// 4. Try to click Equipment dropdown
const equipmentDropdown = page.getByRole('combobox', { name: 'Equipment' });
await equipmentDropdown.click();

// Retry loop for slow-loading dropdown options
let equipmentOptions = [];
for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(1000);
  equipmentOptions = await page.locator('.ant-select-item-option-content').allTextContents();
  if (equipmentOptions.length > 0) break;
}

// Filter out invalid/no-data entries
const validEquipmentOptions = equipmentOptions.filter(opt => !opt.toLowerCase().includes('no data'));

if (validEquipmentOptions.length > 0) {
  const randomEquipment = validEquipmentOptions[Math.floor(Math.random() * validEquipmentOptions.length)];
  const equipmentLocator = page.getByText(randomEquipment, { exact: false });

  // Use isVisible() to avoid timing issues
  if (await equipmentLocator.isVisible()) {
    await equipmentLocator.click();
  } else {
    console.warn('Equipment option found but not visible, skipping...');
  }
} else {
  console.log('No valid equipment options available, leaving Equipment field blank...');
}

// 5. Random values for quantity, cost, and price
const quantity = Math.floor(Math.random() * 100) + 1;
const unitCost = Math.floor(Math.random() * 100) + 1;
const unitPrice = Math.floor(Math.random() * 100) + 1;

await page.getByRole('spinbutton', { name: 'Actual quantity' }).fill(quantity.toString());
await page.getByRole('spinbutton', { name: 'Unit cost' }).fill(unitCost.toString());
await page.getByRole('spinbutton', { name: 'Unit price' }).fill(unitPrice.toString());

// 6. Notes field
await page.getByRole('textbox', { name: 'Notes' }).fill('Automated note - Playwright test');

// 7. Save
await page.getByRole('button', { name: 'Save' }).click();

});
// Click on the pencil/edit icon of the first part entry (assumed to be the most recent one)
await page.getByRole('button', { name: '' }).first().click(); // or use a more specific locator if needed

// Generate random values
const updatedQuantity = Math.floor(Math.random() * 100) + 1;
const updatedCost = Math.floor(Math.random() * 100) + 1;
const updatedPrice = Math.floor(Math.random() * 100) + 1;

// Update Actual Quantity
const quantityInput = page.getByRole('spinbutton', { name: 'Actual quantity' });
await quantityInput.waitFor({ state: 'visible', timeout: 5000 });
await quantityInput.fill(updatedQuantity.toString());

// Update Unit Cost
const unitCostInput = page.getByRole('spinbutton', { name: 'Unit cost' });
await unitCostInput.fill(updatedCost.toString());

// Update Unit Price
const unitPriceInput = page.getByRole('spinbutton', { name: 'Unit price' });
await unitPriceInput.fill(updatedPrice.toString());

// Save changes
await page.getByRole('button', { name: 'Save' }).click();
