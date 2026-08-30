# AMARC Engineering & Construction — World-Class Website + Admin CMS

Researched against 15 construction/engineering sites: Bechtel, Skanska, AECOM, Turner, Balfour Beatty, Laing O'Rourke, Fluor, Vinci, Lendlease, Multiplex — and Pakistani: NESPAK, Habib Construction Services (HCS), Descon, Izhar Group, Bahria Town, Emaar Pakistan, Zameen Developments, Al-Ghurair Giga.

## What the research changed

Key patterns worth stealing, that were missing from my first draft:

- **Sector taxonomy beats generic "projects".** Global firms organise by sector (Residential, Commercial, Industrial, Infrastructure, Healthcare, Education, Energy, Hospitality) — not by a flat portfolio list.
- **Status is a first-class axis in Pakistan.** HCS splits the whole site into "Completed Projects" vs "Projects In Progress". NESPAK runs live counters: 468 Ongoing / 4,419 Completed / 4,887 Total. We do both: filter by Sector × City × Status (Newly Launched / Ongoing / Completed / Handed Over).
- **HCS publishes a project table with Client, Value in PKR Millions, Start Date, Completion Date.** That table view is a serious credibility move and no global site does it. We ship both a visual grid view and a professional list/table view toggle.
- **Local credibility markers are different.** PEC registration number, ISO certificates, tax-payer awards (HCS has a whole page for it), government/army affiliation, years-since-founding timelines (Izhar narrates milestones from 1959). Global sites use ESG/ethics instead. We use the Pakistani set, presented with global-grade design.
- **Tenders / vendor & supplier registration** is a standard page for Pakistani contractors — missing from my first plan.
- **NESPAK's scope-of-work notation** (Feasibility / Planning / Design / Tender / Construction Supervision) makes a great per-project scope chip set.
- **Real-estate arm needs its own vocabulary**: Marla/Kanal/Sq.Yd, payment & installment plans, "Register Your Interest" CTA, unit mix (studios/1–4BR), storeys (G+18), amenities icon grid.
- **Downloadable company profile PDF** — NESPAK, HCS both do it. Buyers and tender committees expect it.

## Sitemap

```text
/                              Home
/about                         Story, mission, why AMARC
/about/timeline                Milestones since founding
/about/leadership              Directors, engineers, org strength
/about/certifications          PEC registration, ISO, memberships, licenses
/about/awards                  Awards & recognition
/services                      All 9 services
/services/$slug                Per-service deep page
/sectors/$slug                 Residential, Commercial, Industrial,
                               Infrastructure, Healthcare, Education,
                               Hospitality, Institutional
/projects                      Grid + table toggle; filter Sector × City × Status
/projects/$slug                Project detail
/real-estate                   Developments arm (listings)
/real-estate/$slug             Development: units, amenities, payment plan
/hse                           Health, Safety, Environment & Quality
/insights                      News & articles (SEO engine)
/insights/$slug                Article
/careers                       Culture + openings
/careers/$slug                 Job + application form
/tenders                       Vendor & supplier registration, open tenders
/downloads                     Company profile PDF, brochures
/faq                           Booking, process, warranties
/contact                       Form, Google Map, Facebook, WhatsApp, offices
/admin/*                       Dashboard (protected)
```

Your 9 services stay exactly as on your signage: Architectural Design, Structural Design, Construction Services, Project Management, Real Estate, Material Supplies, Contracts & Consultancy, Topography & Soil Testing, Interior Design.

## Homepage section order

1. Cinematic hero video (construction phases) + headline + dual CTA
2. Credibility strip: years in business · PEC reg. no. · projects delivered · sq.ft built
3. Animated stats counters (Ongoing / Completed / Total — NESPAK-style)
4. Services grid (9 cards, icon + hover reveal)
5. Sectors we build in
6. Featured projects carousel with status badges
7. How we work — animated 6-step process timeline (Feasibility → Design → Approvals → Construction → QA/HSE → Handover)
8. Newly launched / ongoing developments
9. Major clients & partners logo marquee
10. Certifications & licenses row
11. Testimonials
12. Latest insights
13. Contact CTA band + map + WhatsApp

## Project detail page template

Hero gallery with status badge · Key facts strip (Client · City · Value PKR · Covered Area sq.ft / Kanal · Storeys · Start–Completion · Status) · Scope-of-work chips · Overview · Architect/consultant/JV partners · Certifications · Photo gallery + optional walkthrough video · Progress timeline for ongoing jobs · Related projects · Enquire / Download brochure CTA.

