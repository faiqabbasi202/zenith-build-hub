import { queryOptions } from "@tanstack/react-query";

import {
  getAboutData,
  getCareersData,
  getDevelopment,
  getDevelopments,
  getDownloads,
  getFaqs,
  getHomeData,
  getPost,
  getPosts,
  getProject,
  getProjects,
  getSectors,
  getService,
  getServices,
  getPageSeo,
  getAllPageSeo,
  getSiteSettings,
  getTenders,
} from "./content.functions";

export const siteSettingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: () => getSiteSettings(),
  staleTime: 5 * 60_000,
});

export const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => getHomeData(),
  staleTime: 60_000,
});

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: () => getServices(),
  staleTime: 60_000,
});

export const serviceQuery = (slug: string) =>
  queryOptions({
    queryKey: ["service", slug],
    queryFn: async () => {
      const serverResult = await getService({ data: { slug } });
      if (typeof window !== "undefined") {
        const { getLocalProjects } = await import("./data-store");
        const localProjects = getLocalProjects();
        const serviceWords = slug.split("-");
        const localMatches = localProjects.filter((p) => {
          if (p["service_slug"] === slug || p["sector_slug"] === slug) return true;
          const scopeStr = Array.isArray(p["scope"])
            ? p["scope"].join(" ").toLowerCase()
            : String(p["scope"] || "").toLowerCase();
          return serviceWords.some((w) => w.length > 3 && scopeStr.includes(w));
        });

        if (localMatches.length > 0) {
          const existingSlugs = new Set(serverResult.projects.map((p: any) => p["slug"]));
          const newUnique = localMatches.filter((p) => !existingSlugs.has(p["slug"]));
          return {
            ...serverResult,
            projects: [...newUnique, ...serverResult.projects],
          };
        }
      }
      return serverResult;
    },
    staleTime: 60_000,
  });

export const sectorsQuery = queryOptions({
  queryKey: ["sectors"],
  queryFn: () => getSectors(),
  staleTime: 60_000,
});

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async () => {
    const serverResult = await getProjects();
    if (typeof window !== "undefined") {
      const { mergeWithLocalRecords } = await import("./data-store");
      return {
        ...serverResult,
        projects: mergeWithLocalRecords("projects", serverResult.projects),
      };
    }
    return serverResult;
  },
  staleTime: 60_000,
});

export const projectQuery = (slug: string) =>
  queryOptions({
    queryKey: ["project", slug],
    queryFn: async () => {
      const serverResult = await getProject({ data: { slug } });
      if (serverResult.project) {
        if (typeof window !== "undefined") {
          const { getLocalProjectBySlug } = await import("./data-store");
          const local = getLocalProjectBySlug(slug);
          if (local) {
            return {
              ...serverResult,
              project: { ...serverResult.project, ...local },
            };
          }
        }
        return serverResult;
      }

      // If not on server, check local store
      if (typeof window !== "undefined") {
        const { getLocalProjectBySlug } = await import("./data-store");
        const local = getLocalProjectBySlug(slug);
        if (local) {
          return { project: local, related: [] };
        }
      }

      return serverResult;
    },
    staleTime: 60_000,
  });

export const developmentsQuery = queryOptions({
  queryKey: ["developments"],
  queryFn: () => getDevelopments(),
  staleTime: 60_000,
});

export const developmentQuery = (slug: string) =>
  queryOptions({
    queryKey: ["development", slug],
    queryFn: () => getDevelopment({ data: { slug } }),
    staleTime: 60_000,
  });

export const aboutQuery = queryOptions({
  queryKey: ["about"],
  queryFn: () => getAboutData(),
  staleTime: 60_000,
});

export const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: () => getPosts(),
  staleTime: 60_000,
});

export const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    queryFn: () => getPost({ data: { slug } }),
    staleTime: 60_000,
  });

export const careersQuery = queryOptions({
  queryKey: ["careers"],
  queryFn: () => getCareersData(),
  staleTime: 60_000,
});

export const tendersQuery = queryOptions({
  queryKey: ["tenders"],
  queryFn: () => getTenders(),
  staleTime: 60_000,
});

export const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: () => getFaqs(),
  staleTime: 60_000,
});

export const downloadsQuery = queryOptions({
  queryKey: ["downloads"],
  queryFn: () => getDownloads(),
  staleTime: 60_000,
});

export const pageSeoQuery = (path: string) =>
  queryOptions({
    queryKey: ["page-seo", path],
    queryFn: () => getPageSeo({ data: { path } }),
    staleTime: 60_000,
  });

export const allPageSeoQuery = queryOptions({
  queryKey: ["all-page-seo"],
  queryFn: () => getAllPageSeo(),
  staleTime: 60_000,
});

