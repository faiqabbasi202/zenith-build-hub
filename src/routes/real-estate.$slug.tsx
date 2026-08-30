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
import { SiteShell } from "@/components/site/site-shell";
import { asList, asObjects, statusLabel } from "@/lib/format";
import { developmentQuery } from "@/lib/queries";

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
    const title = d.seo_title ?? `${d.title} | AMARC Developments`;
    const description = d.seo_description ?? d.summary ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
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
  const amenities = asList(dev.amenities);
  const highlights = asList(dev.highlights);
  const gallery = asList(dev.gallery);
  const unitTypes = asObjects(dev.unit_types);
  const plan = asObjects(dev.payment_plan);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Development"
        title={dev.title}
        intro={dev.summary}
        image={dev.cover_image_url}
      >
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <StatusChip label={statusLabel(dev.status)} />
          {dev.starting_price ? (
            <span className="label-mono text-amber">From {dev.starting_price}</span>
          ) : null}
          {dev.handover ? (
            <span className="label-mono text-muted-foreground">Handover {dev.handover}</span>
          ) : null}
        </div>
      </PageHero>

      <section className="py-20 md:py-28">
        <Container className="grid gap-16 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-lg leading-relaxed whitespace-pre-line text-foreground/85">
              {dev.description}
            </p>

            {highlights.length ? (
              <ul className="mt-12 grid gap-3 sm:grid-cols-2">
                {highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-sm text-foreground/85">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-amber" />
                    {h}
                  </li>
                ))}
              </ul>
            ) : null}

            {unitTypes.length ? (
              <div className="mt-14 overflow-x-auto border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface">
                    <tr>
                      {["Unit", "Area", "Price"].map((h) => (
                        <th key={h} className="label-mono px-5 py-4 text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {unitTypes.map((u: any, i: number) => (
                      <tr key={i}>
                        <td className="px-5 py-4 font-medium">{u.type ?? u.name}</td>
                        <td className="px-5 py-4 text-muted-foreground">{u.area}</td>
                        <td className="px-5 py-4 text-amber">{u.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {gallery.length ? (
              <div className="mt-14 grid gap-4 sm:grid-cols-2">
                {gallery.map((src, i) => (
                  <Reveal key={src} delay={(i % 2) * 0.06} className="overflow-hidden border border-border">
                    <img
                      src={src}
                      alt={`${dev.title} — view ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </Reveal>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="space-y-10">
            {amenities.length ? (
              <div className="border border-border bg-surface p-7">
                <h2 className="label-mono text-amber">Amenities</h2>
                <ul className="mt-5 space-y-3">
                  {amenities.map((a) => (
                    <li key={a} className="text-sm text-foreground/85">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {plan.length ? (
              <div className="border border-border bg-surface p-7">
                <h2 className="label-mono text-amber">Payment plan</h2>
                <dl className="mt-5 divide-y divide-border">
                  {plan.map((row: any, i: number) => (
                    <div key={i} className="flex justify-between gap-4 py-3">
                      <dt className="text-sm text-muted-foreground">{row.stage ?? row.label}</dt>
                      <dd className="text-sm font-semibold">{row.amount ?? row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            <div className="border border-border bg-surface p-7">
              <h2 className="font-display text-xl font-semibold">Book a site visit</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Our sales team will walk you through floor plans and availability.
              </p>
              <Action to="/contact" className="mt-6 w-full">
                Enquire now
              </Action>
              {dev.brochure_url ? (
                <Action href={dev.brochure_url} variant="outline" className="mt-3 w-full">
                  Download brochure
                </Action>
              ) : null}
            </div>
          </aside>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-16">
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
