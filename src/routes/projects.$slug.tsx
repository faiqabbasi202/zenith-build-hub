import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Maximize2, ExternalLink } from "lucide-react";

import { Action, Container, PageHero, Reveal, SectionHead, StatusChip } from "@/components/site/primitives";
import { ProjectCard } from "@/components/site/project-card";
import { ResponsiveImage } from "@/components/site/responsive-image";
import { SiteShell } from "@/components/site/site-shell";
import { ImageLightbox } from "@/components/site/image-lightbox";
import { asList, longDate, pkr, statusLabel } from "@/lib/format";
import { projectQuery } from "@/lib/queries";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(projectQuery(params.slug));
    if (!data.project) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.project) {
      return { meta: [{ title: "Project not found | AMARC" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.project;
    const title = p["seo_title"] || `${p["title"]} | AMARC Projects`;
    const description = p["seo_description"] || p["summary"] || "";
    const ogImage = p["cover_image_url"] || "/images/hero/homepage-hero-desktop.jpg";
    return buildSeoHead({
      path: `/projects/${p["slug"]}`,
      seo: {
        title,
        description,
        og_image_url: ogImage,
      },
      fallbackTitle: title,
      fallbackDescription: description,
      fallbackOgImage: ogImage,
      type: "article",
    });
  },
  component: ProjectDetail,
  notFoundComponent: () => (
    <SiteShell>
      <PageHero eyebrow="404" title="That project doesn’t exist." />
    </SiteShell>
  ),
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(projectQuery(slug));
  const project = data.project!;
  const scope = asList(project["scope"]);
  const gallery = asList(project["gallery"]);

  // Build combined array of all project images for the lightbox
  const allImages = Array.from(
    new Set([project["cover_image_url"], ...gallery].filter(Boolean) as string[]),
  );

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (src: string) => {
    const idx = allImages.indexOf(src);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const facts = [
    ["Client", project["client"]],
    ["Location", [project["location"], project["city"]].filter(Boolean).join(", ")],
    ["Contract value", project["value_pkr_millions"] ? pkr(project["value_pkr_millions"]) : null],
    ["Covered area", project["covered_area"]],
    ["Plot area", project["plot_area"]],
    ["Storeys", project["storeys"]],
    ["Start", project["start_date"] ? longDate(project["start_date"]) : null],
    ["Completion", project["completion_date"] ? longDate(project["completion_date"]) : null],
    ["Architect", project["architect"]],
    ["Certifications", project["certifications"]],
  ].filter(([, v]) => Boolean(v)) as [string, string][];

  return (
    <SiteShell>
      <PageHero
        eyebrow="Project"
        title={project["title"]}
        intro={project["summary"]}
        image={project["cover_image_url"]}
      >
        <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-8 sm:gap-3">
          <StatusChip label={statusLabel(project["status"])} />

          {/* Sector Badge with Interconnection Link */}
          {project["sector_slug"] && (
            <Link
              to="/projects"
              search={{ sector: project["sector_slug"] }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground/80 hover:border-amber hover:text-amber transition"
            >
              Sector: {project["sector_slug"].replace(/-/g, " ")}
            </Link>
          )}

          {/* Service Badge with Interconnection Link */}
          {project["service_slug"] && (
            <Link
              to="/services/$slug"
              params={{ slug: project["service_slug"] }}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber hover:bg-amber/25 transition"
            >
              Service: {project["service_slug"].replace(/-/g, " ")}
            </Link>
          )}

          {project["progress_percent"] != null && project["status"] === "ongoing" ? (
            <span className="label-mono text-xs text-muted-foreground sm:text-sm">
              {project["progress_percent"]}% complete
            </span>
          ) : null}

          {/* View Full Photos Button */}
          {allImages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setLightboxIndex(0);
                setLightboxOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-foreground/85 hover:border-amber hover:text-amber transition shadow-xs"
            >
              <Maximize2 className="h-3.5 w-3.5 text-amber" />
              View Full Photos ({allImages.length})
            </button>
          )}
        </div>
      </PageHero>

      <section className="bg-background py-10 sm:py-16 md:py-24 lg:py-28">
        <Container className="grid gap-8 md:gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <p className="text-base leading-relaxed whitespace-pre-line text-foreground/85 sm:text-lg md:text-xl">
              {project["description"]}
            </p>

            {scope.length ? (
              <div className="mt-8 sm:mt-12">
                <h2 className="label-mono text-xs text-amber sm:text-sm">Scope of works</h2>
                <ul className="mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-2 sm:gap-3">
                  {scope.map((s) => (
                    <li key={s} className="flex gap-3 text-xs text-foreground/85 sm:text-sm md:text-base">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-amber" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Gallery Grid with Click to View Full Size */}
            {gallery.length ? (
              <div className="mt-8 sm:mt-14">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="label-mono text-xs text-amber sm:text-sm">
                    Project Gallery ({gallery.length} photos)
                  </h2>
                  <span className="text-xs text-muted-foreground">Click any photo to view full size</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {gallery.map((src, i) => (
                    <Reveal key={src + i} delay={(i % 2) * 0.06} className="overflow-hidden">
                      <div
                        onClick={() => openLightbox(src)}
                        className="group relative cursor-pointer overflow-hidden border border-border bg-surface transition duration-200 hover:border-amber hover:shadow-lg"
                        title="Click to view full picture of perfect size"
                      >
                        <ResponsiveImage
                          src={src}
                          alt={`${project["title"]} — view ${i + 1}`}
                          aspectRatio="16/10"
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/75 px-3 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur-xs">
                            <Maximize2 className="h-4 w-4 text-amber" />
                            View Full Picture
                          </span>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6 sm:space-y-10">
            <dl className="divide-y divide-border border border-border bg-surface">
              {facts.map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
                  <dt className="label-mono text-[10px] text-muted-foreground sm:text-xs">{k}</dt>
                  <dd className="text-right text-xs font-medium sm:text-sm">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="border border-border bg-surface p-5 sm:p-7">
              <h2 className="font-display text-lg font-semibold sm:text-xl">Planning something similar?</h2>
              <p className="mt-2 text-xs text-muted-foreground sm:mt-3 sm:text-sm">
                Share your brief and we will send an indicative programme and cost band.
              </p>
              <Action to="/contact" className="mt-5 w-full sm:mt-6">
                Talk to our team
              </Action>
            </div>
          </aside>
        </Container>
      </section>

      {data.related?.length ? (
        <section className="border-t border-border bg-surface py-12 sm:py-16 md:py-24 lg:py-28">
          <Container>
            <SectionHead eyebrow="More work" heading="Related projects" />
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-2 md:grid-cols-3">
              {data.related.map((p: any) => (
                <li key={p.slug}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* ── Responsive Image Lightbox Modal ── */}
      <ImageLightbox
        images={allImages.length ? allImages : gallery}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={project["title"]}
        caption={project["summary"]}
      />
    </SiteShell>
  );
}

