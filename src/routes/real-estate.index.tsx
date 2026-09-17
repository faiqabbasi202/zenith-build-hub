import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Container, PageHero, Reveal, StatusChip } from "@/components/site/primitives";
import { SiteShell } from "@/components/site/site-shell";
import { statusLabel } from "@/lib/format";
import { developmentsQuery } from "@/lib/queries";

export const Route = createFileRoute("/real-estate/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(developmentsQuery),
  head: () => ({
    meta: [
      { title: "New Real Estate Developments in Pakistan | AMARC" },
      {
        name: "description",
        content:
          "Newly launched and ongoing AMARC residential and commercial developments in Lahore, Karachi and Islamabad — floor plans, amenities and payment plans.",
      },
      { property: "og:title", content: "New Real Estate Developments in Pakistan | AMARC" },
      {
        property: "og:description",
        content: "Apartments, offices and gated communities built and sold by AMARC.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DevelopmentsPage,
});

function DevelopmentsPage() {
  const { data: developments } = useSuspenseQuery(developmentsQuery);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Real estate"
        title="Developments we design, build and stand behind."
        intro="Own-account projects where AMARC is developer and contractor — so quality and handover dates sit with one company."
      />
      <section className="bg-background py-20 md:py-28">
        <Container>
          <ul className="space-y-16">
            {developments.map((dev: any, i: number) => (
              <Reveal as="li" key={dev.slug} delay={i * 0.05}>
                <Link
                  to="/real-estate/$slug"
                  params={{ slug: dev.slug }}
                  className="group grid gap-8 border border-border bg-surface transition-colors hover:border-amber/60 lg:grid-cols-2"
                >
                  <div className="relative aspect-16/10 overflow-hidden">
                    {dev.cover_image_url ? (
                      <img
                        src={dev.cover_image_url}
                        alt={dev.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col justify-center p-8 lg:p-12">
                    <StatusChip label={statusLabel(dev.status)} />
                    <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight transition-colors group-hover:text-amber">
                      {dev.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {[dev.location, dev.city].filter(Boolean).join(", ")}
                    </p>
                    <p className="mt-5 text-base text-foreground/80">{dev.summary}</p>
                    <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
                      {[
                        ["From", dev.starting_price],
                        ["Storeys", dev.storeys],
                        ["Handover", dev.handover],
                      ]
                        .filter(([, v]) => Boolean(v))
                        .map(([k, v]) => (
                          <div key={k as string}>
                            <dt className="label-mono text-muted-foreground">{k}</dt>
                            <dd className="mt-1 text-sm font-semibold">{v as string}</dd>
                          </div>
                        ))}
                    </dl>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>
    </SiteShell>
  );
}
