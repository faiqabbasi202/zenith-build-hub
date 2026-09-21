import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import {
  Action,
  Container,
  PageHero,
  Reveal,
  SectionHead,
  StatusChip,
} from "@/components/site/primitives";
import { ResponsiveImage } from "@/components/site/responsive-image";
import { SiteShell } from "@/components/site/site-shell";
import { asList, asObjects, statusLabel } from "@/lib/format";
import { developmentQuery } from "@/lib/queries";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/real-estate/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(developmentQuery(params.slug));
    if (!data.development) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.development) {
      return {
        meta: [{ title: "Development not found | AMARC" }, { name: "robots", content: "noindex" }],
      };
    }
    const d = loaderData.development;
    const title = d["seo_title"] || `${d["title"]} | AMARC Developments`;
    const description = d["seo_description"] || d["summary"] || "";
    const ogImage = d["cover_image_url"] || "/images/real-estate/real-estate-development-dusk-render.jpg";
    return buildSeoHead({
      path: `/real-estate/${d["slug"]}`,
      seo: {
        title,
        description,
        og_image_url: ogImage,
      },
      fallbackTitle: title,
      fallbackDescription: description,
      fallbackOgImage: ogImage,
      type: "website",
    });
  },
  component: DevelopmentDetail,
  notFoundComponent: () => (
    <SiteShell>
      <PageHero eyebrow="404" title="That development doesn’t exist." />
    </SiteShell>
  ),
});

function DevelopmentDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(developmentQuery(slug));
  const dev = data.development!;
  const amenities = asList(dev["amenities"]);
  const highlights = asList(dev["highlights"]);
  const gallery = asList(dev["gallery"]);
  const unitTypes = asObjects(dev["unit_types"]);
  const plan = asObjects(dev["payment_plan"]);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Development"
        title={dev["title"]}
        intro={dev["summary"]}
        image={dev["cover_image_url"]}
      >
        <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-8 sm:gap-4">
          <StatusChip label={statusLabel(dev["status"])} />
          {dev["starting_price"] ? (
            <span className="label-mono text-xs text-amber sm:text-sm">From {dev["starting_price"]}</span>
          ) : null}
          {dev["handover"] ? (
            <span className="label-mono text-xs text-muted-foreground sm:text-sm">Handover {dev["handover"]}</span>
          ) : null}
        </div>
      </PageHero>

      <section className="bg-background py-10 sm:py-16 md:py-24 lg:py-28">
        <Container className="grid gap-8 md:gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <p className="text-base leading-relaxed whitespace-pre-line text-foreground/85 sm:text-lg md:text-xl">
              {dev["description"]}
            </p>

            {highlights.length ? (
              <ul className="mt-8 grid gap-2.5 sm:mt-12 sm:grid-cols-2 sm:gap-3">
                {highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-xs text-foreground/85 sm:text-sm md:text-base">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-amber" />
                    {h}
                  </li>
                ))}
              </ul>
            ) : null}

            {unitTypes.length ? (
              <div className="mt-8 overflow-x-auto rounded-sm border border-border sm:mt-14">
                <table className="w-full min-w-[320px] text-left text-xs sm:text-sm">
                  <thead className="bg-surface">
                    <tr>
                      {["Unit", "Area", "Price"].map((h) => (
                        <th key={h} className="label-mono px-3.5 py-3 text-[10px] text-muted-foreground sm:px-5 sm:py-4 sm:text-xs">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {unitTypes.map((u: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3.5 py-3 font-medium sm:px-5 sm:py-4">{u.type ?? u.name}</td>
                        <td className="px-3.5 py-3 text-muted-foreground sm:px-5 sm:py-4">{u.area}</td>
                        <td className="px-3.5 py-3 font-medium text-amber sm:px-5 sm:py-4">{u.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {gallery.length ? (
              <div className="mt-8 grid gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-4">
                {gallery.map((src, i) => (
                  <Reveal key={src} delay={(i % 2) * 0.06} className="overflow-hidden border border-border">
                    <ResponsiveImage
                      src={src}
                      alt={`${dev["title"]} — view ${i + 1}`}
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
            {amenities.length ? (
              <div className="border border-border bg-surface p-5 sm:p-7">
                <h2 className="label-mono text-xs text-amber sm:text-sm">Amenities</h2>
                <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                  {amenities.map((a) => (
                    <li key={a} className="text-xs text-foreground/85 sm:text-sm">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {plan.length ? (
              <div className="border border-border bg-surface p-5 sm:p-7">
                <h2 className="label-mono text-xs text-amber sm:text-sm">Payment plan</h2>
                <dl className="mt-4 divide-y divide-border sm:mt-5">
                  {plan.map((row: any, i: number) => (
                    <div key={i} className="flex justify-between gap-4 py-2.5 sm:py-3">
                      <dt className="text-xs text-muted-foreground sm:text-sm">{row.stage ?? row.label}</dt>
                      <dd className="text-xs font-semibold sm:text-sm">{row.amount ?? row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <div className="border border-border bg-surface p-5 sm:p-7">
              <h2 className="font-display text-lg font-semibold sm:text-xl">Book a site visit</h2>
              <p className="mt-2 text-xs text-muted-foreground sm:mt-3 sm:text-sm">
                Our sales team will walk you through floor plans and availability.
              </p>
              <Action to="/contact" className="mt-5 w-full sm:mt-6">
                Enquire now
              </Action>
              {dev["brochure_url"] ? (
                <Action href={dev["brochure_url"]} variant="outline" className="mt-3 w-full">
                  Download brochure
                </Action>
              ) : null}
            </div>
          </aside>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-12 sm:py-16">
        <Container>
          <SectionHead
            eyebrow="Next step"
            heading="Talk to the team that builds it."
            subheading="Same company designs, constructs and hands over — no coordination gaps."
            align="center"
          />
        </Container>
      </section>
    </SiteShell>
  );
}

