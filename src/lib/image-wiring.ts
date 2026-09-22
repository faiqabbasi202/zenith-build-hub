export type CategoryKey =
  | "residential"
  | "commercial"
  | "renovation"
  | "real-estate"
  | "careers"
  | "about"
  | "infrastructure";

export interface DummyProject {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  sector_slug: string;
  status: "newly_launched" | "ongoing" | "completed" | "handed_over";
  city: string;
  location: string;
  cover_image_url: string;
  gallery: string[];
  scope: string[];
  value_pkr_millions?: number;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
}

/** First image per category */
export const CATEGORY_HERO_IMAGES: Record<CategoryKey, string> = {
  residential: "/images/residential/services-residential-construction.jpg",
  commercial: "/images/commercial/services-commercial-construction.jpg",
  renovation: "/images/renovation/services-renovation--fit-out.jpg",
  "real-estate": "/images/real-estate/real-estate-development-dusk-render.jpg",
  careers: "/images/careers/careers---culture.jpg",
  about: "/images/about/careers---culture.jpg",
  infrastructure: "/images/commercial/services-infrastructure.jpg",
};

/** All images grouped by category */
export const CATEGORY_GALLERIES: Record<CategoryKey, string[]> = {
  residential: [
    "/images/residential/services-residential-construction.jpg",
    "/images/residential/featured-project-interior.jpg",
  ],
  commercial: [
    "/images/commercial/services-commercial-construction.jpg",
    "/images/commercial/featured-project-exterior-day.jpg",
    "/images/commercial/services-infrastructure.jpg",
  ],
  renovation: [
    "/images/renovation/services-renovation--fit-out.jpg",
    "/images/renovation/featured-project-interior.jpg",
  ],
  "real-estate": [
    "/images/real-estate/real-estate-development-dusk-render.jpg",
    "/images/real-estate/featured-project-aerial.jpg",
  ],
  careers: [
    "/images/careers/careers---culture.jpg",
    "/images/commercial/featured-project-exterior-day.jpg",
  ],
  about: [
    "/images/about/careers---culture.jpg",
    "/images/about/featured-project-exterior-day.jpg",
  ],
  infrastructure: [
    "/images/commercial/services-infrastructure.jpg",
    "/images/commercial/services-commercial-construction.jpg",
  ],
};

