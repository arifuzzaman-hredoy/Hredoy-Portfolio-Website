// ASSET_VERSION ensures all static assets (CSS, JS) carry a cache-busting query parameter.
// When updated, EVERY browser (desktop, mobile, tablet) and CDN edge node is GUARANTEED
// to bypass its cache and fetch the latest assets immediately.
export const ASSET_VERSION = "20261123-v7";

export function assetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${ASSET_VERSION}`;
}
