/**
 * Append the processed service images to the images manifest using single standard base images.
 * NOTE: Multi-width variation references have been removed.
 * Run with: node scripts/wire-service-images.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const manifestPath = resolve("src/lib/images-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

// Service images manifest entries using single standard base images only
const serviceEntries = [
  {
    name: "1. Architectural Design.jfif",
    slug: "services-architectural-design",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-architectural-design.jpg",
    fallbackWebp: "/images/services/services-architectural-design.webp",
    variants: {},
  },
  {
    name: "2. Structural design.jfif",
    slug: "services-structural-design",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-structural-design.jpg",
    fallbackWebp: "/images/services/services-structural-design.webp",
    variants: {},
  },
  {
    name: "3. Construction services.jfif",
    slug: "services-construction-services",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-construction-services.jpg",
    fallbackWebp: "/images/services/services-construction-services.webp",
    variants: {},
  },
  {
    name: "4. project management.jfif",
    slug: "services-project-management",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-project-management.jpg",
    fallbackWebp: "/images/services/services-project-management.webp",
    variants: {},
  },
  {
    name: "5. Real estate.jfif",
    slug: "services-real-estate",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-real-estate.jpg",
    fallbackWebp: "/images/services/services-real-estate.webp",
    variants: {},
  },
  {
    name: "6. Material supplies.jfif",
    slug: "services-material-supplies",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-material-supplies.jpg",
    fallbackWebp: "/images/services/services-material-supplies.webp",
    variants: {},
  },
  {
    name: "7. Contracts & Consultancy.jfif",
    slug: "services-contracts-consultancy",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-contracts-consultancy.jpg",
    fallbackWebp: "/images/services/services-contracts-consultancy.webp",
    variants: {},
  },
  {
    name: "8. Topography & Soil Testing.jfif",
    slug: "services-topography-soil-testing",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-topography-soil-testing.jpg",
    fallbackWebp: "/images/services/services-topography-soil-testing.webp",
    variants: {},
  },
  {
    name: "9. Interior design.jfif",
    slug: "services-interior-design",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-interior-design.jpg",
    fallbackWebp: "/images/services/services-interior-design.webp",
    variants: {},
  },
];

manifest.services = serviceEntries;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("✅ Manifest updated with single base service images (no multi-width variations)");
