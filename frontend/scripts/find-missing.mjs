import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const missing = [];
page.on("response", (r) => {
  if (r.status() >= 400) missing.push(r.status() + " " + r.url());
});

await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

console.log("MISSING RESOURCES:");
[...new Set(missing)].sort().forEach((m) => console.log(m));
await browser.close();