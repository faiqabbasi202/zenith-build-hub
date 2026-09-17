import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Container, PageHero, Reveal } from "@/components/site/primitives";
import { SiteShell } from "@/components/site/site-shell";
import { servicesQuery } from "@/lib/queries";

export const Route = createFileRoute("/services/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  head: () => ({
    meta: [
      { title: "Construction & Engineering Services | AMARC" },
      {
        name: "description",
        content:
          "Design-build, structural engineering, MEP, project management, interior fit-out and infrastructure services delivered across Pakistan by AMARC.",
      },
      { property: "og:title", content: "Construction & Engineering Services | AMARC" },
      {
        property: "og:description",
        content: "Nine in-house disciplines covering the full project lifecycle in Pakistan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);

  return (
    <SiteShell>
      <PageHero
        eyebrow="What we do"
        title="Every discipline your project needs, under one contract."
        intro="We self-perform design, engineering and construction so accountability never gets split between consultants."
      />
      <section className="bg-background py-20 md:py-28">
        <Container>
          <ul className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {services.map((service: any, i: number) => (
              <Reveal as="li" key={service.slug} delay={(i % 3) * 0.06} className="bg-background">
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className="group flex h-full flex-col p-8 transition-colors hover:bg-surface"
                >
                  <span className="label-mono text-amber">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="mt-5 font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-amber">
                    {service.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{service.summary}</p>
                  <span className="label-mono mt-6 text-foreground/60 group-hover:text-amber">
                    Explore →
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>
    </SiteShell>
  );
}
