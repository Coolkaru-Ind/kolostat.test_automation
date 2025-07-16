const { test, expect } = require("@playwright/test");
const xlsx = require("xlsx");

// Extend timeout to allow bulk data creation
test.setTimeout(180000); // 3 minutes max execution time

// 🔹 1. Load Excel sheet
const workbook = xlsx.readFile("Data/appointments.xlsx"); // Load the Excel file
const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Pick the first sheet
const appointmentData = xlsx.utils.sheet_to_json(sheet); // Convert to JSON rows

// 🔹 2. Create multiple appointments using loop
test("Create multiple appointments from Excel", async ({ page }) => {
  for (let index = 0; index < appointmentData.length; index++) {
    const row = appointmentData[index]; // One appointment row from Excel

    // Extract values from each Excel row
    const serviceOrder = row["ServiceOrder"];
    const customer = row["Customer"];
    const location = row["Location"];
    const project = row["Project"];
    const description = row["Description"];
    const inventory = row["Inventory"];

    // 🔹 3. Login once at the beginning
    if (index === 0) {
      await page.goto("https://kolostattechapptest.coolkaru.com/login", {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });

      // Wait for username and password input fields
      await page.waitForSelector('input[placeholder="Nom d\'utilisateur"]', {
        timeout: 10000,
      });
      await page.waitForSelector('input[placeholder="Mot de passe"]', {
        timeout: 10000,
      });

      // Fill login credentials
      await page
        .getByRole("textbox", { name: "* Nom d'utilisateur" })
        .fill("sujithra");
      await page
        .getByRole("textbox", { name: "* Mot de passe" })
        .fill("Coolkaru@22");
      await page.getByRole("button", { name: "S'identifier" }).click();

      // Change language to English after login
      await page.waitForTimeout(3000); // brief pause for page load
      await page.locator(".ant-dropdown-trigger").first().click();
      await page.getByText("English").click();
    }

    // 🔹 4. Open "Create Appointment" screen
    await page.getByRole("button", { name: "" }).click();

    // 🔹 5. Fill appointment form fields

    // 5.1 Select Service Order Type
    const serviceDropdown = page.getByRole("combobox", {
      name: "* Service order type",
    });
    await serviceDropdown.click();
    await page.getByText(serviceOrder, { exact: true }).click();

    // 5.2 Select Customer
    await page.getByRole("combobox", { name: "* Customer" }).click();
    await page.getByRole("combobox", { name: "* Customer" }).fill(customer);
    await page.waitForSelector(`text=${customer}`, { timeout: 5000 });
    await page.getByText(customer, { exact: false }).click();

    // 5.3 Select Location
    await page.getByRole("combobox", { name: "* Location" }).click();
    await page.getByText(location, { exact: true }).click();

    // 5.4 Select Project
    await page.getByRole("combobox", { name: "* Project" }).click();
    await page.getByText(project, { exact: true }).click();

    // 5.5 Enter Problem Description
    await page
      .getByRole("textbox", { name: "* Problem description" })
      .fill(description);

    // 5.6 Select Inventory
    await page.getByRole("combobox", { name: "* Inventory" }).click();
    await page.getByText(inventory, { exact: true }).click();

    // 🔹 6. Submit the appointment
    await page.getByRole("button", { name: "Create appointment" }).click();

    // 🔹 7. Wait before proceeding to next row
    await page.waitForTimeout(9000); // ensures appointment card is fully rendered
  }
});
