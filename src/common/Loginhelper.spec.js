// src/Common/loginHelper.js
export async function loginToKolotech(page) {
  await page.goto('https://kolostattechapptest.coolkaru.com/login');
  await page.getByRole('textbox', { name: "* Nom d'utilisateur" }).fill('sujithra');
  await page.getByRole('textbox', { name: "* Mot de passe" }).fill('Coolkaru@22');
  await page.getByRole('button', { name: "S'identifier" }).click();

  // Switch to English (optional)
  await page.locator('.ant-dropdown-trigger').first().click();
  await page.getByText('English').click();
}
