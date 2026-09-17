import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { Action, Container, PageHero, Reveal, SectionHead, StatusChip } from "@/components/site/primitives";
import { ProjectCard } from "@/components/site/project-card";
import { SiteShell } from "@/components/site/site-shell";
import { asList, longDate, pkr, statusLabel } from "@/lib/format";
import { projectQuery } from "@/lib/queries";

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
    const title = p["seo_title"] ?? `${p["title"]} | AMARC Projects`;
    const description = p["seo_description"] ?? p["summary"] ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
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
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <StatusChip label={statusLabel(project["status"])} />
          {project["progress_percent"] != null && project["status"] === "ongoing" ? (
            <span className="label-mono text-muted-foreground">
              {project["progress_percent"]}% complete
            </span>
          ) : null}
        </div>
      </PageHero>

      <section className="bg-background py-20 md:py-28">
        <Container className="grid gap-16 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-lg leading-relaxed whitespace-pre-line text-foreground/85">
              {project["description"]}
            </p>

            {scope.length ? (
              <div className="mt-12">
                <h2 className="label-mono text-amber">Scope of works</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {scope.map((s) => (
                    <li key={s} className="flex gap-3 text-sm text-foreground/85">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-amber" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {gallery.length ? (
              <div className="mt-14 grid gap-4 sm:grid-cols-2">
                {gallery.map((src, i) => (
                  <Reveal key={src} delay={(i % 2) * 0.06} className="overflow-hidden border border-border">
                    <img
                      src={src}
                      alt={`${project["title"]} — view ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </Reveal>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="space-y-10">
            <dl className="divide-y divide-border border border-border bg-surface">
              {facts.map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-6 px-6 py-4">
                  <dt className="label-mono text-muted-foreground">{k}</dt>
                  <dd className="text-right text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="border border-border bg-surface p-7">
              <h2 className="font-display text-xl font-semibold">Planning something similar?</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Share your brief and we will send an indicative programme and cost band.
              </p>
              <Action to="/contact" className="mt-6 w-full">
                Talk to our team
              </Action>
            </div>
          </aside>
        </Container>
      </section>

      {data.related?.length ? (
        <section className="border-t border-border bg-surface py-20 md:py-28">
          <Container>
            <SectionHead eyebrow="More work" heading="Related projects" />
            <ul className="mt-12 grid gap-8 md:grid-cols-3">
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
