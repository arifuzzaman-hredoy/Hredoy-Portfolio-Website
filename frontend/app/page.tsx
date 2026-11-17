import ScriptLoader from "@/components/public/ScriptLoader";
import HomeContent from "@/components/public/HomeContent";
import SiteInteractions from "@/components/public/SiteInteractions";
import { getContent, getProjects } from "@/lib/cms";

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