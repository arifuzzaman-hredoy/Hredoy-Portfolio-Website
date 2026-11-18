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
  getSiteImages,
  getSiteSettings,
} from "@/lib/cms";
import { renderCertificatesSection } from "@/lib/certificates-render";

export default async function Home() {
  const [content, projects, lists, images, imageAlts, identity, certificates, categories] =
    await Promise.all([
      getContent(),
      getProjects(),
      getContentItems(),
      getSiteImages(),
      getSiteImageAlts(),
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
        identity={identity}
        certificatesHTML={renderCertificatesSection(certificates, categories)}
      />
      <CertificatesController />
      <SiteInteractions contactEmail={identity.email} />
    </>
  );
}
