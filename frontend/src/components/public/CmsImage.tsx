import type { ImgHTMLAttributes } from "react";
import { optimizeCloudinaryUrl, type PortfolioData } from "@/lib/portfolio-data";

type CmsImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  data: PortfolioData;
  slot: string;
  altFallback?: string;
  dataWidth?: string | number;
  dataSpeed?: string | number;
};

export default function CmsImage({
  data,
  slot,
  altFallback = "",
  dataWidth,
  dataSpeed,
  ...rest
}: CmsImageProps) {
  const rawUrl = data.images[slot]?.trim() ?? "";
  if (!rawUrl) return null;

  const src = optimizeCloudinaryUrl(rawUrl);
  const alt = data.imageAlts[slot]?.trim() || altFallback;
  const mobileUrl = data.mobileImages[slot]?.trim() ?? "";

  const extraAttrs: Record<string, string | number | undefined> = {};
  if (dataWidth !== undefined) extraAttrs["data-width"] = dataWidth;
  if (dataSpeed !== undefined) extraAttrs["data-speed"] = dataSpeed;

  const img = <img src={src} alt={alt} {...extraAttrs} {...rest} />;

  if (mobileUrl) {
    return (
      <picture>
        <source media="(max-width: 767px)" srcSet={mobileUrl} />
        {img}
      </picture>
    );
  }

  return img;
}
