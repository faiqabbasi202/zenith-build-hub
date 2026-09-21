import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import {
  DUMMY_PROJECTS_BY_CATEGORY,
  enrichSectorHeroImage,
  enrichServiceHeroImage,
} from "./image-wiring";
import { getOrSetServerCache, invalidateServerCache } from "./server-cache";

/** Public, read-only Supabase client. Created inside handlers only. */
function publicClient() {
  return createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

type Row = Record<string, any>;

export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async () => {
    return getOrSetServerCache("site-settings", async () => {
      const sb = publicClient();
      const { data } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
      return (data ?? null) as Row | null;
    });
  },
);

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  return getOrSetServerCache("home-data", async () => {
    const sb = publicClient();
    const [sections, services, sectors, projects, developments, testimonials, clients, certifications, posts, stats] =
      await Promise.all([
        sb.from("home_sections").select("*").eq("is_visible", true).order("sort_order"),
        sb.from("services").select("*").eq("is_published", true).order("sort_order"),
        sb.from("sectors").select("*").eq("is_published", true).order("sort_order"),
        sb
          .from("projects")
          .select("*")
          .eq("is_published", true)
          .eq("is_featured", true)
          .order("sort_order")
          .limit(6),
        sb
          .from("developments")
          .select("*")
          .eq("is_published", true)
          .order("sort_order")
          .limit(3),
        sb.from("testimonials").select("*").eq("is_published", true).order("sort_order"),
        sb.from("clients").select("*").eq("is_published", true).order("sort_order"),
        sb.from("certifications").select("*").eq("is_published", true).order("sort_order"),
        sb
          .from("posts")
          .select("slug,title,excerpt,cover_image_url,category,read_minutes,published_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(3),
        sb.from("projects").select("status").eq("is_published", true),
      ]);

    const rawSections = (sections.data ?? []) as Row[];
    const enrichedSections = rawSections.map((sec) => {
      if (sec["key"] === "hero") {
        return {
          ...sec,
          media_url: "/images/hero/homepage-hero-desktop.jpg",
          poster_url: "/images/hero/homepage-hero---mobile.jpg",
        };
      }
      return sec;
    });

    const enrichedServices = ((services.data ?? []) as Row[]).map(enrichServiceHeroImage);
    const enrichedSectors = ((sectors.data ?? []) as Row[]).map(enrichSectorHeroImage);

    // Combine featured projects from DB with category dummy projects (DB projects take priority)
    const featuredDummies = DUMMY_PROJECTS_BY_CATEGORY.filter((p) => p.is_featured);
    const dbFeatured = (projects.data ?? []) as Row[];
    const combinedProjects = [
      ...dbFeatured,
      ...featuredDummies.filter((d) => !dbFeatured.some((p) => p["slug"] === d.slug)),
    ].slice(0, 6);

    return {
      sections: enrichedSections,
      services: enrichedServices,
      sectors: enrichedSectors,
      projects: combinedProjects,
      developments: (developments.data ?? []) as Row[],
      testimonials: (testimonials.data ?? []) as Row[],
      clients: (clients.data ?? []) as Row[],
      certifications: (certifications.data ?? []) as Row[],
      posts: (posts.data ?? []) as Row[],
      projectCount: (stats.data ?? []).length + DUMMY_PROJECTS_BY_CATEGORY.length,
    };
  });
});

export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  return getOrSetServerCache("services", async () => {
    const sb = publicClient();
    const { data } = await sb
      .from("services")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    return ((data ?? []) as Row[]).map(enrichServiceHeroImage);
  });
});

const slugInput = (d: unknown) => z.object({ slug: z.string() }).parse(d);

