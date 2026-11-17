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