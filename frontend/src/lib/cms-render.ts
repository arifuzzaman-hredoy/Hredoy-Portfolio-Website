export type Project = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  tech: string;
  repo_url: string;
  live_url: string;
  image_path: string;
  sort_order: number;
  published: boolean;
};

export const cmsUrl = (path: string, fallback: string): string => {
  const value = (path ?? "").trim();
  if (!value) return fallback;
  return /^(\/|https?:\/\/)/i.test(value) ? value : fallback;
};

export function getProjectImage(project: Project): string {
  return cmsUrl(project.image_path ?? "", "");
}
