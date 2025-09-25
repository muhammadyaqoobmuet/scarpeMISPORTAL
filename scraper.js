import puppeteer from "puppeteer-core";
import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();

export async function scrapeAttendanceData() {
  let browser; // 👈 declare outside
  try {
    console.log("🔄 Starting attendance scrape...");

    const cnic = process.env.MIS_CNIC;
    const password = process.env.MIS_PASSWORD;

    browser = await puppeteer.launch({
  executablePath: process.env.GOOGLE_CHROME_BIN || "/usr/bin/google-chrome",

  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  headless: true
});

    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    );

    // LOGIN
    console.log("🔑 Logging in...");
    await page.goto("http://172.16.100.34/mis/login.php", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await page.type("#inputStudentCNIC", cnic);
    await page.type("#inputStudentPassword", password);

    await Promise.all([
      page.click("#studentLogin"),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
    ]);

    // REPORTS PAGE
    console.log("📄 Opening provisional reports page...");
    await page.goto("http://172.16.100.34/mis/provisional_reports_ug.php", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await page.select("#get_Program", "25");
    await page.waitForFunction(
      () => document.querySelector("#get_Session")?.options.length > 1
    );
    await page.select("#get_Session", "263,179,12,Both,0");

    console.log("⏳ Waiting for attendance table...");
    await page.waitForSelector("#table-container", {
      visible: true,
      timeout: 30000,
    });
    await page.waitForSelector(".table.sheet.header-fixed", {
      visible: true,
      timeout: 30000,
    });

    // SCRAPE DATA
    const result = await page.evaluate(() => {
      const table = document.querySelector(".table.sheet.header-fixed");
      if (!table) return { error: "Attendance table not found" };

      const headerRows = Array.from(table.querySelectorAll("thead tr")).map((tr) =>
        Array.from(tr.querySelectorAll("td, th")).map((cell) =>
          cell.innerText.trim()
        )
      );

      const bodyRows = Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
        Array.from(tr.querySelectorAll("td")).map((cell) => cell.innerText.trim())
      );

      return { headers: headerRows, body: bodyRows };
    });

    if (result.error) throw new Error(result.error);

    // Transform data
    const conducted = result.headers[4]?.slice(1) || [];
    const attended = result.body[0]?.slice(2) || [];
    const percentages = result.body[1] || [];

    const subjects = ["DSS", "DS-A", "DS-A Lab", "MAD", "MAD Lab", "TSW", "SPM"];

    const jsonResult = subjects
      .map((subjectName, index) => ({
        subjectName,
        conducted: conducted[index] || "0",
        attended: attended[index] || "0",
        missed:
          (parseInt(conducted[index]) - parseInt(attended[index])).toString() ||
          "0",
        percentage: percentages[index] || "0%",
      }))
      .filter((subject) => subject.conducted !== "0");

    fs.writeFileSync("attendance.json", JSON.stringify(jsonResult, null, 2));
    console.log("💾 Attendance data saved to attendance.json");

    console.log("✅ Scraping completed successfully");
    return { success: true, data: jsonResult };
  } catch (error) {
    console.error("❌ Scraping failed:", error.message);
    return { success: false, error: error.message };
  } finally {
    if (browser) await browser.close();
  }
}

// Run scraper if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  scrapeAttendanceData()
    .then((result) => {
      console.log("Scraping result:", result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Scraper error:", error);
      process.exit(1);
    });
}
