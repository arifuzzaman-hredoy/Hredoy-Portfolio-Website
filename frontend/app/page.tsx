import dynamic from "next/dynamic";
import { getContent, getProjects } from "@/lib/cms";

// Lazy-load heavy components for better performance
const ScriptLoader = dynamic(() => import("@/components/public/ScriptLoader"), { ssr: true });
const HomeContent = dynamic(() => import("@/components/public/HomeContent"), { ssr: true });
const SiteInteractions = dynamic(() => import("@/components/public/SiteInteractions"), { ssr: true });

export default async function Home() {
  const [content, projects] = await Promise.all([getContent(), getProjects()]);

  return (
    <>
      <ScriptLoader />
      <HomeContent content={content.values} projects={projects} />
      <SiteInteractions />
    </>
  );
}