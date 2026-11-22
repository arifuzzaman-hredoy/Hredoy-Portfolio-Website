import type { ContentItem } from "./cms";
import type { CertificatePage } from "./certificates-render";
import type { Project } from "./cms-render";

export type PortfolioData = {
  content: Record<string, string>;
  defaults: Record<string, string>;
  projects: Project[];
  lists: Record<string, ContentItem[]>;
  images: Record<string, string>;
  imageAlts: Record<string, string>;
  mobileImages: Record<string, string>;
  identity: Record<string, string>;
  certificates: CertificatePage;
  categories: string[];
};

const CLOUDINARY_UPLOAD = "/image/upload/";

export function optimizeCloudinaryUrl(raw: string): string {
  const src = raw.trim();
  if (!src) return "";
  if (!src.includes("res.cloudinary.com") || !src.includes(CLOUDINARY_UPLOAD)) return src;
  if (/\.(svg|webp)(\?|$)/i.test(src) || /brand-logo/i.test(src)) return src;
  const idx = src.indexOf(CLOUDINARY_UPLOAD);
  const after = src.slice(idx + CLOUDINARY_UPLOAD.length);
  if (after.includes("/f_webp") || after.startsWith("f_webp")) return src;
  return src.slice(0, idx + CLOUDINARY_UPLOAD.length) + "f_webp,q_auto/" + after;
}

export function val(data: PortfolioData, key: string): string {
  return (data.content[key] ?? data.defaults[key] ?? "").trim();
}

export function lines(data: PortfolioData, key: string): string[] {
  return val(data, key)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function listItems(data: PortfolioData, key: string): ContentItem[] {
  const items = data.lists[key] ?? [];
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

export function metaText(item: ContentItem, key: string): string {
  const raw = item.meta?.[key];
  if (Array.isArray(raw)) return raw.join(", ");
  return typeof raw === "string" ? raw.trim() : "";
}

export function metaTags(item: ContentItem, key: string): string[] {
  const raw = item.meta?.[key];
  if (Array.isArray(raw)) return raw.map((t) => String(t).trim()).filter(Boolean);
  if (typeof raw === "string") return raw.split(",").map((t) => t.trim()).filter(Boolean);
  return [];
}

export function safeHref(raw: string | undefined, fallback = "#"): string {
  const v = (raw ?? "").trim();
  if (!v) return fallback;
  if (/^(https?:\/\/|mailto:|#|\/)/i.test(v)) return v;
  return fallback;
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
