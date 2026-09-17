import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const amarcDir = 'D:\\amarc';
const outBase = path.join(process.cwd(), 'public', 'images');
const categories = ['residential', 'commercial', 'renovation', 'real-estate', 'careers', 'about', 'hero'];
const widths = [1600, 900, 600];

function sanitize(name) {
  return name
    .replace(/\.jfif$/i, '')
    .replace(/^[\d\.\s—-]+/, '')
    .replace(/[\s—_]+/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
    .toLowerCase();
}

async function run() {
  const manifest = {};

  for (const cat of categories) {
    const catDir = path.join(amarcDir, cat);
    if (!fs.existsSync(catDir)) continue;
    const outCatDir = path.join(outBase, cat);
    fs.mkdirSync(outCatDir, { recursive: true });

    manifest[cat] = [];
    const files = fs.readdirSync(catDir).filter(f => fs.statSync(path.join(catDir, f)).isFile());

    for (const file of files) {
      const srcPath = path.join(catDir, file);
      const slug = sanitize(file);
      const meta = await sharp(srcPath).metadata();
      const aspectRatio = (meta.width / meta.height).toFixed(3);

      const entry = {
        name: file,
        slug,
        folder: cat,
        width: meta.width,
        height: meta.height,
        aspectRatio,
        fallbackJpg: `/images/${cat}/${slug}.jpg`,
        fallbackWebp: `/images/${cat}/${slug}.webp`,
        variants: {
          webp: {},
          jpg: {}
        }
      };

      // Full size fallback
      await sharp(srcPath).jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(outCatDir, `${slug}.jpg`));
      await sharp(srcPath).webp({ quality: 85 }).toFile(path.join(outCatDir, `${slug}.webp`));

      for (const w of widths) {
        if (w <= meta.width) {
          const webpName = `${slug}-${w}w.webp`;
          const jpgName = `${slug}-${w}w.jpg`;
          await sharp(srcPath).resize(w).webp({ quality: 85 }).toFile(path.join(outCatDir, webpName));
          await sharp(srcPath).resize(w).jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(outCatDir, jpgName));
          entry.variants.webp[w] = `/images/${cat}/${webpName}`;
          entry.variants.jpg[w] = `/images/${cat}/${jpgName}`;
        }
      }

      entry.srcSetWebp = Object.entries(entry.variants.webp).map(([w, url]) => `${url} ${w}w`).join(', ');
      entry.srcSetJpg = Object.entries(entry.variants.jpg).map(([w, url]) => `${url} ${w}w`).join(', ');

      manifest[cat].push(entry);
      console.log(`Generated responsive variants for [${cat}] ${slug}`);
    }
  }

  const manifestPath = path.join(process.cwd(), 'src', 'lib', 'images-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Manifest written to', manifestPath);
}

run().catch(console.error);
