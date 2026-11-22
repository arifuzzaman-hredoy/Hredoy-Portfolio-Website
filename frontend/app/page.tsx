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
import { renderCertificatesSection } from "@/lib/certificates-render";

export default async function Home() {
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
        certificatesHTML={renderCertificatesSection(certificates, categories)}
      />
      <CertificatesController />
      <SiteInteractions contactEmail={identity.email} />
    </>
  );
}
