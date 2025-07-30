// playwright.config.js
const { defineConfig } = require("@playwright/test");

// const capabilities = {
//   browserName: "Chrome",
//   browserVersion: "latest",
//   "LT:Options": {
//     username: process.env.LT_USERNAME || "sumanthcoolkaru",
//     accessKey:
//       process.env.LT_ACCESS_KEY ||
//       "LT_0NuXobJixtTqn6kQ9bxj4gPj9qHFIOy83AIlvY2VFtRQw76",
//     platform: "Windows 10",
//     build: "Kolostat Jenkins Build",
//     name: "Playwright Test",
//     console: true,
//     network: true,
//     video: true,
//     plugin: "playwright",
//   },
// };

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

// require("dotenv").config();

// const capabilities = {
//   browserName: "Chrome",
//   browserVersion: "latest",
//   "LT:Options": {
//     platform: "Windows 10",
//     build: "Playwright Build",
//     name: "Playwright Test on LambdaTest",
//     user: process.env.LT_USERNAME,
//     accessKey: process.env.LT_ACCESS_KEY,
//     network: true,
//     video: true,
//     console: true,
//   },
// };

// module.exports = {
//   projects: [
//     {
//       name: "Chrome - LambdaTest",
//       use: {
//         browserName: "chromium",
//         connectOptions: {
//           wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
//             JSON.stringify(capabilities)
//           )}`,
//         },
//       },
//     },
//   ],
// };