/** 2-3 Dummy projects per category */
export const DUMMY_PROJECTS_BY_CATEGORY: DummyProject[] = [
  // ── Residential
  {
    id: "proj-res-bajwa",
    slug: "bajwa-heights",
    title: "Bajwa Heights",
    summary:
      "Experience elite vertical living at Bajwa Heights, featuring ultra-modern two and three-bedroom luxury apartments equipped with smart-home architecture, panoramic city views, and world-class building amenities.",
    description:
      "Bajwa Heights sets a new benchmark for contemporary urban real estate. Designed with structural sophistication and sustainable engineering, each residence delivers panoramic city vistas, refined interior layouts, and direct access to premier lifestyle amenities.",
    sector_slug: "residential",
    status: "newly_launched",
    city: "Islamabad",
    location: "Islamabad",
    cover_image_url: "/images/projects/bajwa-heights/cover.jpg",
    gallery: [
      "/images/projects/bajwa-heights/cover.jpg",
      "/images/projects/bajwa-heights/interior.jpg",
      "/images/projects/bajwa-heights/perspective-1.jpg",
      "/images/projects/bajwa-heights/perspective-2.jpg",
    ],
    scope: [],
    is_featured: true,
    is_published: true,
    sort_order: 0,
  },
  {
    id: "proj-res-01",
    slug: "al-hafiz-executive-residence",
    title: "Al-Hafiz Executive Residence",
    summary: "A contemporary 2-kanal residence combining fair-face concrete, thermal glazing and sustainable finishes.",
    description: "Designed and built for seamless indoor-outdoor living with smart home automation and solar net-metering integration.",
    sector_slug: "residential",
    status: "completed",
    city: "Lahore",
    location: "DHA Phase 6",
    cover_image_url: CATEGORY_GALLERIES["residential"][0]!,
    gallery: CATEGORY_GALLERIES["residential"],
    scope: ["Turnkey Civil Works", "Structural MEP", "Architectural Finishes"],
    value_pkr_millions: 145,
    is_featured: true,
    is_published: true,
    sort_order: 1,
  },
  {
    id: "proj-res-02",
    slug: "pine-crest-luxury-villa",
    title: "Pine Crest Luxury Villa",
    summary: "Tri-level hillside villa emphasizing seismic resilience and expansive panoramic terraces.",
    description: "Features custom acoustic paneling, imported Italian porcelain flooring, and full climate-controlled interiors.",
    sector_slug: "residential",
    status: "ongoing",
    city: "Islamabad",
    location: "Bahria Enclave",
    cover_image_url: CATEGORY_GALLERIES["residential"][1]!,
    gallery: CATEGORY_GALLERIES["residential"],
    scope: ["Deep Foundation Piling", "Reinforced Concrete Core", "Interior Fit-out"],
    value_pkr_millions: 180,
    is_featured: false,
    is_published: true,
    sort_order: 2,
  },
  {
    id: "proj-res-03",
    slug: "zaytoun-modern-home",
    title: "Zaytoun Modern Estate",
    summary: "Minimalist urban courtyard home featuring double-height ceiling voids and passive daylight design.",
    description: "Constructed with low-carbon concrete mixes and high-efficiency VRF HVAC zoning.",
    sector_slug: "residential",
    status: "handed_over",
    city: "Rawalpindi",
    location: "Chaklala Scheme 3",
    cover_image_url: CATEGORY_GALLERIES["residential"][0]!,
    gallery: CATEGORY_GALLERIES["residential"],
    scope: ["Architectural Design", "General Contracting", "Landscaping"],
    value_pkr_millions: 120,
    is_featured: true,
    is_published: true,
    sort_order: 3,
  },

  // ── Commercial (3 projects)
  {
    id: "proj-com-01",
    slug: "apex-corporate-center",
    title: "Apex Corporate Center",
    summary: "14-storey Grade-A commercial office tower with column-free floor plates and high-speed destination elevators.",
    description: "Constructed with post-tensioned slabs to maximize tenant layout flexibility and energy efficiency.",
    sector_slug: "commercial",
    status: "completed",
    city: "Lahore",
    location: "Gulberg III",
    cover_image_url: CATEGORY_GALLERIES["commercial"][0]!,
    gallery: CATEGORY_GALLERIES["commercial"],
    scope: ["Post-Tensioned Slabs", "Unitized Curtain Wall", "BMS & Fire Suppression"],
    value_pkr_millions: 850,
    is_featured: true,
    is_published: true,
    sort_order: 4,
  },
  {
    id: "proj-com-02",
    slug: "centrum-commercial-plaza",
    title: "Centrum Commercial Plaza",
    summary: "Multi-level commercial complex featuring retail podiums, subterranean parking, and corporate suites.",
    description: "Equipped with dual power backup, central firefighting systems, and fiber-to-the-suite infrastructure.",
    sector_slug: "commercial",
    status: "ongoing",
    city: "Islamabad",
    location: "Blue Area",
    cover_image_url: CATEGORY_GALLERIES["commercial"][1]!,
    gallery: CATEGORY_GALLERIES["commercial"],
    scope: ["Civil Construction", "Electrical Substation", "Escalator & Lift Shafts"],
    value_pkr_millions: 620,
    is_featured: false,
    is_published: true,
    sort_order: 5,
  },
  {
    id: "proj-com-03",
    slug: "horizon-business-hub",
    title: "Horizon Business Hub",
    summary: "State-of-the-art office facility designed for multinational tenants and financial institutions.",
    description: "Built to international seismic standards with LEED Silver certification benchmarks.",
    sector_slug: "commercial",
    status: "newly_launched",
    city: "Karachi",
    location: "Clifton Block 4",
    cover_image_url: CATEGORY_GALLERIES["commercial"][2]!,
    gallery: CATEGORY_GALLERIES["commercial"],
    scope: ["Substructure Piling", "Superstructure EPC", "MEP Engineering"],
    value_pkr_millions: 1100,
    is_featured: true,
    is_published: true,
    sort_order: 6,
  },

  // ── Renovation (3 projects)
  {
    id: "proj-ren-01",
    slug: "heritage-plaza-adaptive-reuse",
    title: "Heritage Plaza Adaptive Reuse",
    summary: "Structural retrofitting and facade restoration of a 1960s commercial building into modern tech offices.",
    description: "Preserving historical architectural brickwork while modernizing fire, electrical, and HVAC lifelines.",
    sector_slug: "renovation",
    status: "completed",
    city: "Lahore",
    location: "Mall Road",
    cover_image_url: CATEGORY_GALLERIES["renovation"][0]!,
    gallery: CATEGORY_GALLERIES["renovation"],
    scope: ["Seismic Carbon-Fiber Retrofit", "Interior Space Planning", "Acoustic Ceilings"],
    value_pkr_millions: 95,
    is_featured: true,
    is_published: true,
    sort_order: 7,
  },
  {
    id: "proj-ren-02",
    slug: "tech-park-workplace-fitout",
    title: "Tech Park Workplace Fit-out",
    summary: "High-spec 40,000 sq ft agile office transformation for 400 software engineers.",
    description: "Constructed within a 12-week schedule with zero downtime for surrounding business tenants.",
    sector_slug: "renovation",
    status: "handed_over",
    city: "Lahore",
    location: "Johar Town",
    cover_image_url: CATEGORY_GALLERIES["renovation"][1]!,
    gallery: CATEGORY_GALLERIES["renovation"],
    scope: ["Demountable Partitions", "Raised Access Flooring", "Precision Cooling"],
    value_pkr_millions: 80,
    is_featured: false,
    is_published: true,
    sort_order: 8,
  },
  {
    id: "proj-ren-03",
    slug: "executive-suite-modernization",
    title: "Executive Suite Modernization",
    summary: "Turnkey luxury boardroom and executive wing overhaul with custom walnut millwork and smart AV conferencing.",
    description: "Complete replacement of outdated mechanical services with whisper-quiet variable airflow units.",
    sector_slug: "renovation",
    status: "completed",
    city: "Islamabad",
    location: "F-7 Markaz",
    cover_image_url: CATEGORY_GALLERIES["renovation"][0]!,
    gallery: CATEGORY_GALLERIES["renovation"],
    scope: ["Custom Joinery", "Smart Lighting Automation", "Acoustic Glazing"],
    value_pkr_millions: 65,
    is_featured: false,
    is_published: true,
    sort_order: 9,
  },

  // ── Real Estate (2 projects)
  {
    id: "proj-re-01",
    slug: "the-atrium-residences-retail",
    title: "The Atrium Residences & Retail",
    summary: "Premium mixed-use development comprising luxury duplex penthouses, serviced flats and high-street dining.",
    description: "An AMARC own-account development combining bespoke architecture, landscaped rooftop pools and 24/7 security.",
    sector_slug: "real-estate",
    status: "ongoing",
    city: "Islamabad",
    location: "Sector F-11",
    cover_image_url: CATEGORY_GALLERIES["real-estate"][0]!,
    gallery: CATEGORY_GALLERIES["real-estate"],
    scope: ["Full EPC Development", "Luxury Residential Finishes", "Retail Arcade"],
    value_pkr_millions: 1400,
    is_featured: true,
    is_published: true,
    sort_order: 10,
  },
  {
    id: "proj-re-02",
    slug: "verdant-heights-luxury-towers",
    title: "Verdant Heights Luxury Towers",
    summary: "Twin residential towers offering 3 and 4-bedroom ocean-facing residences with dedicated underground parking.",
    description: "Engineered with anti-corrosion maritime grade rebar and high-durability thermal facade coatings.",
    sector_slug: "real-estate",
    status: "newly_launched",
    city: "Karachi",
    location: "DHA Phase 8",
    cover_image_url: CATEGORY_GALLERIES["real-estate"][1]!,
    gallery: CATEGORY_GALLERIES["real-estate"],
    scope: ["Deep Diaphragm Walls", "Post-Tensioned Superstructure", "Infinity Skydeck"],
    value_pkr_millions: 2100,
    is_featured: true,
    is_published: true,
    sort_order: 11,
  },

  // ── Careers (2 projects)
  {
    id: "proj-car-01",
    slug: "amarc-engineering-innovation-lab",
    title: "AMARC Engineering Innovation Lab",
    summary: "Dedicated research, materials testing and apprentice training academy for structural engineering excellence.",
    description: "Equipped with concrete compression testing rigs, soil mechanics instrumentation and digital surveying suites.",
    sector_slug: "careers",
    status: "completed",
    city: "Lahore",
    location: "Model Town",
    cover_image_url: CATEGORY_GALLERIES["careers"][0]!,
    gallery: CATEGORY_GALLERIES["careers"],
    scope: ["Specialized Lab Fitout", "Clean Room Protocols", "Auditorium & Classrooms"],
    value_pkr_millions: 110,
    is_featured: false,
    is_published: true,
    sort_order: 12,
  },
  {
    id: "proj-car-02",
    slug: "site-training-safety-pavilion",
    title: "Site Training & Safety Pavilion",
    summary: "Multi-functional safety onboarding and occupational training pavilion constructed on an active industrial site.",
    description: "Showcasing AMARC's zero-harm health and safety culture and field hazard simulation modules.",
    sector_slug: "careers",
    status: "completed",
    city: "Lahore",
    location: "Sundar Industrial Estate",
    cover_image_url: CATEGORY_GALLERIES["careers"][1]!,
    gallery: CATEGORY_GALLERIES["careers"],
    scope: ["Fast-Track Steel Frame", "Acoustic Enclosures", "Demonstration Bay"],
    value_pkr_millions: 75,
    is_featured: false,
    is_published: true,
    sort_order: 13,
  },

  // ── About (2 projects)
  {
    id: "proj-abt-01",
    slug: "amarc-central-headquarters",
    title: "AMARC Central Headquarters Complex",
    summary: "The flagship administrative and project coordination campus uniting AMARC's core leadership divisions.",
    description: "A benchmark of contemporary engineering with integrated solar array, rain harvesting, and collaborative design studios.",
    sector_slug: "about",
    status: "completed",
    city: "Lahore",
    location: "Main Boulevard, Gulberg",
    cover_image_url: CATEGORY_GALLERIES["about"][0]!,
    gallery: CATEGORY_GALLERIES["about"],
    scope: ["Turnkey Architecture", "Structural Engineering", "Sustainable Systems"],
    value_pkr_millions: 420,
    is_featured: false,
    is_published: true,
    sort_order: 14,
  },
  {
    id: "proj-abt-02",
    slug: "regional-logistics-depot",
    title: "Regional Plant & Logistics Depot",
    summary: "Heavy machinery maintenance workshop, concrete batching coordination hub and central logistics warehouse.",
    description: "Facilitates seamless regional distribution of heavy plant equipment and specialized construction scaffolding.",
    sector_slug: "about",
    status: "completed",
    city: "Multan",
    location: "Industrial Corridor",
    cover_image_url: CATEGORY_GALLERIES["about"][1]!,
    gallery: CATEGORY_GALLERIES["about"],
    scope: ["Heavy Duty Pavements", "Steel Portal Frames", "Automated Crane Gantry"],
    value_pkr_millions: 190,
    is_featured: false,
    is_published: true,
    sort_order: 15,
  },
];