export const getService = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }) => {
    return getOrSetServerCache(`service:${data.slug}`, async () => {
      const sb = publicClient();
      const [service, projects] = await Promise.all([
        sb.from("services").select("*").eq("slug", data.slug).eq("is_published", true).maybeSingle(),
        sb
          .from("projects")
          .select("*")
          .eq("is_published", true)
          .order("sort_order"),
      ]);

      const enrichedService = service.data ? enrichServiceHeroImage(service.data as Row) : null;
      const allProjects = (projects.data ?? []) as Row[];

      // Filter projects that match this service by:
      // 1) sector_slug === data.slug
      // 2) service_slug === data.slug
      // 3) scope contains service keywords
      const serviceWords = data.slug.split("-");
      const matchingProjects = allProjects.filter((p) => {
        if (p["sector_slug"] === data.slug) return true;
        if (p["service_slug"] === data.slug) return true;
        const scopeStr = Array.isArray(p["scope"])
          ? p["scope"].join(" ").toLowerCase()
          : String(p["scope"] || "").toLowerCase();
        return serviceWords.some((w) => w.length > 3 && scopeStr.includes(w));
      });

      // Dummy fallback matching category if any
      const matchingDummies = DUMMY_PROJECTS_BY_CATEGORY.filter((d) => {
        if (d.sector_slug === data.slug) return true;
        const scopeStr = d.scope.join(" ").toLowerCase();
        return serviceWords.some((w) => w.length > 3 && scopeStr.includes(w));
      });

      const relatedDummies = matchingDummies.length > 0
        ? matchingDummies.slice(0, 3)
        : DUMMY_PROJECTS_BY_CATEGORY.slice(0, 3);

      const finalProjects = matchingProjects.length > 0
        ? matchingProjects
        : (allProjects.slice(0, 3).length > 0 ? allProjects.slice(0, 3) : relatedDummies);

      return {
        service: enrichedService,
        projects: finalProjects,
      };
    });
  });

export const getSectors = createServerFn({ method: "GET" }).handler(async () => {
  return getOrSetServerCache("sectors", async () => {
    const sb = publicClient();
    const { data } = await sb
      .from("sectors")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");

    const enriched = ((data ?? []) as Row[]).map(enrichSectorHeroImage);
    const additionalCategories = ["renovation", "real-estate", "careers", "about"];
    for (const cat of additionalCategories) {
      if (!enriched.some((s) => s["slug"] === cat)) {
        enriched.push(enrichSectorHeroImage({
          id: `sec-${cat}`,
          slug: cat,
          title: cat.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          summary: `AMARC specialist ${cat} projects across Pakistan.`,
          is_published: true,
        }));
      }
    }

    return enriched;
  });
});

export const getProjects = createServerFn({ method: "GET" }).handler(async () => {
  return getOrSetServerCache("projects", async () => {
    const sb = publicClient();
    const [projects, sectors] = await Promise.all([
      sb.from("projects").select("*").eq("is_published", true).order("sort_order"),
      sb.from("sectors").select("slug,title").eq("is_published", true).order("sort_order"),
    ]);

    const dbProjects = (projects.data ?? []) as Row[];
    // Prioritize DB projects: if a project exists in the DB, it takes precedence over dummy data
    const combinedProjects = [
      ...dbProjects,
      ...DUMMY_PROJECTS_BY_CATEGORY.filter((d) => !dbProjects.some((p) => p["slug"] === d.slug)),
    ];

    const dbSectors = (sectors.data ?? []) as Row[];
    const requiredCategories = [
      { slug: "residential", title: "Residential" },
      { slug: "commercial", title: "Commercial" },
      { slug: "renovation", title: "Renovation" },
      { slug: "real-estate", title: "Real Estate" },
      { slug: "careers", title: "Careers" },
      { slug: "about", title: "About" },
    ];
    const combinedSectors = [...dbSectors];
    for (const cat of requiredCategories) {
      if (!combinedSectors.some((s) => s["slug"] === cat.slug)) {
        combinedSectors.push(cat);
      }
    }

    return {
      projects: combinedProjects,
      sectors: combinedSectors,
    };
  });
});

