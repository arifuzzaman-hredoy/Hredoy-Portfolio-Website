// Server-side access to the Go CMS API. Every call degrades gracefully to an
// empty result so the public page still renders if the backend is unreachable
// (for example during a static `next build` without the API running).

import type { Project } from "./cms-render";
import { cacheLife, cacheTag } from "next/cache";

export type { Project };

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
  images: { key: string; label: string; group: string; url: string; alt: string }[];
  urls: Record<string, string>;
};

// Owner identity as stored in site_settings. The fallbacks mirror the values the
// template shipped with, so a missing row never changes the rendered page.
export const SITE_SETTINGS_DEFAULTS: Record<string, string> = {
  owner_name: "Arifuzzaman Hredoy",
  role: "Junior DevOps Engineer",
  email: "arifuzzamanhredoy@gmail.com",
  github: "https://github.com/arifuzzaman-hredoy",
  linkedin: "https://www.linkedin.com/in/arifuzzaman-hredoy/",
  location: "Rangpur, Bangladesh",
  bio: "Junior DevOps Engineer passionate about Linux, Cloud Computing, Automation, CI/CD, and Infrastructure as Code. I build reliable, automated, production-ready systems.",
};

const BACKEND_URL = (
  process.env.PORTFOLIO_BACKEND_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

async function getJSON<T>(path: string, revalidate = 30): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getContent(): Promise<ContentPayload> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  const data = await getJSON<ContentPayload>("/api/v1/content");
  if (!data) return { count: 0, blocks: [], values: {}, defaults: {} };
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
  return data?.projects ?? [];
}

export async function getSiteImages(): Promise<Record<string, string>> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  const data = await getJSON<SiteImagesPayload>("/api/v1/site-images");
  return data?.urls ?? {};
}

// Alt text for every CMS-managed image slot. Kept separate from
// getSiteImages so the existing URL call sites stay untouched.
export async function getSiteImageAlts(): Promise<Record<string, string>> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  const data = await getJSON<SiteImagesPayload>("/api/v1/site-images");
  const alts: Record<string, string> = {};
  for (const image of data?.images ?? []) alts[image.key] = image.alt;
  return alts;
}

// Owner identity used by the metadata, the JSON-LD block and the contact links.
export async function getSiteSettings(): Promise<Record<string, string>> {
  "use cache";
  cacheTag(CMS_CACHE_TAG);
  cacheLife("minutes");
  const data = await getJSON<Record<string, string>>("/api/v1/site-settings");
  return { ...SITE_SETTINGS_DEFAULTS, ...(data ?? {}) };
}