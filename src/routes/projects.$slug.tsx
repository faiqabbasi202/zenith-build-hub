import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { Action, Container, PageHero, Reveal, SectionHead, StatusChip } from "@/components/site/primitives";
import { ProjectCard } from "@/components/site/project-card";
import { ResponsiveImage } from "@/components/site/responsive-image";
import { SiteShell } from "@/components/site/site-shell";
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
          {project["progress_percent"] != null && project["status"] === "ongoing" ? (
            <span className="label-mono text-xs text-muted-foreground sm:text-sm">
              {project["progress_percent"]}% complete
            </span>
          ) : null}
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

            {gallery.length ? (
              <div className="mt-8 grid gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-4">
                {gallery.map((src, i) => (
                  <Reveal key={src} delay={(i % 2) * 0.06} className="overflow-hidden border border-border">
                    <ResponsiveImage
                      src={src}
                      alt={`${project["title"]} — view ${i + 1}`}
                      aspectRatio="16/10"
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover"
                    />
                  </Reveal>
                ))}
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
    </SiteShell>
  );
}

