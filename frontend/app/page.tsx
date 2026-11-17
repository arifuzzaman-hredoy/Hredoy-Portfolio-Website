import ScriptLoader from "@/components/public/ScriptLoader";
import HomeContent from "@/components/public/HomeContent";
import SiteInteractions from "@/components/public/SiteInteractions";
import {
  getContent,
  getContentItems,
  getProjects,
  getSiteImageAlts,
  getSiteImages,
  getSiteSettings,
} from "@/lib/cms";

export default async function Home() {
  const [content, projects, lists, images, imageAlts, identity] = await Promise.all([
    getContent(),
    getProjects(),
    getContentItems(),
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
        lists={lists}
        images={images}
        imageAlts={imageAlts}
        identity={identity}
      />
      <SiteInteractions contactEmail={identity.email} />
    </>
  );
}