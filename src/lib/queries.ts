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
    queryFn: () => getService({ data: { slug } }),
    staleTime: 60_000,
  });

export const sectorsQuery = queryOptions({
  queryKey: ["sectors"],
  queryFn: () => getSectors(),
  staleTime: 60_000,
});

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: () => getProjects(),
  staleTime: 60_000,
});

export const projectQuery = (slug: string) =>
  queryOptions({
    queryKey: ["project", slug],
    queryFn: () => getProject({ data: { slug } }),
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
