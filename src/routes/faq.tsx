import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Container, PageHero } from "@/components/site/primitives";
import { SiteShell } from "@/components/site/site-shell";
import { faqsQuery, pageSeoQuery } from "@/lib/queries";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  loader: async ({ context }) => {
    const [faqs, seo] = await Promise.all([
      context.queryClient.ensureQueryData(faqsQuery),
      context.queryClient.ensureQueryData(pageSeoQuery("/faq")),
    ]);
    return { faqs, seo };
  },
  head: ({ loaderData }) =>
    buildSeoHead({
      path: "/faq",
      seo: loaderData?.seo,
    }),
  component: FaqPage,
});

function FaqPage() {
  const { data: faqs } = useSuspenseQuery(faqsQuery);
  const grouped = faqs.reduce<Record<string, any[]>>((acc, f: any) => {
    const key = f.category ?? "General";
    (acc[key] ??= []).push(f);
    return acc;
  }, {});

  return (
    <SiteShell>
      <PageHero
        eyebrow="FAQ"
        title="Straight answers before you sign anything."
        intro="Cost, timelines, approvals and payment structures — the questions every client asks us first."
      />
      <section className="bg-background py-20 md:py-28">
        <Container className="space-y-16">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="label-mono text-amber">{category}</h2>
              <div className="mt-6 divide-y divide-border border-y border-border">
                {items.map((faq: any) => (
                  <details key={faq.id} className="group py-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-semibold">
                      {faq.question}
                      <span aria-hidden className="text-amber transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>
    </SiteShell>
  );
}
