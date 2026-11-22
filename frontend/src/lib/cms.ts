// Server-side access to the Go CMS API. Every value comes strictly from
// PostgreSQL via the Go backend — no static defaults or fallbacks are used.

import type { Project } from "./cms-render";
import {
  CERTIFICATES_PER_PAGE,
  type Certificate,
  type CertificateFilters,
  type CertificatePage,
} from "./certificates-render";
import { cacheLife, cacheTag } from "next/cache";

export type { Certificate, CertificatePage, Project };

// Every CMS read is tagged with this, so a single admin save can expire all of
// them at once via POST /api/revalidate. Keep in sync with the revalidate route.
export const CMS_CACHE_TAG = "cms-content";

export type ContentBlock = {
  key: string;
  label: string;
  group: string;
  value: string;
  type: string;
  sort_order: number;
  default: string;
};

export type ContentPayload = {
  count: number;
  blocks: ContentBlock[];
  values: Record<string, string>;
  defaults: Record<string, string>;
};

export type ProjectsPayload = {
  count: number;
  projects: Project[];
};

export type SiteImagesPayload = {
  count: number;
  images: { key: string; label: string; group: string; url: string; alt: string; mobile_url: string; width: number; height: number; format: string; size: number; mobile_width: number; mobile_height: number; mobile_format: string; mobile_size: number }[];
  urls: Record<string, string>;
};

// One repeatable row from content_items. `meta` carries the list-specific keys
// (href, icon, tags, image, ...) declared by the backend list schema.
export type ContentItem = {
  id: string;
  parent_key: string;
  title: string;
  body: string;
  meta: Record<string, string | string[]>;
  sort_order: number;
};

export type ContentItemsPayload = {
  count: number;
  groups: Record<string, ContentItem[]>;
};

const BACKEND_URL = (
  process.env.PORTFOLIO_BACKEND_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

async function getJSON<T>(path: string, revalidate = 30): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) {
    throw new Error(`CMS backend ${path} returned HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function getContent(): Promise<ContentPayload> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  const data = await getJSON<ContentPayload>("/api/v1/content");
  return {
    count: data.count ?? data.blocks?.length ?? 0,
    blocks: data.blocks ?? [],
    values: data.values ?? {},
    defaults: data.defaults ?? {},
  };
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  const data = await getJSON<ProjectsPayload>("/api/v1/projects");
  return data.projects ?? [];
}

// Repeatable homepage lists, grouped by parent_key.
export async function getContentItems(): Promise<Record<string, ContentItem[]>> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  const data = await getJSON<ContentItemsPayload>("/api/v1/content-items");
  return data.groups ?? {};
}

export async function getSiteImages(): Promise<Record<string, string>> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  const data = await getJSON<SiteImagesPayload>("/api/v1/site-images");
  return data.urls ?? {};
}

// Alt text for every CMS-managed image slot.
export async function getSiteImageAlts(): Promise<Record<string, string>> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  const data = await getJSON<SiteImagesPayload>("/api/v1/site-images");
  const alts: Record<string, string> = {};
  for (const image of data.images ?? []) alts[image.key] = image.alt;
  return alts;
}

// Optional mobile image URLs for art-directed responsive rendering.
export async function getSiteImageMobiles(): Promise<Record<string, string>> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  const data = await getJSON<SiteImagesPayload>("/api/v1/site-images");
  const mobiles: Record<string, string> = {};
  for (const image of data.images ?? []) {
    if (image.mobile_url) mobiles[image.key] = image.mobile_url;
  }
  return mobiles;
}

// Owner identity used by the metadata, the JSON-LD block and the contact links.
export async function getSiteSettings(): Promise<Record<string, string>> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  return getJSON<Record<string, string>>("/api/v1/site-settings");
}

// Published certificates for the public section. The controller repeats this
// query from the browser for search, category, sort and paging.
export async function getCertificates(
  filters: Partial<CertificateFilters> = {},
): Promise<CertificatePage> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  params.set("sort", filters.sort || "order");
  params.set("page", String(filters.page && filters.page > 0 ? filters.page : 1));
  params.set("per_page", String(CERTIFICATES_PER_PAGE));
  const query = params.toString();
  const data = await getJSON<CertificatePage>(`/api/v1/certificates?${query}`);
  return {
    certificates: data.certificates ?? [],
    count: data.count ?? data.certificates?.length ?? 0,
    total: data.total ?? 0,
    page: data.page ?? 1,
    per_page: data.per_page ?? CERTIFICATES_PER_PAGE,
    total_pages: data.total_pages ?? 0,
  };
}

export async function getCertificateCategories(): Promise<string[]> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  const data = await getJSON<{ count: number; categories: string[] }>(
    "/api/v1/certificates/categories",
  );
  return data.categories ?? [];
}