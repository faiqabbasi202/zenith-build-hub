export interface PageSeoRecord {
  id?: string | undefined;
  path?: string | undefined;
  title?: string | null | undefined;
  description?: string | null | undefined;
  og_image_url?: string | null | undefined;
  noindex?: boolean | undefined;
  [key: string]: any;
}

export const SITE_ORIGIN = "https://zenith-build-hub.com";
export const SITE_NAME = "AMARC Engineering & Construction";
export const DEFAULT_OG_IMAGE = "/images/hero/homepage-hero-desktop.jpg";

export const DEFAULT_PAGE_SEO: Record<string, { title: string; description: string; og_image_url: string }> = {
  "/": {
    title: "AMARC Engineering & Construction | Builders in Lahore, Karachi & Islamabad",
    description:
      "Turnkey construction, architectural and structural design across Pakistan since 2004. PEC-licensed, ISO 9001 and 45001 certified. 184 projects delivered.",
    og_image_url: "/images/hero/homepage-hero-desktop.jpg",
  },
  "/about": {
    title: "About AMARC Engineering & Construction Company",
    description:
      "Founded in Lahore in 2004. PEC-licensed constructor with in-house architecture, structural engineering and self-performed construction teams.",
    og_image_url: "/images/about/about-hero.jpg",
  },
  "/services": {
    title: "Construction & Engineering Services in Pakistan | AMARC",
    description:
      "Nine in-house disciplines — architecture, structural design, construction, project management, real estate, materials, contracts, soil testing and interiors.",
    og_image_url: "/images/commercial/services-commercial-construction.jpg",
  },
  "/projects": {
    title: "Our Projects — Completed & Ongoing | AMARC Construction",
    description:
      "Browse 184 completed and 23 ongoing construction projects across Lahore, Karachi, Islamabad, Faisalabad and Multan, filterable by sector, city and status.",
    og_image_url: "/images/residential/featured-project-interior.jpg",
  },
  "/real-estate": {
    title: "Real Estate Developments & Investments | AMARC",
    description:
      "Prime residential towers, commercial plazas, and mixed-use communities developed by AMARC across Pakistan.",
    og_image_url: "/images/real-estate/real-estate-development-dusk-render.jpg",
  },
  "/careers": {
    title: "Careers & Culture at AMARC | Build Pakistan's Skyline",
    description:
      "Join Pakistan's leading engineering and construction firm. Explore open roles across civil, mechanical, electrical, and project management.",
    og_image_url: "/images/careers/careers---culture.jpg",
  },
  "/insights": {
    title: "Engineering & Construction Insights | AMARC Journal",
    description:
      "Technical articles, market analysis, building codes, and construction technologies from AMARC's chartered engineers.",
    og_image_url: "/images/commercial/services-infrastructure.jpg",
  },
  "/contact": {
    title: "Contact AMARC | Offices in Lahore, Karachi & Islamabad",
    description:
      "Request a quote or visit one of our three regional offices. Written response to every enquiry within two working days.",
    og_image_url: "/images/hero/homepage-hero-desktop.jpg",
  },
  "/faq": {
    title: "Frequently Asked Questions | AMARC Construction",
    description:
      "Answers regarding our procurement models, PEC licensing, project timelines, warranties, and turnkey delivery process.",
    og_image_url: "/images/hero/homepage-hero-desktop.jpg",
  },
  "/downloads": {
    title: "Downloads & Technical Documentation | AMARC",
    description:
      "Download company profiles, PEC certificates, standard contracts, material specifications, and brochures.",
    og_image_url: "/images/hero/homepage-hero-desktop.jpg",
  },
  "/tenders": {
    title: "Procurement Tenders & Subcontracting | AMARC",
    description:
      "Current tenders, expressions of interest, and pre-qualification notices for suppliers, vendors, and subcontractors.",
    og_image_url: "/images/commercial/services-infrastructure.jpg",
  },
};

export interface BuildSeoMetaOptions {
  path: string;
  seo?: Record<string, any> | null | undefined;
  fallbackTitle?: string | undefined;
  fallbackDescription?: string | undefined;
  fallbackOgImage?: string | undefined;
  noindex?: boolean | undefined;
}

export function buildSeoMeta({
  path,
  seo,
  fallbackTitle,
  fallbackDescription,
  fallbackOgImage,
  noindex,
}: BuildSeoMetaOptions) {
  const defaultMeta = DEFAULT_PAGE_SEO[path] ?? {
    title: `${SITE_NAME} | Engineering & Construction`,
    description: "Turnkey construction and engineering solutions across Pakistan.",
    og_image_url: DEFAULT_OG_IMAGE,
  };

  const title = seo?.["title"] || fallbackTitle || defaultMeta.title;
  const description = seo?.["description"] || fallbackDescription || defaultMeta.description;
  const ogImage = seo?.["og_image_url"] || fallbackOgImage || defaultMeta.og_image_url || DEFAULT_OG_IMAGE;
  const canonicalUrl = `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
  const isNoindex = Boolean(seo?.["noindex"] ?? noindex);

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    { property: "og:url", content: canonicalUrl },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    { name: "robots", content: isNoindex ? "noindex, nofollow" : "index, follow" },
  ];
}
