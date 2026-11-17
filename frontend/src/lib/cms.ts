// Server-side access to the Go CMS API. Every call degrades gracefully to an
// empty result so the public page still renders if the backend is unreachable
// (for example during a static `next build` without the API running).

import type { Project } from "./cms-render";
import { cacheLife } from "next/cache";

export type { Project };

export type ContentBlock = {
  key: string;
  label: string;
  group: string;
  value: string;
};

export type ContentPayload = {
  count: number;
  blocks: ContentBlock[];
  values: Record<string, string>;
};

export type ProjectsPayload = {
  count: number;
  projects: Project[];
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
  cacheLife("minutes");
  const data = await getJSON<ContentPayload>("/api/v1/content");
  if (!data) return { count: 0, blocks: [], values: {} };
  return {
    count: data.count ?? data.blocks?.length ?? 0,
    blocks: data.blocks ?? [],
    values: data.values ?? {},
  };
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("minutes");
  const data = await getJSON<ProjectsPayload>("/api/v1/projects");
  return data?.projects ?? [];
}