export const getProject = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }) => {
    return getOrSetServerCache(`project:${data.slug}`, async () => {
      const sb = publicClient();

      // 1. Check database first so any project edited or created in /admin is used
      const { data: project } = await sb
        .from("projects")
        .select("*")
        .eq("slug", data.slug)
        .eq("is_published", true)
        .maybeSingle();

      if (project) {
        const { data: related } = await sb
          .from("projects")
          .select("slug,title,city,cover_image_url,status,sector_slug,summary")
          .eq("is_published", true)
          .eq("sector_slug", (project as Row)["sector_slug"])
          .neq("slug", data.slug)
          .limit(3);

        const relatedList = (related && related.length > 0)
          ? (related as Row[])
          : DUMMY_PROJECTS_BY_CATEGORY.filter((p) => p.sector_slug === (project as Row)["sector_slug"] && p.slug !== data.slug).slice(0, 3);

        return { project: project as Row, related: relatedList };
      }

      // 2. Fallback to category dummy project if not found in database
      const dummy = DUMMY_PROJECTS_BY_CATEGORY.find((p) => p.slug === data.slug);
      if (dummy) {
        const related = DUMMY_PROJECTS_BY_CATEGORY
          .filter((p) => p.sector_slug === dummy.sector_slug && p.slug !== dummy.slug)
          .slice(0, 3);
        return { project: dummy as Row, related: related as Row[] };
      }

      return { project: null as Row | null, related: [] as Row[] };
    });
  });

export const getDevelopments = createServerFn({ method: "GET" }).handler(async () => {
  return getOrSetServerCache("developments", async () => {
    const sb = publicClient();
    const { data } = await sb
      .from("developments")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    return (data ?? []) as Row[];
  });
});

export const getDevelopment = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }) => {
    return getOrSetServerCache(`development:${data.slug}`, async () => {
      const sb = publicClient();
      const { data: development } = await sb
        .from("developments")
        .select("*")
        .eq("slug", data.slug)
        .eq("is_published", true)
        .maybeSingle();
      return { development: (development ?? null) as Row | null };
    });
  });

export const getAboutData = createServerFn({ method: "GET" }).handler(async () => {
  return getOrSetServerCache("about-data", async () => {
    const sb = publicClient();
    const [team, milestones, certifications, awards, clients, settings] = await Promise.all([
      sb.from("team_members").select("*").eq("is_published", true).order("sort_order"),
      sb.from("milestones").select("*").eq("is_published", true).order("sort_order"),
      sb.from("certifications").select("*").eq("is_published", true).order("sort_order"),
      sb.from("awards").select("*").eq("is_published", true).order("sort_order"),
      sb.from("clients").select("*").eq("is_published", true).order("sort_order"),
      sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    return {
      team: (team.data ?? []) as Row[],
      milestones: (milestones.data ?? []) as Row[],
      certifications: (certifications.data ?? []) as Row[],
      awards: (awards.data ?? []) as Row[],
      clients: (clients.data ?? []) as Row[],
      settings: (settings.data ?? null) as Row | null,
    };
  });
});

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  return getOrSetServerCache("posts", async () => {
    const sb = publicClient();
    const { data } = await sb
      .from("posts")
      .select("slug,title,excerpt,cover_image_url,category,author,read_minutes,published_at,tags")
      .eq("is_published", true)
      .order("published_at", { ascending: false });
    return (data ?? []) as Row[];
  });
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }) => {
    return getOrSetServerCache(`post:${data.slug}`, async () => {
      const sb = publicClient();
      const [post, more] = await Promise.all([
        sb.from("posts").select("*").eq("slug", data.slug).eq("is_published", true).maybeSingle(),
        sb
          .from("posts")
          .select("slug,title,excerpt,cover_image_url,category,read_minutes,published_at")
          .eq("is_published", true)
          .neq("slug", data.slug)
          .order("published_at", { ascending: false })
          .limit(3),
      ]);
      return { post: (post.data ?? null) as Row | null, more: (more.data ?? []) as Row[] };
    });
  });

