import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { Container, PageHero, Reveal } from "@/components/site/primitives";
import { SiteShell } from "@/components/site/site-shell";
import { downloadsQuery, pageSeoQuery } from "@/lib/queries";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/downloads")({
  loader: async ({ context }) => {
    const [downloads, seo] = await Promise.all([
      context.queryClient.ensureQueryData(downloadsQuery),
      context.queryClient.ensureQueryData(pageSeoQuery("/downloads")),
    ]);
    return { downloads, seo };
  },
  head: ({ loaderData }) =>
    buildSeoHead({
      path: "/downloads",
      seo: loaderData?.seo,
    }),
  component: DownloadsPage,
});

function DownloadsPage() {
  const { data: downloads } = useSuspenseQuery(downloadsQuery);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Documents"
        title="Company profile, certificates and brochures."
        intro="Everything a client or consultant needs for pre-qualification, in one place."
      />
      <section className="bg-background py-20 md:py-28">
        <Container>
          <ul className="grid gap-px border border-border bg-border sm:grid-cols-2">
            {downloads.map((d: any, i: number) => (
              <Reveal as="li" key={d.id} delay={(i % 2) * 0.06} className="bg-background">
                <a
                  href={d.file_url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-full items-start justify-between gap-6 p-8 transition-colors hover:bg-surface"
                >
                  <div>
                    <p className="label-mono text-amber">{d.category ?? "Document"}</p>
                    <h2 className="mt-3 font-display text-lg font-semibold group-hover:text-amber">
                      {d.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
                    {d.file_size ? (
                      <p className="label-mono mt-4 text-muted-foreground">{d.file_size}</p>
                    ) : null}
                  </div>
                  <Download className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-amber" aria-hidden />
                </a>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>
    </SiteShell>
  );
}
