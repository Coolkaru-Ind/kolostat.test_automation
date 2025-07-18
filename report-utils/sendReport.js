const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs").promises;
const fileSystem = require("fs");
const archiver = require("archiver");
require("dotenv").config();

// Delay utility (optional wait if needed for file stability)
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Zip the report folder
const zipFolder = async (folderPath, zipPath) => {
  return new Promise((resolve, reject) => {
    const output = fileSystem.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log("✅ Report zipped:", zipPath);
      resolve();
    });

    archive.on("error", (err) => reject(err));
    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
  });
};

// Send the email with zipped report + HTML content from file
const sendEmail = async (zipPath, htmlFilePath) => {
  try {
    // const transporter = nodemailer.createTransport({
    //   host: "captainslogtest.coolkaru.com ",
    //   port: 25,
    //   secure: false,
    //   auth: {
    //     user: mail@CaptainsLogTest.coolkaru.com,
    //     pass: wJ^7w911f,
    //   },
    // });
    // const transporter = nodemailer.createTransport({
    //   service: "gmail", // simpler than setting host/port manually
    //   auth: {
    //     user: process.env.USER_EMAIL, // your Gmail address
    //     pass: process.env.USER_PASSWORD, // Gmail App Password (not your real password)
    //   },
    // });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = await fs.readFile(htmlFilePath, "utf8");
    const customBody = `
  <div style="font-family: Arial, sans-serif; font-size: 14px;">
    <p>Hi Team,</p>
    <p>Please find the attached <strong>Playwright Automation Report</strong>.</p>
    <p>Regards,<br/>Automation Bot</p>
    <hr/>
    <p><strong>Report Preview:</strong></p>
    ${htmlContent}
  </div>
`;

    const mailOptions = {
      from: `"Test-Report" <${process.env.SMTP_USER}>`,
      to: [
        process.env.SENDER_EMAIL_1,
        // process.env.SENDER_EMAIL_2,
        // process.env.SENDER_EMAIL_3,
        // process.env.SENDER_EMAIL_4,
        // process.env.SENDER_EMAIL_5,
      ].filter(Boolean),
      subject: `Automation Report - ${new Date().toLocaleString()}`,
      html: customBody,
      attachments: [
        {
          filename: "report.zip",
          path: zipPath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", info.response);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
};

// Main function
const main = async () => {
  // const zipPath = path.join(__dirname, `report.zip`);
  // const folderPath = "./monocart-report";
  // const htmlFilePath = path.join(__dirname, "../playwright-report/index.html");
  const zipPath = path.join(__dirname, `../report.zip`);
  const folderPath = path.join(__dirname, "../playwright-report");
  const htmlFilePath = path.join(folderPath, "index.html");

  try {
    await delay(5000); // Optional wait to ensure report is complete
    await zipFolder(folderPath, zipPath);
    await sendEmail(zipPath, htmlFilePath);
    await fs.unlink(zipPath); // cleanup
    console.log("🗑️ Zipped file deleted after sending.");
  } catch (err) {
    console.error("❌ Error in main flow:", err);
  }
};

main();
