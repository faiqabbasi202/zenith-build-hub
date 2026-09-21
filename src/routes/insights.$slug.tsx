import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Container, PageHero, SectionHead } from "@/components/site/primitives";
import { SiteShell } from "@/components/site/site-shell";
import { longDate } from "@/lib/format";
import { postQuery } from "@/lib/queries";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/insights/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!data.post) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return { meta: [{ title: "Article not found | AMARC" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.post;
    const title = p["seo_title"] || `${p["title"]} | AMARC Insights`;
    const description = p["seo_description"] || p["excerpt"] || "";
    const ogImage = p["cover_image_url"] || "/images/commercial/services-infrastructure.jpg";
    return buildSeoHead({
      path: `/insights/${p["slug"]}`,
      seo: {
        title,
        description,
        og_image_url: ogImage,
      },
      fallbackTitle: title,
      fallbackDescription: description,
      fallbackOgImage: ogImage,
      type: "article",
      publishedTime: p["published_at"],
      author: p["author"] || "AMARC",
    });
  },
  component: PostDetail,
  notFoundComponent: () => (
    <SiteShell>
      <PageHero eyebrow="404" title="That article doesn’t exist." />
    </SiteShell>
  ),
});

function PostDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  const post = data.post!;

  return (
    <SiteShell>
      <PageHero
        eyebrow={`${post["category"] ?? "Insight"} · ${longDate(post["published_at"])}`}
        title={post["title"]}
        intro={post["excerpt"]}
        image={post["cover_image_url"]}
      />
      <article className="bg-background py-10 sm:py-16 md:py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="label-mono text-xs text-muted-foreground sm:text-sm">
              By {post["author"] ?? "AMARC"}
              {post["read_minutes"] ? ` · ${post["read_minutes"]} min read` : ""}
            </p>
            <div className="mt-6 space-y-5 text-sm leading-relaxed whitespace-pre-line text-foreground/85 sm:mt-10 sm:space-y-6 sm:text-base sm:leading-loose md:text-lg">
              {post["body"]}
            </div>
          </div>
        </Container>
      </article>

      {data.more.length ? (
        <section className="border-t border-border bg-surface py-12 sm:py-16 md:py-20">
          <Container>
            <SectionHead eyebrow="Keep reading" heading="More insights" />
            <ul className="mt-8 grid grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-2 md:grid-cols-3">
              {data.more.map((p: any) => (
                <li key={p.slug}>
                  <Link
                    to="/insights/$slug"
                    params={{ slug: p.slug }}
                    className="group flex h-full min-h-[16rem] flex-col justify-between border border-border bg-background p-5 transition-colors sm:min-h-[18rem] sm:p-6 md:hover:border-amber/60"
                  >
                    <div>
                      <p className="label-mono text-[10px] text-muted-foreground sm:text-xs">
                        {p.category} · {longDate(p.published_at)}
                      </p>
                      <h3 className="mt-2.5 font-display text-base font-semibold transition-colors sm:mt-3 sm:text-lg md:group-hover:text-amber">
                        {p.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-xs text-muted-foreground sm:mt-3 sm:text-sm">{p.excerpt}</p>
                    </div>
                    <span className="label-mono mt-4 block text-xs text-amber opacity-0 transition-opacity md:group-hover:opacity-100">
                      Read article →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </SiteShell>
  );
}

