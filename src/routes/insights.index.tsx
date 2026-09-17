import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Container, PageHero, Reveal } from "@/components/site/primitives";
import { ResponsiveImage } from "@/components/site/responsive-image";
import { SiteShell } from "@/components/site/site-shell";
import { longDate } from "@/lib/format";
import { postsQuery } from "@/lib/queries";

export const Route = createFileRoute("/insights/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  head: () => ({
    meta: [
      { title: "Construction Insights & Cost Guides Pakistan | AMARC" },
      {
        name: "description",
        content:
          "Practical notes on construction cost per square foot, approvals, materials and method from AMARC's engineers in Pakistan.",
      },
      { property: "og:title", content: "Construction Insights & Cost Guides | AMARC" },
      {
        property: "og:description",
        content: "Field-tested guidance on building in Pakistan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const { data: posts } = useSuspenseQuery(postsQuery);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Insights"
        title="Notes from the site office."
        intro="Cost benchmarks, regulatory changes and construction method, written by the engineers doing the work."
      />
      <section className="bg-background py-20 md:py-28">
        <Container>
          <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any, i: number) => (
              <Reveal as="li" key={post.slug} delay={(i % 3) * 0.06}>
                <Link
                  to="/insights/$slug"
                  params={{ slug: post.slug }}
                  className="group block h-full border border-border bg-surface transition-colors hover:border-amber/60"
                >
                  {post["cover_image_url"] ? (
                    <div className="aspect-16/9 overflow-hidden">
                      <ResponsiveImage
                        src={post["cover_image_url"]}
                        alt={post["title"]}
                        aspectRatio="16/9"
                        className="h-full w-full"
                        imgClassName="transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : null}
                  <div className="p-6">
                    <p className="label-mono text-muted-foreground">
                      {post.category} · {longDate(post.published_at)}
                      {post.read_minutes ? ` · ${post.read_minutes} min` : ""}
                    </p>
                    <h2 className="mt-3 font-display text-lg leading-snug font-semibold transition-colors group-hover:text-amber">
                      {post.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
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
