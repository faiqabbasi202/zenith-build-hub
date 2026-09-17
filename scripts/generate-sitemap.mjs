import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const SITE_URL = "https://zenith-build-hub.com";
const TODAY = new Date().toISOString().split("T")[0];

const STATIC_ROUTES = [
  { path: "", priority: "1.0", changefreq: "daily" },
  { path: "about", priority: "0.8", changefreq: "monthly" },
  { path: "services", priority: "0.9", changefreq: "weekly" },
  { path: "projects", priority: "0.9", changefreq: "weekly" },
  { path: "real-estate", priority: "0.8", changefreq: "weekly" },
  { path: "careers", priority: "0.7", changefreq: "weekly" },
  { path: "insights", priority: "0.8", changefreq: "weekly" },
  { path: "contact", priority: "0.8", changefreq: "monthly" },
  { path: "faq", priority: "0.6", changefreq: "monthly" },
  { path: "downloads", priority: "0.6", changefreq: "monthly" },
  { path: "tenders", priority: "0.7", changefreq: "weekly" },
];

const SERVICES_SLUGS = [
  "architecture-design",
  "structural-engineering",
  "commercial-construction",
  "residential-construction",
  "renovation--fit-out",
  "infrastructure",
  "project-management",
  "mep-engineering",
  "interior-design",
];

const DUMMY_PROJECT_SLUGS = [
  "al-noor-residence-gulberg",
  "serene-villas-dha-phase-6",
  "the-veranda-modern-bungalow",
  "apex-business-center-islamabad",
  "sapphire-corporate-tower-lahore",
  "clifton-trade-center-karachi",
  "heritage-bungalow-remodelling",
  "punjab-club-corporate-suites-refit",
  "gulberg-luxury-penthouse-renovation",
  "atrium-residences-dha-phase-5",
  "panoramic-heights-gulberg-3",
  "canal-view-corporate-park",
  "site-engineer-recruitment-2024",
  "lead-architect-studio-expansion",
  "amarc-headquarters-expansion-lahore",
];

const INSIGHTS_SLUGS = [
  "sustainable-concrete-mixes-pakistan",
  "commercial-building-codes-lahore-2024",
  "cost-optimization-in-high-rise-construction",
];

const DEVELOPMENTS_SLUGS = [
  "atrium-residences",
  "panoramic-heights",
  "canal-view-park",
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

for (const r of STATIC_ROUTES) {
  const loc = r.path ? `${SITE_URL}/${r.path}` : `${SITE_URL}/`;
  xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>
`;
}

for (const slug of SERVICES_SLUGS) {
  xml += `  <url>
    <loc>${SITE_URL}/services/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
}

for (const slug of DUMMY_PROJECT_SLUGS) {
  xml += `  <url>
    <loc>${SITE_URL}/projects/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
}

for (const slug of DEVELOPMENTS_SLUGS) {
  xml += `  <url>
    <loc>${SITE_URL}/real-estate/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
}

for (const slug of INSIGHTS_SLUGS) {
  xml += `  <url>
    <loc>${SITE_URL}/insights/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
}

xml += `</urlset>\n`;

const targetPath = path.join(rootDir, "public", "sitemap.xml");
fs.writeFileSync(targetPath, xml, "utf8");
console.log(`Generated ${targetPath} with ${STATIC_ROUTES.length + SERVICES_SLUGS.length + DUMMY_PROJECT_SLUGS.length + DEVELOPMENTS_SLUGS.length + INSIGHTS_SLUGS.length} URLs`);