export const getCareersData = createServerFn({ method: "GET" }).handler(async () => {
  return getOrSetServerCache("careers", async () => {
    const sb = publicClient();
    const { data } = await sb
      .from("jobs")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    return (data ?? []) as Row[];
  });
});

export const getTenders = createServerFn({ method: "GET" }).handler(async () => {
  return getOrSetServerCache("tenders", async () => {
    const sb = publicClient();
    const { data } = await sb
      .from("tenders")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    return (data ?? []) as Row[];
  });
});

export const getFaqs = createServerFn({ method: "GET" }).handler(async () => {
  return getOrSetServerCache("faqs", async () => {
    const sb = publicClient();
    const { data } = await sb.from("faqs").select("*").eq("is_published", true).order("sort_order");
    return (data ?? []) as Row[];
  });
});

export const getDownloads = createServerFn({ method: "GET" }).handler(async () => {
  return getOrSetServerCache("downloads", async () => {
    const sb = publicClient();
    const { data } = await sb
      .from("downloads")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");
    return (data ?? []) as Row[];
  });
});

/* ------------------------------ submissions ------------------------------ */

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().min(2).max(120),
        email: z.string().email().max(160).optional().or(z.literal("")),
        phone: z.string().max(40).optional().or(z.literal("")),
        company: z.string().max(160).optional().or(z.literal("")),
        city: z.string().max(80).optional().or(z.literal("")),
        service_interest: z.string().max(120).optional().or(z.literal("")),
        project_type: z.string().max(120).optional().or(z.literal("")),
        budget: z.string().max(80).optional().or(z.literal("")),
        subject: z.string().max(200).optional().or(z.literal("")),
        message: z.string().max(4000).optional().or(z.literal("")),
        source: z.string().max(60).default("website"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("leads").insert(data);
    if (error) throw new Error("Could not send your enquiry. Please try again.");
    return { ok: true };
  });

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        job_title: z.string().max(160).optional().or(z.literal("")),
        name: z.string().min(2).max(120),
        email: z.string().email().max(160),
        phone: z.string().max(40).optional().or(z.literal("")),
        cv_url: z.string().max(500).optional().or(z.literal("")),
        cover_letter: z.string().max(4000).optional().or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("applications").insert(data);
    if (error) throw new Error("Could not submit your application. Please try again.");
    return { ok: true };
  });

export const submitVendor = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        company_name: z.string().min(2).max(160),
        contact_person: z.string().max(120).optional().or(z.literal("")),
        email: z.string().email().max(160),
        phone: z.string().max(40).optional().or(z.literal("")),
        category: z.string().max(120).optional().or(z.literal("")),
        ntn: z.string().max(60).optional().or(z.literal("")),
        city: z.string().max(80).optional().or(z.literal("")),
        website: z.string().max(200).optional().or(z.literal("")),
        message: z.string().max(4000).optional().or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("vendors").insert(data);
    if (error) throw new Error("Could not submit your registration. Please try again.");
    return { ok: true };
  });

export const getPageSeo = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ path: z.string() }).parse(d))
  .handler(async ({ data }) => {
    return getOrSetServerCache(`page-seo:${data.path}`, async () => {
      const sb = publicClient();
      const { data: row } = await sb
        .from("page_seo")
        .select("*")
        .eq("path", data.path)
        .maybeSingle();
      return (row ?? null) as Row | null;
    });
  });

export const getAllPageSeo = createServerFn({ method: "GET" }).handler(async () => {
  return getOrSetServerCache("all-page-seo", async () => {
    const sb = publicClient();
    const { data } = await sb.from("page_seo").select("*");
    return (data ?? []) as Row[];
  });
});

/** Server Function to invalidate cache from client mutations (e.g. Admin actions) */
export const invalidateContentCache = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ pattern: z.string().optional() }).optional().parse(d),
  )
  .handler(async ({ data }) => {
    invalidateServerCache(data?.pattern);
    return { ok: true };
  });
