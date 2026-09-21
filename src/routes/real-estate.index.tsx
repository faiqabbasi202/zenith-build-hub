import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Container, PageHero, Reveal, StatusChip } from "@/components/site/primitives";
import { ResponsiveImage } from "@/components/site/responsive-image";
import { SiteShell } from "@/components/site/site-shell";
import { statusLabel } from "@/lib/format";
import { developmentsQuery, pageSeoQuery } from "@/lib/queries";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/real-estate/")({
  loader: async ({ context }) => {
    const [developments, seo] = await Promise.all([
      context.queryClient.ensureQueryData(developmentsQuery),
      context.queryClient.ensureQueryData(pageSeoQuery("/real-estate")),
    ]);
    return { developments, seo };
  },
  head: ({ loaderData }) =>
    buildSeoHead({
      path: "/real-estate",
      seo: loaderData?.seo,
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
                  className="group grid min-h-[20rem] gap-8 border border-border bg-surface transition-colors md:hover:border-amber/60 lg:grid-cols-2"
                >
                  <div className="relative aspect-16/10 overflow-hidden">
                    {dev.cover_image_url ? (
                      <ResponsiveImage
                        src={dev.cover_image_url}
                        alt={dev.title}
                        aspectRatio="16/10"
                        className="h-full w-full"
                        imgClassName="transition-transform duration-700 md:group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col justify-center p-8 lg:p-12">
                    <StatusChip label={statusLabel(dev.status)} />
                    <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight transition-colors md:group-hover:text-amber">
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
