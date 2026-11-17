import ScriptLoader from "@/components/public/ScriptLoader";
import HomeContent from "@/components/public/HomeContent";
import SiteInteractions from "@/components/public/SiteInteractions";
import {
  getContent,
  getProjects,
  getSiteImageAlts,
  getSiteImages,
  getSiteSettings,
} from "@/lib/cms";

export default async function Home() {
  const [content, projects, images, imageAlts, identity] = await Promise.all([
    getContent(),
    getProjects(),
    getSiteImages(),
    getSiteImageAlts(),
    getSiteSettings(),
  ]);

  return (
    <>
      <ScriptLoader />
      <HomeContent
        content={content.values}
        defaults={content.defaults}
        projects={projects}
        images={images}
        imageAlts={imageAlts}
        identity={identity}
      />
      <SiteInteractions contactEmail={identity.email} />
    </>
  );
}