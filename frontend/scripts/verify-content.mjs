import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

const checks = await page.evaluate(() => {
  const body = document.body.innerText;
  const has = (s) => body.includes(s);
  return {
    hredoyName: has("Arifuzzaman Hredoy") || has("Hredoy"),
    aspiringDevops: has("Aspiring DevOps Engineer") || has("DevOps Engineer"),
    rangpur: has("Rangpur"),
    gmail: has("arifuzzamanhredoy@gmail.com"),
    github: has("github.com/arifuzzaman-hredoy"),
    // things that should be GONE
    orisaGone: !has("Orisa") && !has("orisa.com"),
    chicagoGone: !has("Chicago"),
    darrellGone: !has("Darrell") && !has("Amelia") && !has("Esther") && !has("Jacob"),
    mvpGone: !has("MVP Development") && !has("Advancing Startup Innovation"),
  };
});

console.log(JSON.stringify(checks, null, 2));
await browser.close();