import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: false,
  reporter: "list",
  snapshotPathTemplate:
    "{testDir}/snapshots/{testFilePath}/{arg}{ext}",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node tests/visual/serve.mjs",
    url: "http://127.0.0.1:4173/index-7-dark.html",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
