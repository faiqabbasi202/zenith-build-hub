import { useMemo } from "react";
import imagesManifest from "@/lib/images-manifest.json";
import { cn } from "@/lib/utils";

type ManifestEntry = {
  name: string;
  slug: string;
  folder: string;
  width: number;
  height: number;
  aspectRatio: string;
  fallbackJpg: string;
  fallbackWebp: string;
  srcSetWebp: string;
  srcSetJpg: string;
  variants: {
    webp: Record<string, string>;
    jpg: Record<string, string>;
  };
};

const allManifestEntries: ManifestEntry[] = Object.values(imagesManifest).flat() as ManifestEntry[];

/** Find manifest entry by url or slug */
export function findImageMeta(urlOrSlug?: string | null): ManifestEntry | undefined {
  if (!urlOrSlug) return undefined;
  const clean = urlOrSlug.replace(/\\/g, "/").toLowerCase();
  return allManifestEntries.find(
    (e) =>
      clean.includes(e.slug) ||
      clean.includes(e.fallbackJpg.toLowerCase()) ||
      clean.includes(e.fallbackWebp.toLowerCase()) ||
      clean.endsWith(`/${e.slug}.jpg`) ||
      clean.endsWith(`/${e.slug}.webp`),
  );
}

export interface ResponsiveImageProps {
  src?: string | null;
  alt: string;
  aspectRatio?: "16/9" | "4/3" | "16/10" | "1/1" | "auto" | string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  eager?: boolean;
  /** If provided, renders dual mobile/desktop responsive sources via (max-width: 768px) media query */
  desktopSrc?: string | null;
  mobileSrc?: string | null;
}

export function ResponsiveImage({
  src,
  alt,
  aspectRatio = "auto",
  className,
  imgClassName,
  sizes = "(min-width: 1280px) 1200px, (min-width: 768px) 800px, 100vw",
  eager = false,
  desktopSrc,
  mobileSrc,
}: ResponsiveImageProps) {
  const isDualHero = Boolean(desktopSrc && mobileSrc);

  const desktopMeta = useMemo(() => findImageMeta(desktopSrc || src), [desktopSrc, src]);
  const mobileMeta = useMemo(() => findImageMeta(mobileSrc), [mobileSrc]);
  const singleMeta = useMemo(() => (isDualHero ? null : findImageMeta(src)), [isDualHero, src]);

  const aspectClass =
    aspectRatio === "16/9"
      ? "aspect-16/9"
      : aspectRatio === "4/3"
        ? "aspect-4/3"
        : aspectRatio === "16/10"
          ? "aspect-[16/10]"
          : aspectRatio === "1/1"
            ? "aspect-square"
            : "";

  const aspectStyle =
    aspectRatio !== "auto" && !aspectClass
      ? { aspectRatio }
      : singleMeta
        ? { aspectRatio: singleMeta.aspectRatio }
        : undefined;

  if (isDualHero && desktopMeta && mobileMeta) {
    return (
      <picture className={cn("block w-full overflow-hidden", aspectClass, className)} style={aspectStyle}>
        {/* Mobile screen (<= 768px) - WebP */}
        <source
          media="(max-width: 768px)"
          type="image/webp"
          srcSet={mobileMeta.srcSetWebp || mobileMeta.fallbackWebp}
          sizes="100vw"
        />
        {/* Mobile screen (<= 768px) - JPEG Fallback */}
        <source
          media="(max-width: 768px)"
          type="image/jpeg"
          srcSet={mobileMeta.srcSetJpg || mobileMeta.fallbackJpg}
          sizes="100vw"
        />
        {/* Desktop screen (> 768px) - WebP */}
        <source
          media="(min-width: 769px)"
          type="image/webp"
          srcSet={desktopMeta.srcSetWebp || desktopMeta.fallbackWebp}
          sizes="100vw"
        />
        {/* Desktop screen (> 768px) - JPEG Fallback */}
        <source
          media="(min-width: 769px)"
          type="image/jpeg"
          srcSet={desktopMeta.srcSetJpg || desktopMeta.fallbackJpg}
          sizes="100vw"
        />
        <img
          src={desktopMeta.fallbackJpg}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          className={cn("h-full w-full object-cover", imgClassName)}
          style={{ objectFit: "cover" }}
        />
      </picture>
    );
  }

  if (singleMeta) {
    return (
      <picture className={cn("block w-full overflow-hidden", aspectClass, className)} style={aspectStyle}>
        <source type="image/webp" srcSet={singleMeta.srcSetWebp} sizes={sizes} />
        <source type="image/jpeg" srcSet={singleMeta.srcSetJpg} sizes={sizes} />
        <img
          src={singleMeta.fallbackJpg}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          className={cn("h-full w-full object-cover", imgClassName)}
          style={{ objectFit: "cover" }}
        />
      </picture>
    );
  }

  // Fallback for external or custom URLs
  const rawSrc = src || "/images/hero/homepage-hero-desktop.jpg";
  return (
    <div className={cn("relative block w-full overflow-hidden", aspectClass, className)} style={aspectStyle}>
      <img
        src={rawSrc}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        className={cn("h-full w-full object-cover", imgClassName)}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