Real-estate developments additionally get: unit mix, amenities icon grid, floor plans, payment & installment plan table, location advantages, Register Interest form.

## Design direction

Base is your own signage — deep navy with teal/emerald — pushed to a premium register: near-black navy canvas, one restrained emerald accent, warm off-white type, sharp corners, oversized architectural headings, heavy negative space, slow cinematic motion. No purple gradients, no generic SaaS look.

After approval I'll generate **3 rendered homepage directions** on that locked palette and type system; you click one and I build it.

Typography: architectural grotesk headings (tight tracking, huge display sizes) + highly legible body sans, tabular figures on all stats.

Interaction language, applied consistently: clip-path/mask scroll reveals (not fade-ups), parallax on project imagery, magnetic + underline-wipe hovers, animated counters, SVG line-draw on the process timeline, sticky filter rails, grid↔table view morph. Reduced-motion respected; all motion GPU-cheap so mid-range Android stays at 60fps.

## Hero video

AI-generated cinematic ~10s montage — excavation → foundation → structural frame → finishing — muted autoplay loop, poster image so mobile never shows a blank frame, poster-only fallback on data-saver. Replaceable from admin.

## Admin dashboard

Role-based login (Owner / Admin / Editor, invite by email). Every module has rich text, image/video upload, drag-reorder, draft vs published, and per-item SEO fields.

- **Dashboard home** — leads chart, recent activity, quick actions
- **Site settings** — logo, phone, WhatsApp, email, offices, map coords, socials, PEC number, brand accent
- **Homepage builder** — edit every section's copy/media, toggle sections on/off, reorder them
- **Services** — CRUD, icon, hero image, long description, process steps, FAQs
- **Sectors** — CRUD
- **Projects** — CRUD, gallery, client, value, area, storeys, dates, status, sector, city, scope chips, featured toggle
- **Real estate** — developments, unit types, amenities, payment plans, floor plans
- **Team, testimonials, clients/partners, certifications, awards, timeline milestones**
- **Insights** — blog CRUD with rich text
- **Careers** — postings + applications inbox with CV downloads
- **Tenders** — tender notices + vendor registration submissions
- **Leads inbox** — contact/quote/register-interest submissions, status pipeline (new → contacted → won), CSV export
- **Media library** — reusable uploads
- **SEO panel** — per-page title/description/OG image, sitemap, robots, redirects
- **Downloads** — company profile PDF and brochures

Autosave, live preview, and instant reflection on the public site.

## SEO

Unique per-route title/description/OG/Twitter, one H1 per page, semantic HTML, JSON-LD for Organization + LocalBusiness (with Pakistani address/geo) + Service + Article + BreadcrumbList, canonical tags, auto sitemap.xml, robots.txt, descriptive alt text, lazy loading, and Pakistan-localised copy (Lahore/Karachi/Islamabad/Rawalpindi, PKR, Marla/Kanal) so local search picks it up. Google Maps and Facebook wired into contact + LocalBusiness schema.

## Dummy content seeded

9 services with full copy; 12 projects across residential/commercial/industrial/infrastructure in Lahore, Karachi, Islamabad, Faisalabad and Multan with realistic clients, PKR values, areas and dates; 3 real-estate developments with payment plans; 6 team members; 8 client logos; 5 testimonials; 4 insight articles; 3 job posts; certifications and a founding-to-today timeline. All editable from admin.

## Quality bar

Responsive `srcset` imagery in AVIF/WebP, no upscaled blur; verified at 360 / 768 / 1280 / 1920px; accessible contrast, keyboard nav, visible focus rings; lazy route loading, deferred video, optimised fonts.

## Technical notes

- TanStack Start + Tailwind, file-based routes as above; Motion for animation
- Lovable Cloud for database, auth, storage (media/video/CVs), server functions
- Roles in a dedicated `user_roles` table with a security-definer check — never on profiles
- RLS: public read on published content; writes limited to admin/editor
- Tables: site_settings, page_seo, sections, services, sectors, projects, project_media, developments, unit_types, payment_plans, team, testimonials, clients, certifications, awards, milestones, posts, jobs, applications, tenders, vendors, leads, media
- Route loaders + TanStack Query so crawlers get fully server-rendered content

## Build order

1. Design system + 3 rendered directions → you pick
2. Cloud setup: schema, RLS, roles, storage, seed content
3. Public site: home (with hero video), services, sectors, projects, project detail
4. Admin dashboard: auth, roles, all CRUD modules, media, leads, SEO panel
5. Real estate, insights, careers, tenders, downloads, FAQ, contact
6. SEO pass, responsive + performance QA
