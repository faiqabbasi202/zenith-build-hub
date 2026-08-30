import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

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
    const sb = publicClient();
    const { data } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
    return (data ?? null) as Row | null;
  },
);

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
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

  return {
    sections: (sections.data ?? []) as Row[],
    services: (services.data ?? []) as Row[],
    sectors: (sectors.data ?? []) as Row[],
    projects: (projects.data ?? []) as Row[],
    developments: (developments.data ?? []) as Row[],
    testimonials: (testimonials.data ?? []) as Row[],
    clients: (clients.data ?? []) as Row[],
    certifications: (certifications.data ?? []) as Row[],
    posts: (posts.data ?? []) as Row[],
    projectCount: (stats.data ?? []).length,
  };
});

export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("services")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return (data ?? []) as Row[];
});

const slugInput = (d: unknown) => z.object({ slug: z.string() }).parse(d);

export const getService = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [service, projects] = await Promise.all([
      sb.from("services").select("*").eq("slug", data.slug).eq("is_published", true).maybeSingle(),
      sb
        .from("projects")
        .select("slug,title,city,cover_image_url,status,sector_slug")
        .eq("is_published", true)
        .order("sort_order")
        .limit(3),
    ]);
    return {
      service: (service.data ?? null) as Row | null,
      projects: (projects.data ?? []) as Row[],
    };
  });

export const getSectors = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("sectors")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return (data ?? []) as Row[];
});

export const getProjects = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [projects, sectors] = await Promise.all([
    sb.from("projects").select("*").eq("is_published", true).order("sort_order"),
    sb.from("sectors").select("slug,title").eq("is_published", true).order("sort_order"),
  ]);
  return {
    projects: (projects.data ?? []) as Row[],
    sectors: (sectors.data ?? []) as Row[],
  };
});

export const getProject = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: project } = await sb
      .from("projects")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (!project) return { project: null as Row | null, related: [] as Row[] };
    const { data: related } = await sb
      .from("projects")
      .select("slug,title,city,cover_image_url,status,sector_slug,summary")
      .eq("is_published", true)
      .eq("sector_slug", (project as Row)["sector_slug"])
      .neq("slug", data.slug)
      .limit(3);
    return { project: project as Row, related: (related ?? []) as Row[] };
  });

export const getDevelopments = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("developments")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return (data ?? []) as Row[];
});

export const getDevelopment = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: development } = await sb
      .from("developments")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    return { development: (development ?? null) as Row | null };
  });

export const getAboutData = createServerFn({ method: "GET" }).handler(async () => {
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

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("posts")
    .select("slug,title,excerpt,cover_image_url,category,author,read_minutes,published_at,tags")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  return (data ?? []) as Row[];
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator(slugInput)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: post } = await sb
      .from("posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    const { data: more } = await sb
      .from("posts")
      .select("slug,title,excerpt,cover_image_url,category,read_minutes,published_at")
      .eq("is_published", true)
      .neq("slug", data.slug)
      .order("published_at", { ascending: false })
      .limit(3);
    return { post: (post ?? null) as Row | null, more: (more ?? []) as Row[] };
  });

export const getCareersData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("jobs")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return (data ?? []) as Row[];
});

export const getTenders = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("tenders")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return (data ?? []) as Row[];
});

export const getFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb.from("faqs").select("*").eq("is_published", true).order("sort_order");
  return (data ?? []) as Row[];
});

export const getDownloads = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("downloads")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return (data ?? []) as Row[];
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
