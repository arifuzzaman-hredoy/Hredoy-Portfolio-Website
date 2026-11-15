import { expect, test } from "@playwright/test";

const viewports = [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "mobile-390x844", width: 390, height: 844 },
];

for (const viewport of viewports) {
  test(`original Home 07 dark baseline: ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto("/index-7-dark.html", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    const scrollSmootherActive = await page.evaluate(() => {
      const smoother = window.ScrollSmoother?.get();
      smoother?.kill();
      return Boolean(smoother);
    });
    expect(scrollSmootherActive).toBe(true);

    const pageHeight = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    for (let y = 0; y < pageHeight; y += Math.round(viewport.height * 0.75)) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await page.waitForTimeout(200);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot(
      `home-07-dark-${viewport.name}.png`,
      {
        fullPage: true,
        animations: "disabled",
        caret: "hide",
        maxDiffPixelRatio: 0.01,
      },
    );
  });
}
