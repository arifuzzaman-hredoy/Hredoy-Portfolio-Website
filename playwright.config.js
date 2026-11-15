import { defineConfig } from "@playwright/test";

const isWindows = process.platform === "win32";
const python = isWindows ? "python" : "python3";

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
    command: `${python} -m http.server 4173 --bind 127.0.0.1 --directory template-source`,
    url: "http://127.0.0.1:4173/index-7-dark.html",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
