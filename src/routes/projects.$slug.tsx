import { useState, useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import {
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Eye,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Calendar,
  Building,
} from "lucide-react";

import { Action, Container, PageHero, Reveal, StatusChip } from "@/components/site/primitives";
import { ProjectCard } from "@/components/site/project-card";
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

function hasValue(val: any): boolean {
  if (val == null) return false;
  if (typeof val === "string") {
    const trimmed = val.trim();
    return (
      trimmed !== "" &&
      trimmed !== "—" &&
      trimmed !== "-" &&
      trimmed !== "null" &&
      trimmed !== "undefined" &&
      trimmed !== "0"
    );
  }
  if (typeof val === "number") {
    return !isNaN(val) && val > 0;
  }
  return Boolean(val);
}

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(projectQuery(slug));
  const project = data.project!;
  const scope = asList(project["scope"]);
  const rawGallery = asList(project["gallery"]);

  const coverUrl = project["cover_image_url"] || "";

  // Combine unique photos: cover + gallery items
  const allImages = Array.from(
    new Set([coverUrl, ...rawGallery].filter(Boolean) as string[]),
  );

  // Active showcased photo for inline swapping & shuffling
  const [activePhoto, setActivePhoto] = useState<string>(
    allImages[0] || coverUrl || ""
  );

  useEffect(() => {
    if (allImages.length > 0 && !allImages.includes(activePhoto)) {
      setActivePhoto(allImages[0] || "");
    }
  }, [allImages, activePhoto]);

  // Full Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (src: string) => {
    const idx = allImages.indexOf(src);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  // Picture shuffling / cycling helper
  const handleNextPhoto = () => {
    if (allImages.length <= 1) return;
    const curIdx = allImages.indexOf(activePhoto);
    const nextIdx = (curIdx + 1) % allImages.length;
    setActivePhoto(allImages[nextIdx] || allImages[0] || "");
  };

  const handlePrevPhoto = () => {
    if (allImages.length <= 1) return;
    const curIdx = allImages.indexOf(activePhoto);
    const prevIdx = (curIdx - 1 + allImages.length) % allImages.length;
    setActivePhoto(allImages[prevIdx] || allImages[0] || "");
  };

  // Touch swipe support on phone
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 40) {
      handleNextPhoto();
    } else if (diff < -40) {
      handlePrevPhoto();
    }
    setTouchStartX(null);
  };

  // Self-heal any stale localStorage draft for this project on desktop
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("amarc_store_projects");
        if (raw && raw.includes(slug)) {
          const parsed = JSON.parse(raw);
          let changed = false;
          if (parsed.created) {
            const before = parsed.created.length;
            parsed.created = parsed.created.filter((p: any) => p.slug !== slug);
            if (parsed.created.length !== before) changed = true;
          }
          if (parsed.updated) {
            for (const k of Object.keys(parsed.updated)) {
              if (parsed.updated[k]?.slug === slug) {
                delete parsed.updated[k];
                changed = true;
              }
            }
          }
          if (changed) {
            localStorage.setItem("amarc_store_projects", JSON.stringify(parsed));
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [slug]);

  // Build facts dynamically: ONLY include fields that were ACTUALLY ENTERED
  const factsList: [string, string][] = [];
  if (hasValue(project["client"])) factsList.push(["Client", String(project["client"])]);
  const locArr = [project["location"], project["city"]].filter(hasValue);
  if (locArr.length > 0) factsList.push(["Location", locArr.join(", ")]);
  if (hasValue(project["value_pkr_millions"])) {
    factsList.push(["Contract value", pkr(project["value_pkr_millions"])]);
  }
  if (hasValue(project["covered_area"])) factsList.push(["Covered area", String(project["covered_area"])]);
  if (hasValue(project["plot_area"])) factsList.push(["Plot area", String(project["plot_area"])]);
  if (hasValue(project["storeys"])) factsList.push(["Storeys", String(project["storeys"])]);
  if (hasValue(project["start_date"])) factsList.push(["Start date", longDate(project["start_date"])]);
  if (hasValue(project["completion_date"])) factsList.push(["Completion date", longDate(project["completion_date"])]);
  if (hasValue(project["architect"])) factsList.push(["Architect", String(project["architect"])]);
  if (hasValue(project["certifications"])) factsList.push(["Certifications", String(project["certifications"])]);

  const hasFacts = factsList.length > 0;
  const hasScope = scope.length > 0;

  return (
    <SiteShell>
      {/* ── Page Hero ── */}
      <PageHero
        eyebrow="Project"
        title={project["title"]}
        intro={project["summary"]}
        image={coverUrl}
      >
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:mt-8 sm:gap-3">
          <StatusChip label={statusLabel(project["status"])} />

          {/* Sector Badge */}
          {project["sector_slug"] && (
            <Link
              to="/projects"
              search={{ sector: project["sector_slug"] }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-foreground hover:border-amber hover:text-amber transition shadow-xs"
            >
              Sector: {String(project["sector_slug"]).replace(/-/g, " ")}
            </Link>
          )}

          {/* Service Badge */}
          {project["service_slug"] && (
            <Link
              to="/services/$slug"
              params={{ slug: project["service_slug"] }}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber hover:bg-amber/25 transition shadow-xs"
            >
              Service: {String(project["service_slug"]).replace(/-/g, " ")}
            </Link>
          )}

          {project["progress_percent"] != null && project["status"] === "ongoing" && Number(project["progress_percent"]) > 0 ? (
            <span className="label-mono text-xs font-bold text-amber sm:text-sm">
              {project["progress_percent"]}% complete
            </span>
          ) : null}

          {/* View All Photos Trigger */}
          {allImages.length > 0 && (
            <button
              type="button"
              onClick={() => openLightbox(activePhoto || allImages[0] || "")}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber bg-amber px-4 py-1 text-xs font-extrabold text-slate-950 hover:bg-amber/90 transition shadow-sm"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              View Full Resolution ({allImages.length} {allImages.length === 1 ? "Photo" : "Photos"})
            </button>
          )}
        </div>
      </PageHero>

      {/* ── Main Clean Architectural Showcase Stage ── */}
      {allImages.length > 0 && (
        <section className="border-b border-border bg-background py-6 sm:py-10">
          <Container>
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface/50 p-3 sm:p-5 shadow-sm">
              {/* Showcase Top Control Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-border/70">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Architectural Showcase
                  </span>
                  {allImages.length > 1 && (
                    <span className="rounded-full bg-amber/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber">
                      {allImages.indexOf(activePhoto) + 1} of {allImages.length}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {allImages.length > 1 && (
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:border-amber hover:text-amber transition"
                    >
                      <Shuffle className="h-3.5 w-3.5" />
                      Next Photo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openLightbox(activePhoto)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber hover:text-slate-950 dark:bg-amber dark:text-slate-950 transition shadow-xs"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Full Screen
                  </button>
                </div>
              </div>

              {/* Central Architectural Showcase Stage with Consistent Height & Ambient Glow */}
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative flex h-[340px] xs:h-[400px] sm:h-[480px] md:h-[560px] lg:h-[620px] w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950/5 dark:bg-white/5 my-3 sm:my-4 select-none"
              >
                {/* Subtle ambient blurred background layer: keeps lighting & color consistent across landscape & portrait */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img
                    src={activePhoto}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover blur-3xl opacity-20 dark:opacity-30 scale-110 transition-opacity duration-700"
                  />
                </div>

                {/* Previous Arrow */}
                {allImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevPhoto();
                    }}
                    aria-label="Previous photograph"
                    className="absolute left-2 sm:left-4 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-foreground shadow-lg border border-border hover:bg-amber hover:text-slate-950 transition backdrop-blur-xs active:scale-95"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                )}

                {/* Main Crisp Photo: NO auto-zoom on click! Stays rock-solid inside consistent frame */}
                <div className="relative z-10 flex h-full w-full items-center justify-center p-2 sm:p-4">
                  <img
                    key={activePhoto}
                    src={activePhoto}
                    alt={project["title"]}
                    loading="eager"
                    decoding="async"
                    className="max-h-full max-w-full h-auto w-auto object-contain mx-auto rounded-lg shadow-md transition-all duration-300"
                  />
                </div>

                {/* Next Arrow */}
                {allImages.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextPhoto();
                    }}
                    aria-label="Next photograph"
                    className="absolute right-2 sm:right-4 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-foreground shadow-lg border border-border hover:bg-amber hover:text-slate-950 transition backdrop-blur-xs active:scale-95"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                )}
              </div>

              {/* Bottom Thumbnail Strip for Photo Shuffling / Selection */}
              {allImages.length > 1 && (
                <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pt-3 sm:pt-4 border-t border-border/70 pb-1 scrollbar-none">
                  {allImages.map((src, idx) => (
                    <button
                      key={src + idx}
                      type="button"
                      onClick={() => setActivePhoto(src)}
                      className={`group relative h-16 w-24 sm:h-20 sm:w-32 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                        src === activePhoto
                          ? "border-amber ring-2 ring-amber/40 scale-105 shadow-md"
                          : "border-border/80 opacity-65 hover:opacity-100 hover:border-amber/60"
                      }`}
                    >
                      <img
                        src={src}
                        alt={`Perspective ${idx + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute bottom-1 right-1 rounded-xs bg-slate-950/80 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ── Dynamic Content Layout (Adapts automatically based on entered details) ── */}
      <section className="bg-background py-10 sm:py-16 md:py-24">
        <Container
          className={
            hasFacts
              ? "grid gap-8 md:gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16"
              : "grid gap-8 md:gap-12 lg:grid-cols-[1.8fr_1fr] lg:gap-16"
          }
        >
          {/* Main Content Column */}
          <div className="space-y-8">
            <div>
              <h2 className="label-mono text-xs font-bold text-amber uppercase tracking-wider sm:text-sm">
                Project Overview
              </h2>
              <p className="mt-4 text-base leading-relaxed whitespace-pre-line text-foreground/90 sm:text-lg">
                {project["description"]}
              </p>
            </div>

            {/* Scope of works — only shown if entered */}
            {hasScope && (
              <div className="border-t border-border pt-8">
                <h2 className="label-mono text-xs font-bold text-amber uppercase tracking-wider sm:text-sm">
                  Scope of Works
                </h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                  {scope.map((s) => (
                    <li key={s} className="flex gap-3 text-xs sm:text-sm text-foreground/85">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Side Photos Grid — only shown if more than 1 image exists */}
            {allImages.length > 1 && (
              <div className="border-t border-border pt-8 sm:pt-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                      All Perspectives &amp; Photographs
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {allImages.length} high-resolution photographs available. Tap any photo to inspect full size.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {allImages.map((src, i) => (
                    <Reveal key={src + i} delay={(i % 2) * 0.06} className="overflow-hidden">
                      <div
                        onClick={() => openLightbox(src)}
                        className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-surface shadow-xs transition duration-300 hover:border-amber hover:shadow-lg"
                        title="Click to view full uncropped photo"
                      >
                        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-surface">
                          <img
                            src={src}
                            alt={`${project["title"]} view ${i + 1}`}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                          />
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 flex flex-col justify-between p-3.5 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="self-end rounded-full bg-black/60 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-xs">
                            Perspective {i + 1} of {allImages.length}
                          </span>
                          <span className="inline-flex items-center gap-1.5 self-start rounded-md bg-amber px-3 py-1.5 text-xs font-extrabold text-slate-950 shadow-md">
                            <Maximize2 className="h-3.5 w-3.5" />
                            View Full Resolution
                          </span>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="space-y-6 sm:space-y-8">
            {/* Project Facts — ONLY shown if fields were entered */}
            {hasFacts && (
              <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
                <div className="border-b border-border bg-surface/80 px-4 py-3 sm:px-6">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                    Project Specifications
                  </h3>
                </div>
                <dl className="divide-y divide-border">
                  {factsList.map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3.5">
                      <dt className="label-mono text-[11px] text-muted-foreground font-semibold">{k}</dt>
                      <dd className="text-right text-xs sm:text-sm font-medium text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Direct Consultation Box */}
            <div className="rounded-xl border border-border bg-surface p-5 sm:p-7 shadow-xs">
              <h3 className="font-display text-base sm:text-lg font-bold">Inquire About This Project</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Looking for structural engineering, turnkey contracting, or similar developments? Connect directly with our team.
              </p>
              <Action to="/contact" className="mt-5 w-full">
                Contact Project Team
              </Action>
            </div>
          </aside>
        </Container>
      </section>

      {/* Related Projects */}
      {data.related?.length ? (
        <section className="border-t border-border bg-surface py-12 sm:py-16 md:py-24">
          <Container>
            <div className="mb-8 sm:mb-12 flex items-center justify-between">
              <div>
                <span className="label-mono text-xs font-bold uppercase tracking-wider text-amber">
                  Portfolio
                </span>
                <h2 className="mt-2 font-display text-xl sm:text-2xl md:text-3xl font-bold">
                  Related Projects
                </h2>
              </div>
              <Link
                to="/projects"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber hover:underline"
              >
                View All Projects <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
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
        images={allImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={project["title"]}
        caption={project["summary"]}
      />
    </SiteShell>
  );
}
