/**
 * Append the processed service images to the images manifest and update the image-wiring map.
 * Run with: node scripts/wire-service-images.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const manifestPath = resolve("src/lib/images-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

// Service images manifest entries (from process-service-images output)
const serviceEntries = [
  {
    name: "1. Architectural Design.jfif",
    slug: "services-architectural-design",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-architectural-design.jpg",
    fallbackWebp: "/images/services/services-architectural-design.webp",
    srcSetWebp: "/images/services/services-architectural-design-600w.webp 600w, /images/services/services-architectural-design-900w.webp 900w, /images/services/services-architectural-design-1600w.webp 1600w",
    srcSetJpg: "/images/services/services-architectural-design-600w.jpg 600w, /images/services/services-architectural-design-900w.jpg 900w, /images/services/services-architectural-design-1600w.jpg 1600w",
    variants: {
      webp: { "600": "/images/services/services-architectural-design-600w.webp", "900": "/images/services/services-architectural-design-900w.webp", "1600": "/images/services/services-architectural-design-1600w.webp" },
      jpg:  { "600": "/images/services/services-architectural-design-600w.jpg",  "900": "/images/services/services-architectural-design-900w.jpg",  "1600": "/images/services/services-architectural-design-1600w.jpg" },
    },
  },
  {
    name: "2. Structural design.jfif",
    slug: "services-structural-design",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-structural-design.jpg",
    fallbackWebp: "/images/services/services-structural-design.webp",
    srcSetWebp: "/images/services/services-structural-design-600w.webp 600w, /images/services/services-structural-design-900w.webp 900w, /images/services/services-structural-design-1600w.webp 1600w",
    srcSetJpg: "/images/services/services-structural-design-600w.jpg 600w, /images/services/services-structural-design-900w.jpg 900w, /images/services/services-structural-design-1600w.jpg 1600w",
    variants: {
      webp: { "600": "/images/services/services-structural-design-600w.webp", "900": "/images/services/services-structural-design-900w.webp", "1600": "/images/services/services-structural-design-1600w.webp" },
      jpg:  { "600": "/images/services/services-structural-design-600w.jpg",  "900": "/images/services/services-structural-design-900w.jpg",  "1600": "/images/services/services-structural-design-1600w.jpg" },
    },
  },
  {
    name: "3. Construction services.jfif",
    slug: "services-construction-services",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-construction-services.jpg",
    fallbackWebp: "/images/services/services-construction-services.webp",
    srcSetWebp: "/images/services/services-construction-services-600w.webp 600w, /images/services/services-construction-services-900w.webp 900w, /images/services/services-construction-services-1600w.webp 1600w",
    srcSetJpg: "/images/services/services-construction-services-600w.jpg 600w, /images/services/services-construction-services-900w.jpg 900w, /images/services/services-construction-services-1600w.jpg 1600w",
    variants: {
      webp: { "600": "/images/services/services-construction-services-600w.webp", "900": "/images/services/services-construction-services-900w.webp", "1600": "/images/services/services-construction-services-1600w.webp" },
      jpg:  { "600": "/images/services/services-construction-services-600w.jpg",  "900": "/images/services/services-construction-services-900w.jpg",  "1600": "/images/services/services-construction-services-1600w.jpg" },
    },
  },
  {
    name: "4. project management.jfif",
    slug: "services-project-management",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-project-management.jpg",
    fallbackWebp: "/images/services/services-project-management.webp",
    srcSetWebp: "/images/services/services-project-management-600w.webp 600w, /images/services/services-project-management-900w.webp 900w, /images/services/services-project-management-1600w.webp 1600w",
    srcSetJpg: "/images/services/services-project-management-600w.jpg 600w, /images/services/services-project-management-900w.jpg 900w, /images/services/services-project-management-1600w.jpg 1600w",
    variants: {
      webp: { "600": "/images/services/services-project-management-600w.webp", "900": "/images/services/services-project-management-900w.webp", "1600": "/images/services/services-project-management-1600w.webp" },
      jpg:  { "600": "/images/services/services-project-management-600w.jpg",  "900": "/images/services/services-project-management-900w.jpg",  "1600": "/images/services/services-project-management-1600w.jpg" },
    },
  },
  {
    name: "5. Real estate.jfif",
    slug: "services-real-estate",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-real-estate.jpg",
    fallbackWebp: "/images/services/services-real-estate.webp",
    srcSetWebp: "/images/services/services-real-estate-600w.webp 600w, /images/services/services-real-estate-900w.webp 900w, /images/services/services-real-estate-1600w.webp 1600w",
    srcSetJpg: "/images/services/services-real-estate-600w.jpg 600w, /images/services/services-real-estate-900w.jpg 900w, /images/services/services-real-estate-1600w.jpg 1600w",
    variants: {
      webp: { "600": "/images/services/services-real-estate-600w.webp", "900": "/images/services/services-real-estate-900w.webp", "1600": "/images/services/services-real-estate-1600w.webp" },
      jpg:  { "600": "/images/services/services-real-estate-600w.jpg",  "900": "/images/services/services-real-estate-900w.jpg",  "1600": "/images/services/services-real-estate-1600w.jpg" },
    },
  },
  {
    name: "6. Material supplies.jfif",
    slug: "services-material-supplies",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-material-supplies.jpg",
    fallbackWebp: "/images/services/services-material-supplies.webp",
    srcSetWebp: "/images/services/services-material-supplies-600w.webp 600w, /images/services/services-material-supplies-900w.webp 900w, /images/services/services-material-supplies-1600w.webp 1600w",
    srcSetJpg: "/images/services/services-material-supplies-600w.jpg 600w, /images/services/services-material-supplies-900w.jpg 900w, /images/services/services-material-supplies-1600w.jpg 1600w",
    variants: {
      webp: { "600": "/images/services/services-material-supplies-600w.webp", "900": "/images/services/services-material-supplies-900w.webp", "1600": "/images/services/services-material-supplies-1600w.webp" },
      jpg:  { "600": "/images/services/services-material-supplies-600w.jpg",  "900": "/images/services/services-material-supplies-900w.jpg",  "1600": "/images/services/services-material-supplies-1600w.jpg" },
    },
  },
  {
    name: "7. Contracts & Consultancy.jfif",
    slug: "services-contracts-consultancy",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-contracts-consultancy.jpg",
    fallbackWebp: "/images/services/services-contracts-consultancy.webp",
    srcSetWebp: "/images/services/services-contracts-consultancy-600w.webp 600w, /images/services/services-contracts-consultancy-900w.webp 900w, /images/services/services-contracts-consultancy-1600w.webp 1600w",
    srcSetJpg: "/images/services/services-contracts-consultancy-600w.jpg 600w, /images/services/services-contracts-consultancy-900w.jpg 900w, /images/services/services-contracts-consultancy-1600w.jpg 1600w",
    variants: {
      webp: { "600": "/images/services/services-contracts-consultancy-600w.webp", "900": "/images/services/services-contracts-consultancy-900w.webp", "1600": "/images/services/services-contracts-consultancy-1600w.webp" },
      jpg:  { "600": "/images/services/services-contracts-consultancy-600w.jpg",  "900": "/images/services/services-contracts-consultancy-900w.jpg",  "1600": "/images/services/services-contracts-consultancy-1600w.jpg" },
    },
  },
  {
    name: "8. Topography & Soil Testing.jfif",
    slug: "services-topography-soil-testing",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-topography-soil-testing.jpg",
    fallbackWebp: "/images/services/services-topography-soil-testing.webp",
    srcSetWebp: "/images/services/services-topography-soil-testing-600w.webp 600w, /images/services/services-topography-soil-testing-900w.webp 900w, /images/services/services-topography-soil-testing-1600w.webp 1600w",
    srcSetJpg: "/images/services/services-topography-soil-testing-600w.jpg 600w, /images/services/services-topography-soil-testing-900w.jpg 900w, /images/services/services-topography-soil-testing-1600w.jpg 1600w",
    variants: {
      webp: { "600": "/images/services/services-topography-soil-testing-600w.webp", "900": "/images/services/services-topography-soil-testing-900w.webp", "1600": "/images/services/services-topography-soil-testing-1600w.webp" },
      jpg:  { "600": "/images/services/services-topography-soil-testing-600w.jpg",  "900": "/images/services/services-topography-soil-testing-900w.jpg",  "1600": "/images/services/services-topography-soil-testing-1600w.jpg" },
    },
  },
  {
    name: "9. Interior design.jfif",
    slug: "services-interior-design",
    folder: "services",
    width: 2752, height: 1536,
    aspectRatio: "2752/1536",
    fallbackJpg: "/images/services/services-interior-design.jpg",
    fallbackWebp: "/images/services/services-interior-design.webp",
    srcSetWebp: "/images/services/services-interior-design-600w.webp 600w, /images/services/services-interior-design-900w.webp 900w, /images/services/services-interior-design-1600w.webp 1600w",
    srcSetJpg: "/images/services/services-interior-design-600w.jpg 600w, /images/services/services-interior-design-900w.jpg 900w, /images/services/services-interior-design-1600w.jpg 1600w",
    variants: {
      webp: { "600": "/images/services/services-interior-design-600w.webp", "900": "/images/services/services-interior-design-900w.webp", "1600": "/images/services/services-interior-design-1600w.webp" },
      jpg:  { "600": "/images/services/services-interior-design-600w.jpg",  "900": "/images/services/services-interior-design-900w.jpg",  "1600": "/images/services/services-interior-design-1600w.jpg" },
    },
  },
];

manifest.services = serviceEntries;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("✅ Manifest updated with 9 service image entries");
