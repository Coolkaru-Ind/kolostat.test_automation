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
    actionTimeout: 15000,
    navigationTimeout: 60000,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: false,
    viewport: null,
    launchOptions: {
      args: ["--start-maximized"],
    },
  },
  // projects: [
  //   {
  //     name: "chromium",
  //     use: {
  //       browserName: "chromium",
  //     },
  //   },
  // ],
  // reporter: [
  //   ["line"],
  //   [
  //     "allure-playwright",
  //     {
  //       resultsDir: "allure-results",
  //     },
  //   ],
  // ],
  reporter: [["html"]],
});
