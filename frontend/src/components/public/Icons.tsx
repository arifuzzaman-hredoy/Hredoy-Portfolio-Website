import Link from "next/link";
import type { PortfolioData } from "@/lib/portfolio-data";
import CmsImage from "./CmsImage";

export function ArrowDiagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
      <path d="M11.0037 3.41421L2.39712 12.0208L0.98291 10.6066L9.5895 2H2.00373V0H13.0037V11H11.0037V3.41421Z" fill="currentColor" />
    </svg>
  );
}

export function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
      <path d="M8.33333 1L13 5.66667M13 5.66667L8.33333 10.3333M13 5.66667H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowUpRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SocialIcon({ name }: { name: string }) {
  const key = name.trim().toLowerCase();
  if (key.includes("github")) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" fill="currentColor" />
      </svg>
    );
  }
  if (key.includes("linkedin")) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M15.3352 15.339H12.6697V11.1622C12.6697 10.1662 12.6495 8.8845 11.2807 8.8845C9.89102 8.8845 9.67872 9.9683 9.67872 11.0887V15.339H7.01322V6.75H9.57372V7.9207H9.60822C9.96602 7.2457 10.836 6.53325 12.1357 6.53325C14.8365 6.53325 15.336 8.3108 15.336 10.6245L15.3352 15.339ZM4.00275 5.57475C3.14475 5.57475 2.4555 4.88025 2.4555 4.026C2.4555 3.1725 3.1455 2.47875 4.00275 2.47875C4.85775 2.47875 5.55075 3.1725 5.55075 4.026C5.55075 4.88025 4.857 5.57475 4.00275 5.57475ZM5.33925 15.339H2.66625V6.75H5.33925V15.339ZM16.6687 0H1.32825C0.594 0 0 0.5805 0 1.29675V16.7033C0 17.4202 0.594 18 1.32825 18H16.6665C17.4 18 18 17.4202 18 16.7033V1.29675C18 0.5805 17.4 0 16.6665 0H16.6687Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1.5 5.25A1.5 1.5 0 0 1 3 3.75h18a1.5 1.5 0 0 1 1.5 1.5v13.5A1.5 1.5 0 0 1 21 20.25H3A1.5 1.5 0 0 1 1.5 18.75V5.25zm2.2.5L12 12l8.3-6.25H3.7zM21 7.32l-8.4 6.3a1 1 0 0 1-1.2 0L3 7.32V18.75h18V7.32z" fill="currentColor" />
    </svg>
  );
}

export function BrandLogo({
  data,
  imgClassName,
  textClassName = "h6 fw-700 fz-24 mb-0",
}: {
  data: PortfolioData;
  imgClassName?: string;
  textClassName?: string;
}) {
  const brand = (data.identity.owner_name ?? "").split(" ").pop() || "";
  return (
    <Link href="/">
      <CmsImage data={data} slot="brand-logo" dataWidth="30" className={imgClassName} width={256} height={256} altFallback={brand} />
      <p className={textClassName}>{brand}</p>
    </Link>
  );
}
