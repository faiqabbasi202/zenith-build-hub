import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Container, PageHero, Reveal } from "@/components/site/primitives";
import { ResponsiveImage } from "@/components/site/responsive-image";
import { SiteShell } from "@/components/site/site-shell";
import { pageSeoQuery, servicesQuery } from "@/lib/queries";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/services/")({
  loader: async ({ context }) => {
    const [services, seo] = await Promise.all([
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(pageSeoQuery("/services")),
    ]);
    return { services, seo };
  },
  head: ({ loaderData }) => ({
    meta: buildSeoMeta({
      path: "/services",
      seo: loaderData?.seo,
    }),
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
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service: any, i: number) => (
              <Reveal as="li" key={service.slug} delay={(i % 3) * 0.06}>
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className="group relative flex h-[28rem] min-h-[22rem] flex-col justify-end overflow-hidden border border-border bg-surface transition-colors md:hover:border-amber/60"
                >
                  {service.hero_image_url ? (
                    <>
                      <ResponsiveImage
                        src={service.hero_image_url}
                        alt={service.title}
                        className="absolute inset-0 h-full w-full"
                        imgClassName="h-full w-full object-cover transition-transform duration-700 md:group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
                    </>
                  ) : null}
                  
                  <div className="relative z-10 p-8">
                    <span className="label-mono text-amber">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground transition-colors md:group-hover:text-amber">
                      {service.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{service.summary}</p>
                    <span className="label-mono mt-6 block text-foreground/60 transition-colors md:group-hover:text-amber">
                      Explore →
                    </span>
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
