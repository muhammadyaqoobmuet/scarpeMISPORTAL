import puppeteer from "puppeteer";
import fs from "node:fs";

async function scrapeMIS(cnic, password) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: null,
  });

  const page = await browser.newPage();

  // LOGIN
  console.log("🔑 Logging in...");
  await page.goto("http://172.16.100.34/mis/login.php", { waitUntil: "networkidle2" });
  await page.type("#inputStudentCNIC", cnic);
  await page.type("#inputStudentPassword", password);
  
  await Promise.all([
    page.click("#studentLogin"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  // REPORTS PAGE
  console.log("📄 Opening provisional reports page...");
  await page.goto("http://172.16.100.34/mis/provisional_reports_ug.php", { waitUntil: "networkidle2" });
  
  await page.select("#get_Program", "25");
  await page.waitForFunction(() => document.querySelector("#get_Session")?.options.length > 1);
  await page.select("#get_Session", "263,179,12,Both,0");

  console.log("⏳ Waiting for table-container...");
  await page.waitForSelector("#table-container", { visible: true });
  
  console.log("⏳ Waiting for attendance table...");
  await page.waitForSelector(".table.sheet.header-fixed", { visible: true, timeout: 15000 });

  // Save debug HTML
  const html = await page.content();
  fs.writeFileSync("debug.html", html);
  console.log("🐞 Saved full HTML to debug.html");

// SCRAPE DATA - IMPROVED ACCURATE VERSION
const result = await page.evaluate(() => {
  const table = document.querySelector(".table.sheet.header-fixed");
  if (!table) return { error: "Attendance table not found" };

  const headerRows = Array.from(table.querySelectorAll("thead tr")).map(tr =>
    Array.from(tr.querySelectorAll("td, th")).map(cell => cell.innerText.trim())
  );

  const bodyRows = Array.from(table.querySelectorAll("tbody tr")).map(tr =>
    Array.from(tr.querySelectorAll("td")).map(cell => cell.innerText.trim())
  );

  return { headers: headerRows, body: bodyRows };
});

// transform into json
// --- Transform into JSON ---





const conducted = result.headers[4].slice(1); // class conducted
const attended = result.body[0].slice(2);    // attended values
const percentages = result.body[1];          // percentages


const jsonResult = [{
  subjectName:"DSS",
  conducted: conducted[0],
  attended: attended[0],
  missed: conducted[0] - attended[0],
  percentage: percentages[0]
},
{
  subjectName:"DS-A",
  conducted: conducted[1],
  attended: attended[1],
  missed: conducted[1] - attended[1],
  percentage: percentages[1]
},
{
  subjectName:"DS-A Lab",
  conducted: conducted[2],
  attended: attended[2],
  missed: conducted[2] - attended[2],
  percentage: percentages[2]
},
{
  subjectName:"MAD",
  conducted: conducted[3],
  attended: attended[3],
  missed: conducted[3] - attended[3],
  percentage: percentages[3]
}
,{
  subjectName:"MAD Lab",
  conducted: conducted[4],
  attended: attended[4],
  missed: conducted[4] - attended[4],
  percentage: percentages[4]
},{
  subjectName:"TSW",
  conducted: conducted[5],
  attended: attended[5],
  missed: conducted[5] - attended[5],
  percentage: percentages[5]
},{
subjectName:"SPM",
  conducted: conducted[6],
  attended: attended[6],
  missed: conducted[6] - attended[6],
  percentage: percentages[6]
}
]



console.log(jsonResult);
  console.log("✅ Scraping result:", JSON.stringify(jsonResult, null, 2));
  
  console.log("📁 Saved to attendance.json");

  await browser.close();
  return jsonResult;
}

// Usage
scrapeMIS("43403-0417666-3", "passwd123A.#");