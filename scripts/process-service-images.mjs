/**
 * Process service images: converts source images to single, standard base JPG + WebP.
 * NOTE: Multi-width variation generation (-600w, -900w, -1600w) has been disabled.
 * Run with: node scripts/process-service-images.mjs
 */
import sharp from "sharp";
import { existsSync } from "fs";
import { join, resolve } from "path";

const SRC_DIR = resolve("public/images/services");
const OUT_DIR = resolve("public/images/services");

// Map original filenames → clean slugs (matching the service slugs in DB)
const FILE_MAP = {
  "1. Architectural Design.jfif":       "services-architectural-design",
  "2. Structural design.jfif":          "services-structural-design",
  "3. Construction services.jfif":      "services-construction-services",
  "4. project management.jfif":         "services-project-management",
  "5. Real estate.jfif":                "services-real-estate",
  "6. Material supplies.jfif":          "services-material-supplies",
  "7. Contracts & Consultancy.jfif":    "services-contracts-consultancy",
  "8. Topography & Soil Testing.jfif":  "services-topography-soil-testing",
  "9. Interior design.jfif":            "services-interior-design",
};

const JPG_QUALITY = 82;
const WEBP_QUALITY = 80;

async function processImage(srcFile, slug) {
  const inputPath = join(SRC_DIR, srcFile);
  if (!existsSync(inputPath)) {
    console.warn(`  ⚠ Not found: ${srcFile}`);
    return null;
  }

  const img = sharp(inputPath);
  const meta = await img.metadata();
  console.log(`  📐 ${slug}: ${meta.width}x${meta.height}`);

  // Generate only the single standard base images (no responsive width variations)
  const fallbackJpg = `${slug}.jpg`;
  const fallbackWebp = `${slug}.webp`;
  await sharp(inputPath).jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toFile(join(OUT_DIR, fallbackJpg));
  await sharp(inputPath).webp({ quality: WEBP_QUALITY }).toFile(join(OUT_DIR, fallbackWebp));

  return {
    name: srcFile,
    slug,
    folder: "services",
    width: meta.width,
    height: meta.height,
    aspectRatio: `${meta.width}/${meta.height}`,
    fallbackJpg: `/images/services/${fallbackJpg}`,
    fallbackWebp: `/images/services/${fallbackWebp}`,
    variants: {},
  };
}

async function main() {
  console.log("🖼  Processing service images (single base images only)...\n");

  const results = [];
  for (const [file, slug] of Object.entries(FILE_MAP)) {
    console.log(`Processing: ${file}`);
    const entry = await processImage(file, slug);
    if (entry) results.push(entry);
  }

  console.log("\n✅ Done! Processed single base images for all services.");
}

main().catch(console.error);
