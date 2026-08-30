import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { Container, PageHero, Reveal } from "@/components/site/primitives";
import { ProjectCard } from "@/components/site/project-card";
import { SiteShell } from "@/components/site/site-shell";
import { STATUS_LABEL } from "@/lib/format";
import { projectsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Search = { sector?: string | undefined; status?: string | undefined; city?: string | undefined };

export const Route = createFileRoute("/projects/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    sector: typeof search["sector"] === "string" ? search["sector"] : undefined,
    status: typeof search["status"] === "string" ? search["status"] : undefined,
    city: typeof search["city"] === "string" ? search["city"] : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery),
  head: () => ({
    meta: [
      { title: "Projects Portfolio in Pakistan | AMARC" },
      {
        name: "description",
        content:
          "Browse AMARC's completed and ongoing commercial, residential, industrial, healthcare and infrastructure projects across Lahore, Karachi, Islamabad and beyond.",
      },
      { property: "og:title", content: "Projects Portfolio in Pakistan | AMARC" },
      {
        property: "og:description",
        content: "Filter our portfolio by sector, status and city.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data } = useSuspenseQuery(projectsQuery);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/projects/" });

  const cities = useMemo(
    () => Array.from(new Set(data.projects.map((p: any) => p.city).filter(Boolean))).sort(),
    [data.projects],
  );

  const filtered = data.projects.filter((p: any) => {
    if (search.sector && p.sector_slug !== search.sector) return false;
    if (search.status && p.status !== search.status) return false;
    if (search.city && p.city !== search.city) return false;
    return true;
  });

  const set = (patch: Search) =>
    navigate({ search: ((prev: Search) => ({ ...prev, ...patch })) as never, replace: true });

  return (
    <SiteShell>
      <PageHero
        eyebrow="Portfolio"
        title="Work you can drive past and inspect."
        intro="Filter by sector, delivery status or city. Every listing shows scope, value and completion data."
      />

      <section className="border-b border-border bg-surface py-8">
        <Container className="space-y-5">
          <FilterRow
            label="Sector"
            options={([{ value: undefined, label: "All" }] as { value?: string | undefined; label: string }[]).concat(
              data.sectors.map((s: any) => ({ value: s.slug, label: s.title })),
            )}
            active={search.sector}
            onSelect={(value) => set({ sector: value })}
          />
          <FilterRow
            label="Status"
            options={([{ value: undefined, label: "All" }] as { value?: string | undefined; label: string }[]).concat(
              Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
            )}
            active={search.status}
            onSelect={(value) => set({ status: value })}
          />
          <FilterRow
            label="City"
            options={([{ value: undefined, label: "All" }] as { value?: string | undefined; label: string }[]).concat(
              cities.map((c: any) => ({ value: c, label: c })),
            )}
            active={search.city}
            onSelect={(value) => set({ city: value })}
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <p className="label-mono text-muted-foreground">
            {filtered.length} project{filtered.length === 1 ? "" : "s"}
          </p>
          {filtered.length ? (
            <ul className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project: any, i: number) => (
                <Reveal as="li" key={project.slug} delay={(i % 3) * 0.06}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="mt-10 text-muted-foreground">
              No projects match those filters yet. Try widening your selection.
            </p>
          )}
        </Container>
      </section>
    </SiteShell>
  );
}

function FilterRow({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: { value?: string | undefined; label: string }[];
  active?: string | undefined;
  onSelect: (value?: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <span className="label-mono w-20 shrink-0 text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = (opt.value ?? undefined) === (active ?? undefined);
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                isActive
                  ? "border-amber bg-amber text-primary-foreground"
                  : "border-border text-foreground/75 hover:border-amber hover:text-amber",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
