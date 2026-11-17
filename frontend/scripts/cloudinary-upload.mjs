// Upload every image under frontend/public to Cloudinary and write a
// local-path -> CDN-URL map. Credentials come from the repo-root .env
// (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET).
//
// Usage (from frontend/):
//   node scripts/cloudinary-upload.mjs            # upload
//   node scripts/cloudinary-upload.mjs --dry-run  # list only

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(FRONTEND_DIR, "public");
const ENV_FILE = path.resolve(FRONTEND_DIR, "..", ".env");
const MAP_FILE = path.join(FRONTEND_DIR, "cloudinary-map.json");

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico", ".avif"]);
const DRY_RUN = process.argv.includes("--dry-run");

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}
loadEnv(ENV_FILE);

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD || !KEY || !SECRET) {
  console.error("Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env");
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function publicIdFor(rel) {
  const ext = path.extname(rel);
  return rel.slice(0, -ext.length);
}

async function upload(filePath, publicId) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const timestamp = Math.floor(Date.now() / 1000);

  // Every signed parameter must be part of the signature, sorted by key.
  const params = {
    overwrite: "true",
    public_id: publicId,
    timestamp: String(timestamp),
  };
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const signature = crypto.createHash("sha1").update(toSign + SECRET).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([buf]), path.basename(filePath));
  form.append("api_key", KEY);
  form.append("signature", signature);
  for (const [key, value] of Object.entries(params)) form.append(key, value);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return {
    publicId,
    format: data.format || ext.slice(1),
    url: `https://res.cloudinary.com/${CLOUD}/image/upload/${publicId}.${data.format || ext.slice(1)}`,
    secure_url: data.secure_url,
    bytes: data.bytes,
  };
}

const files = walk(PUBLIC_DIR).filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()));
files.sort();

console.log(`Found ${files.length} images under public/`);
if (DRY_RUN) {
  for (const f of files) {
    const rel = path.relative(PUBLIC_DIR, f).replace(/\\/g, "/");
    console.log(`  ${rel}  ->  ${publicIdFor(rel)}`);
  }
  process.exit(0);
}

const map = {};
const failures = [];
let done = 0;

for (const file of files) {
  const rel = path.relative(PUBLIC_DIR, file).replace(/\\/g, "/");
  const publicId = publicIdFor(rel);
  try {
    const result = await upload(file, publicId);
    map[rel] = result.url;
    done += 1;
    console.log(`[${done}/${files.length}] ${rel} -> ${result.url}`);
  } catch (err) {
    failures.push({ rel, error: String(err.message || err) });
    console.error(`[FAIL] ${rel}: ${err.message}`);
  }
}

fs.writeFileSync(MAP_FILE, JSON.stringify({
  cloud: CLOUD,
  baseUrl: `https://res.cloudinary.com/${CLOUD}/image/upload`,
  count: done,
  images: map,
}, null, 2));

console.log(`\nUploaded ${done}/${files.length}`);
if (failures.length) {
  console.error(`Failures (${failures.length}):`);
  for (const f of failures) console.error(`  ${f.rel}: ${f.error}`);
  process.exit(1);
}
console.log(`Map written to ${path.relative(process.cwd(), MAP_FILE)}`);