import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env['SUPABASE_URL'] || 'https://vbyqtnypfgwyutgydtnz.supabase.co';
const SUPABASE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] || process.env['SUPABASE_PUBLISHABLE_KEY'] || 'sb_publishable_0uPaHiXpII7frD564Z4-6A_8cuvSBrG';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function sync() {
  console.log('Connecting to Supabase at', SUPABASE_URL);

  const manifestPath = path.join(process.cwd(), 'src', 'lib', 'images-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('images-manifest.json not found! Run process-images.mjs first.');
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // 1. Ensure storage bucket
  const { data: bucket, error: bErr } = await sb.storage.createBucket('media', { public: true });
  if (bErr) {
    console.log('Bucket check / create note:', bErr.message);
  } else {
    console.log('Bucket media created or exists.');
  }

  // 2. Upload images and insert media rows
  for (const [folder, items] of Object.entries(manifest)) {
    for (const item of items) {
      const localJpg = path.join(process.cwd(), 'public', item.fallbackJpg);
      if (fs.existsSync(localJpg)) {
        const fileData = fs.readFileSync(localJpg);
        const storagePath = `${folder}/${item.slug}.jpg`;
        const { error: upErr } = await sb.storage.from('media').upload(storagePath, fileData, {
          upsert: true,
          contentType: 'image/jpeg'
        });
        if (upErr) {
          console.log(`[Storage Upload ${folder}/${item.slug}]:`, upErr.message);
        } else {
          console.log(`[Storage Upload ${folder}/${item.slug}]: SUCCESS`);
        }

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/media/${storagePath}`;
        const { error: insertErr } = await sb.from('media').insert([{
          name: item.name,
          folder: folder,
          path: storagePath,
          url: item.fallbackJpg, // local and web compatible
          mime_type: 'image/jpeg',
          size_bytes: fileData.length
        }]);
        if (insertErr) {
          console.log(`[Media Insert ${folder}/${item.slug}]:`, insertErr.message);
        } else {
          console.log(`[Media Insert ${folder}/${item.slug}]: SUCCESS`);
        }
      }
    }
  }

  // 3. Update sectors and services hero_image_url
  const sectorMap = {
    residential: '/images/residential/services-residential-construction.jpg',
    commercial: '/images/commercial/services-commercial-construction.jpg',
    renovation: '/images/renovation/services-renovation--fit-out.jpg',
    'real-estate': '/images/real-estate/real-estate-development-dusk-render.jpg',
    infrastructure: '/images/commercial/services-infrastructure.jpg',
  };

  for (const [slug, img] of Object.entries(sectorMap)) {
    const { error } = await sb.from('sectors').update({ hero_image_url: img }).eq('slug', slug);
    if (error) console.log(`[Sector Update ${slug}]:`, error.message);
    else console.log(`[Sector Update ${slug}]: SUCCESS`);
  }

  const serviceMap = {
    'construction-services': '/images/commercial/services-commercial-construction.jpg',
    'architectural-design': '/images/residential/services-residential-construction.jpg',
    'interior-design': '/images/residential/featured-project-interior.jpg',
    'real-estate': '/images/real-estate/real-estate-development-dusk-render.jpg',
  };

  for (const [slug, img] of Object.entries(serviceMap)) {
    const { error } = await sb.from('services').update({ hero_image_url: img }).eq('slug', slug);
    if (error) console.log(`[Service Update ${slug}]:`, error.message);
    else console.log(`[Service Update ${slug}]: SUCCESS`);
  }

  console.log('Supabase sync complete!');
}

sync().catch(console.error);
