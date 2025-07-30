// src/common/acumaticaLoginHelper.js
export async function loginToAcumatica(page) {
  await page.goto('https://kolostat-sandbox.acumatica.com/Frames/Login.aspx?ReturnUrl=%2f');
  await page.getByRole('textbox', { name: 'Username' }).fill('sujithra');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('Coolkaru@22');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Wait for home screen to load before returning
  await page.waitForSelector('input[placeholder="Search..."]', { timeout: 40000 });
}
