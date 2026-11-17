import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);

const state = await page.evaluate(() => {
  const w = window;
  return {
    jquery: !!w.jQuery,
    gsap: !!w.gsap,
    scrollTrigger: !!w.ScrollTrigger,
    scrollSmoother: !!w.ScrollSmoother,
    swiper: !!w.Swiper,
    niceSelect: !!(w.jQuery && w.jQuery.fn && w.jQuery.fn.niceSelect),
    carouselTicker: !!(w.jQuery && w.jQuery.fn && w.jQuery.fn.carouselTicker),
    // Did ScrollSmoother wrap the content? It sets a transform on #smooth-content
    smoothContentTransform: (() => {
      const el = document.querySelector("#smooth-content");
      return el ? el.style.transform || getComputedStyle(el).transform : "no-el";
    })(),
    // Are GSAP animations present on fade elements?
    fadeAnimCount: document.querySelectorAll(".at_fade_anim").length,
    marqueePresent: document.querySelectorAll(".marquee").length,
    odometer: document.querySelectorAll(".odometer").length,
  };
});

console.log("STATE:", JSON.stringify(state, null, 2));
console.log("CONSOLE ERRORS:", errors.length ? errors : "none");

await browser.close();