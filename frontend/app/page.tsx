import { Suspense } from "react";
import { connection } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
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
  getSiteImagesBundle,
  getSiteSettings,
} from "@/lib/cms";

async function HomeData() {
  await connection();
  const [content, projects, lists, siteImages, identity, certificates, categories] =
    await Promise.all([
      getContent(),
      getProjects(),
      getContentItems(),
      getSiteImagesBundle(),
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
        images={siteImages.urls}
        imageAlts={siteImages.alts}
        mobileImages={siteImages.mobiles}
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
