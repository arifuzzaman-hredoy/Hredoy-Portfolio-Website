import type { ContentItem } from "@/lib/cms";
import type { CertificatePage } from "@/lib/certificates-render";
import type { Project } from "@/lib/cms-render";
import type { PortfolioData } from "@/lib/portfolio-data";
import AboutSection from "./sections/AboutSection";
import BackToTop from "./sections/BackToTop";
import CertificatesSection from "./sections/CertificatesSection";
import ContactSection from "./sections/ContactSection";
import CtaSection from "./sections/CtaSection";
import Footer from "./sections/Footer";
import Header from "./sections/Header";
import HeroSection from "./sections/HeroSection";
import MarqueeSection from "./sections/MarqueeSection";
import MissionSection from "./sections/MissionSection";
import OffcanvasSidebar from "./sections/OffcanvasSidebar";
import OtherProjectsSection from "./sections/OtherProjectsSection";
import ProcessSection from "./sections/ProcessSection";
import ProjectsSection from "./sections/ProjectsSection";
import SearchOverlay from "./sections/SearchOverlay";
import SkillsSection from "./sections/SkillsSection";

type HomeContentProps = {
  content?: Record<string, string>;
  defaults?: Record<string, string>;
  projects?: Project[];
  lists?: Record<string, ContentItem[]>;
  images?: Record<string, string>;
  imageAlts?: Record<string, string>;
  mobileImages?: Record<string, string>;
  identity?: Record<string, string>;
  certificates?: CertificatePage;
  categories?: string[];
};

const EMPTY_CERTIFICATES: CertificatePage = {
  certificates: [],
  count: 0,
  total: 0,
  page: 1,
  per_page: 9,
  total_pages: 0,
};

export default function HomeContent({
  content = {},
  defaults = {},
  projects = [],
  lists = {},
  images = {},
  imageAlts = {},
  mobileImages = {},
  identity = {},
  certificates = EMPTY_CERTIFICATES,
  categories = [],
}: HomeContentProps) {
  const data: PortfolioData = {
    content,
    defaults,
    projects,
    lists,
    images,
    imageAlts,
    mobileImages,
    identity,
    certificates,
    categories,
  };

  return (
    <>
      <SearchOverlay data={data} />
      <Header data={data} />
      <OffcanvasSidebar data={data} />

      <div className="px-blur-bottom" />
      <div id="magic-cursor" className="cursor-black-bg">
        <div id="ball" />
      </div>

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <HeroSection data={data} />
            <AboutSection data={data} />
            <ProjectsSection data={data} />
            <MissionSection data={data} />
            <SkillsSection data={data} />
            <ProcessSection data={data} />
            <CtaSection data={data} />
            <MarqueeSection data={data} />
            <OtherProjectsSection data={data} />
            <CertificatesSection page={data.certificates} categories={data.categories} />
            <ContactSection data={data} />
          </main>
          <Footer data={data} />
        </div>
      </div>

      <BackToTop />
    </>
  );
}
