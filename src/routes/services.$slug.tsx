import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { ProjectCard } from "@/components/site/project-card";
import { Action, Container, PageHero, Reveal, SectionHead } from "@/components/site/primitives";
import { SiteShell } from "@/components/site/site-shell";
import { asList, asObjects } from "@/lib/format";
import { serviceQuery } from "@/lib/queries";

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
    const title = s.seo_title ?? `${s.title} | AMARC`;
    const description = s.seo_description ?? s.summary ?? "";
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
  const bullets = asList(service.bullets);
  const steps = asObjects(service.process_steps);
  const faqs = asObjects(service.faqs);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Service"
        title={service.title}
        intro={service.summary}
        image={service.hero_image_url}
      />

      <section className="py-20 md:py-28">
        <Container className="grid gap-16 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="text-lg leading-relaxed text-foreground/85 whitespace-pre-line">
              {service.description}
            </p>
            {steps.length ? (
              <ol className="mt-14 space-y-px border border-border bg-border">
                {steps.map((step: any, i: number) => (
                  <Reveal as="li" key={step.title ?? i} className="bg-background p-7">
                    <span className="label-mono text-amber">
                      Step {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                  </Reveal>
                ))}
              </ol>
            ) : null}
          </div>

          <aside className="space-y-10">
            {bullets.length ? (
              <div className="border border-border bg-surface p-7">
                <h2 className="label-mono text-amber">What’s included</h2>
                <ul className="mt-5 space-y-3">
                  {bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-sm text-foreground/85">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-amber" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="border border-border bg-surface p-7">
              <h2 className="font-display text-xl font-semibold">Need this on your project?</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Send the plot details and a rough brief — we reply within two working days.
              </p>
              <Action to="/contact" className="mt-6 w-full">
                Request a quote
              </Action>
            </div>
          </aside>
        </Container>
      </section>

      {faqs.length ? (
        <section className="border-t border-border bg-surface py-20 md:py-28">
          <Container>
            <SectionHead eyebrow="FAQ" heading="Common questions" />
            <div className="mt-12 divide-y divide-border border-y border-border">
              {faqs.map((faq: any, i: number) => (
                <details key={i} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-semibold">
                    {faq.question}
                    <span aria-hidden className="text-amber transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {data.projects.length ? (
        <section className="py-20 md:py-28">
          <Container>
            <SectionHead eyebrow="Related work" heading="Projects using this service" />
            <ul className="mt-12 grid gap-8 md:grid-cols-3">
              {data.projects.map((p: any) => (
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