/** Enrich database sectors with the new first image from the matching category */
export function enrichSectorHeroImage(sector: Record<string, any>): Record<string, any> {
  const slug = sector["slug"] as CategoryKey | undefined;
  if (slug && slug in CATEGORY_HERO_IMAGES) {
    return { ...sector, hero_image_url: CATEGORY_HERO_IMAGES[slug] };
  }
  return sector;
}

/** Per-service image map — each service now has its own unique AI-generated image */
const SERVICE_IMAGE_MAP: Record<string, string> = {
  "architectural-design":    "/images/services/services-architectural-design.jpg",
  "structural-design":       "/images/services/services-structural-design.jpg",
  "construction-services":   "/images/services/services-construction-services.jpg",
  "project-management":      "/images/services/services-project-management.jpg",
  "real-estate":             "/images/services/services-real-estate.jpg",
  "material-supplies":       "/images/services/services-material-supplies.jpg",
  "contracts-consultancy":   "/images/services/services-contracts-consultancy.jpg",
  "topography-soil-testing": "/images/services/services-topography-soil-testing.jpg",
  "interior-design":         "/images/services/services-interior-design.jpg",
};

/** Enrich database services with the first image from the matching category */
export function enrichServiceHeroImage(service: Record<string, any>): Record<string, any> {
  // If the DB already has a hero_image_url set, use it directly
  if (service["hero_image_url"]) return service;

  const slug = String(service["slug"] ?? "");
  let match: string | undefined = SERVICE_IMAGE_MAP[slug];

  // Fallback heuristics if slug not in map
  if (!match) {
    if (slug.includes("residential") || slug.includes("architectural") || slug.includes("interior")) {
      match = CATEGORY_HERO_IMAGES["residential"];
    } else if (slug.includes("real-estate")) {
      match = CATEGORY_HERO_IMAGES["real-estate"];
    } else if (slug.includes("renovation") || slug.includes("fit-out") || slug.includes("contract")) {
      match = CATEGORY_HERO_IMAGES["renovation"];
    } else if (slug.includes("infrastructure") || slug.includes("soil") || slug.includes("topo")) {
      match = CATEGORY_HERO_IMAGES["infrastructure"];
    } else {
      match = CATEGORY_HERO_IMAGES["commercial"];
    }
  }

  return { ...service, hero_image_url: match };
}
