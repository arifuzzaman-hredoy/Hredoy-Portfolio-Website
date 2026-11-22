import { Suspense } from "react";
import { connection } from "next/server";
import ScriptLoader from "@/components/public/ScriptLoader";
import HomeContent from "@/components/public/HomeContent";
import SiteInteractions from "@/components/public/SiteInteractions";
import CertificatesController from "@/components/public/CertificatesController";
import {
  getCertificateCategories,
  getCertificates,
  getContent,
  getContentItems,
  getProjects,
  getSiteImageAlts,
  getSiteImageMobiles,
  getSiteImages,
  getSiteSettings,
} from "@/lib/cms";

async function HomeData() {
  await connection();
  const [content, projects, lists, images, imageAlts, mobileImages, identity, certificates, categories] =
    await Promise.all([
      getContent(),
      getProjects(),
      getContentItems(),
      getSiteImages(),
      getSiteImageAlts(),
      getSiteImageMobiles(),
      getSiteSettings(),
      getCertificates(),
      getCertificateCategories(),
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
        mobileImages={mobileImages}
        identity={identity}
        certificates={certificates}
        categories={categories}
      />
      <CertificatesController />
      <SiteInteractions contactEmail={identity.email ?? ""} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeData />
    </Suspense>
  );
}
