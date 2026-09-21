import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Maximize2 } from "lucide-react";

import { ProjectCard } from "@/components/site/project-card";
import { Action, Container, PageHero, Reveal, SectionHead } from "@/components/site/primitives";
import { SiteShell } from "@/components/site/site-shell";
import { ImageLightbox } from "@/components/site/image-lightbox";
import { asList, asObjects } from "@/lib/format";
import { serviceQuery } from "@/lib/queries";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(serviceQuery(params.slug));
    if (!data.service) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.service) {
      return { meta: [{ title: "Service not found | AMARC" }, { name: "robots", content: "noindex" }] };
    }
    const s = loaderData.service;
    const title = s["seo_title"] || `${s["title"]} | AMARC Services`;
    const description = s["seo_description"] || s["summary"] || "";
    const ogImage = s["hero_image_url"] || "/images/commercial/services-commercial-construction.jpg";
    return buildSeoHead({
      path: `/services/${s["slug"]}`,
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
  component: ServiceDetail,
  notFoundComponent: () => (
    <SiteShell>
      <PageHero eyebrow="404" title="That service page doesn’t exist." />
    </SiteShell>
  ),
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(serviceQuery(slug));
  const service = data.service!;
  const bullets = asList(service["bullets"]);
  const steps = asObjects(service["process_steps"]);
  const faqs = asObjects(service["faqs"]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const heroImage = service["hero_image_url"];

  return (
    <SiteShell>
      <PageHero
        eyebrow="Service"
        title={service["title"]}
        intro={service["summary"]}
        image={heroImage}
      >
        {heroImage && (
          <div className="mt-6 flex items-center">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-semibold text-foreground/85 hover:border-amber hover:text-amber transition shadow-xs"
            >
              <Maximize2 className="h-3.5 w-3.5 text-amber" />
              View Full Photo
            </button>
          </div>
        )}
      </PageHero>

      <section className="bg-background py-10 sm:py-16 md:py-24 lg:py-28">
        <Container className="grid gap-8 md:gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <p className="text-base leading-relaxed text-foreground/85 whitespace-pre-line sm:text-lg md:text-xl">
              {service["description"]}
            </p>
            {steps.length ? (
              <ol className="mt-8 space-y-3 sm:mt-14 sm:space-y-4 md:space-y-px md:border md:border-border md:bg-border">
                {steps.map((step: any, i: number) => (
                  <Reveal as="li" key={step.title ?? i} className="border border-border bg-background p-5 sm:p-7 md:border-0">
                    <span className="label-mono text-xs text-amber sm:text-sm">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-display text-base font-semibold sm:mt-3 sm:text-lg md:text-xl">{step.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground sm:text-sm md:text-base">{step.body}</p>
                  </Reveal>
                ))}
              </ol>
            ) : null}
          </div>

          <aside className="space-y-6 sm:space-y-10">
            {bullets.length ? (
              <div className="border border-border bg-surface p-5 sm:p-7">
                <h2 className="label-mono text-xs text-amber sm:text-sm">What’s included</h2>
                <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                  {bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-xs text-foreground/85 sm:text-sm">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-amber" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="border border-border bg-surface p-5 sm:p-7">
              <h2 className="font-display text-lg font-semibold sm:text-xl">Need this on your project?</h2>
              <p className="mt-2 text-xs text-muted-foreground sm:mt-3 sm:text-sm">
                Send the plot details and a rough brief — we reply within two working days.
              </p>
              <Action to="/contact" className="mt-5 w-full sm:mt-6">
                Request a quote
              </Action>
            </div>
          </aside>
        </Container>
      </section>

      {data.projects.length ? (
        <section className="bg-background py-12 sm:py-16 md:py-24 lg:py-28">
          <Container>
            <SectionHead eyebrow="Related work" heading="Projects using this service" />
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-2 md:grid-cols-3">
              {data.projects.map((p: any) => (
                <li key={p.slug}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {faqs.length ? (
        <section className="border-t border-border bg-surface py-12 sm:py-16 md:py-24 lg:py-28">
          <Container>
            <SectionHead eyebrow="FAQ" heading="Common questions" />
            <div className="mt-8 divide-y divide-border border-y border-border sm:mt-12">
              {faqs.map((faq: any, i: number) => (
                <details key={i} className="group py-4 sm:py-6">
                  <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-6 font-display text-base font-semibold sm:text-lg">
                    {faq.question}
                    <span aria-hidden className="text-amber transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-3xl text-xs text-muted-foreground sm:mt-4 sm:text-sm">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ── Responsive Image Lightbox ── */}
      {heroImage && (
        <ImageLightbox
          images={[heroImage]}
          initialIndex={0}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          title={service["title"]}
          caption={service["summary"]}
        />
      )}
    </SiteShell>
  );
}

