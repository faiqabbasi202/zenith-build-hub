/**
 * Process service images: rename, resize to 600w/900w/1600w, output JPG + WebP.
 * Run with: node scripts/process-service-images.mjs
 */
import sharp from "sharp";
import { mkdirSync, readdirSync, existsSync } from "fs";
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

const WIDTHS = [600, 900, 1600];
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

  const variants = { webp: {}, jpg: {} };
  const srcSetsWebp = [];
  const srcSetsJpg = [];

  for (const w of WIDTHS) {
    const resized = sharp(inputPath).resize({ width: w, withoutEnlargement: true });

    const webpName = `${slug}-${w}w.webp`;
    const jpgName = `${slug}-${w}w.jpg`;

    await resized.clone().webp({ quality: WEBP_QUALITY }).toFile(join(OUT_DIR, webpName));
    await resized.clone().jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toFile(join(OUT_DIR, jpgName));

    variants.webp[String(w)] = `/images/services/${webpName}`;
    variants.jpg[String(w)] = `/images/services/${jpgName}`;
    srcSetsWebp.push(`/images/services/${webpName} ${w}w`);
    srcSetsJpg.push(`/images/services/${jpgName} ${w}w`);
  }

  // Full-size fallbacks
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
    srcSetWebp: srcSetsWebp.join(", "),
    srcSetJpg: srcSetsJpg.join(", "),
    variants,
  };
}

async function main() {
  console.log("🖼  Processing service images...\n");

  const results = [];
  for (const [file, slug] of Object.entries(FILE_MAP)) {
    console.log(`Processing: ${file}`);
    const entry = await processImage(file, slug);
    if (entry) results.push(entry);
  }

  // Output manifest fragment
  console.log("\n✅ Done! Manifest entries:\n");
  console.log(JSON.stringify({ services: results }, null, 2));
}

main().catch(console.error);
