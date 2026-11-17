import ScriptLoader from "@/components/public/ScriptLoader";
import HomeContent from "@/components/public/HomeContent";
import SiteInteractions from "@/components/public/SiteInteractions";
import { getContent, getProjects, getSiteImages } from "@/lib/cms";

export default async function Home() {
  const [content, projects, images] = await Promise.all([
    getContent(),
    getProjects(),
    getSiteImages(),
  ]);

  return (
    <>
      <ScriptLoader />
      <HomeContent
        content={content.values}
        defaults={content.defaults}
        projects={projects}
        images={images}
      />
      <SiteInteractions />
    </>
  );
}