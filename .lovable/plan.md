# AMARC Engineering & Construction — World-Class Website + Admin CMS

A pitch-grade marketing site for a Pakistani engineering & construction firm, fully content-managed from an interactive admin dashboard, with a cinematic construction-phases hero video and strong SEO.

## Design direction (I'll decide, you approve visually)

Since you'd rather I pick: the base is your own signage — deep navy with a teal/emerald accent — pushed to a far more premium register: near-black navy canvas, one restrained emerald accent, warm off-white text, sharp corners, oversized architectural typography, generous negative space, and slow cinematic motion (no bouncy, no purple gradients, no generic SaaS look).

Right after you approve this plan I'll generate **3 rendered homepage directions** on that locked palette + type system and you just click the one you like. Then I build it.

Typography: an architectural grotesk for headings (heavy, tight tracking, huge display sizes) paired with a highly legible body sans. Numbers and stats get tabular figures — engineering firms should feel precise.

Interaction language (consistent everywhere):
- Scroll-reveal with masked/clip-path wipes, not fade-ups
- Parallax layering on project imagery
- Magnetic/underline-wipe hover on links and cards
- Animated counters for stats, animated SVG line-draw for the process timeline
- Reduced-motion respected; all motion GPU-cheap so it stays smooth on mid-range Android

## Site structure

Based on how top global construction/engineering firms (Bechtel, Skanska, AECOM, Turner, Balfour Beatty, Habib Construction, Descon, Bahria-tier developers) structure their sites:

```text
/                    Hero video, credibility strip, services, featured projects,
                     process timeline, stats, testimonials, clients, CTA
/services            All 9 services grid
/services/$slug      Deep page per service (Architectural Design, Structural
                     Design, Construction Services, Project Management,
                     Real Estate, Material Supplies, Contracts & Consultancy,
                     Topography & Soil Testing, Interior Design)
/projects            Filterable portfolio (sector, city, status)
/projects/$slug      Case study: gallery, scope, client, timeline, value
/about               Story, leadership, certifications, safety/HSE, timeline
/careers             Openings + application form
/blog                Insights (SEO engine)
/blog/$slug          Article
/contact             Form, Google Maps embed, Facebook link, phone/WhatsApp
/admin/*             Dashboard (protected)
```

Global: sticky nav with mega-menu for services, WhatsApp float button, footer with map + socials.

## Homepage hero video

I'll AI-generate a decent, cinematic ~10s montage of construction phases (excavation → foundation → structure → finishing), muted autoplay loop, with a poster image so mobile never sees a blank frame. Data-saver/mobile falls back to the poster still. Replaceable from admin later.

## Admin dashboard (everything is editable)

Login-protected, role-based (Owner/Admin can do all; Editor can edit content only; invite by email).

Manageable modules — each with rich-text descriptions, image/video upload, ordering, draft/publish, and per-item SEO fields:
- Site settings: logo, phone, WhatsApp, email, address, map coords, social links, brand accent
- Homepage sections: hero headline/sub/CTA/video, credibility strip, stats, section copy — reorder and toggle sections on/off
- Services: full CRUD, icon, hero image, long description, FAQs
- Projects: CRUD, gallery uploads, sector/city/status, featured toggle
- Team, testimonials, clients/partners, certifications
- Blog: CRUD with rich text, cover image, tags
- Careers: job postings + inbox of applications
- Leads inbox: contact + quote submissions, status (new/contacted/won), CSV export
- SEO panel: per-page title/description/OG image, sitemap + robots, redirects
- Media library: reusable uploads
- Dashboard home: leads chart, recent activity, quick actions

Live preview of edits, autosave, and instant reflection on the public site.

## SEO

Per-route unique title/description/OG/Twitter tags, single H1 per page, semantic HTML, LocalBusiness + Organization + Service + Article JSON-LD, breadcrumbs, canonical tags, auto-generated sitemap.xml, robots.txt, image alt text everywhere, lazy loading, Pakistan-localized copy (city names, PKR, local sectors) for local search.

## Content

Seeded with realistic dummy content modeled on real construction-firm sites: 9 services with full copy, 8–10 projects across residential/commercial/industrial/infrastructure in Lahore/Karachi/Islamabad, team bios, testimonials, 4 blog posts, 3 job posts, stats. All replaceable from admin.

## Quality bar

- Max-pixel: responsive `srcset` imagery, AVIF/WebP, no blurry upscales
- Mobile-first — verified at 360px, 768px, 1280px, 1920px
- Accessible contrast, keyboard nav, focus rings
- Fast: lazy-loaded routes, deferred video, optimized fonts

## Technical notes

- TanStack Start + Tailwind, file-based routes as above; Motion for animation
- Lovable Cloud for database, auth, storage (media/video), and server functions
- Roles in a dedicated `user_roles` table with a security-definer check — never on profiles
- Public content readable by anyone via RLS; writes restricted to admin/editor roles
- Content stored as structured tables (services, projects, posts, team, testimonials, jobs, leads, site_settings, page_seo, media) so the site renders from the DB, not hardcoded
- Route loaders + TanStack Query for SSR-friendly data fetching so SEO crawlers see real content

## Build order

1. Design system + 3 rendered directions → you pick
2. Cloud setup: schema, RLS, roles, storage, seed content
3. Public site: home (incl. hero video), services, projects, about, contact
4. Admin dashboard: auth, all CRUD modules, media, leads, SEO panel
5. Blog, careers, polish, SEO pass, responsive + performance QA
