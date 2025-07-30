// playwright.config.js
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./src/testscenarios",
  timeout: 60000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: "https://kolostattechapptest.coolkaru.com",
    actionTimeout: 100000,
    navigationTimeout: 100000,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: false,
    viewport: null,
    launchOptions: {
      args: ["--start-maximized"],
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
  reporter: "list",
  
});
