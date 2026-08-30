import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Container, PageHero, SectionHead } from "@/components/site/primitives";
import { SiteShell } from "@/components/site/site-shell";
import { longDate } from "@/lib/format";
import { postQuery } from "@/lib/queries";

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
    const title = p["seo_title"] ?? `${p["title"]} | AMARC Insights`;
    const description = p["seo_description"] ?? p["excerpt"] ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
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
      <article className="py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="label-mono text-muted-foreground">
              By {post["author"] ?? "AMARC"}
              {post["read_minutes"] ? ` · ${post["read_minutes"]} min read` : ""}
            </p>
            <div className="mt-10 space-y-6 text-base leading-relaxed whitespace-pre-line text-foreground/85">
              {post["body"]}
            </div>
          </div>
        </Container>
      </article>

      {data.more.length ? (
        <section className="border-t border-border bg-surface py-20">
          <Container>
            <SectionHead eyebrow="Keep reading" heading="More insights" />
            <ul className="mt-12 grid gap-8 md:grid-cols-3">
              {data.more.map((p: any) => (
                <li key={p.slug}>
                  <Link
                    to="/insights/$slug"
                    params={{ slug: p.slug }}
                    className="group block h-full border border-border bg-background p-6 transition-colors hover:border-amber/60"
                  >
                    <p className="label-mono text-muted-foreground">
                      {p.category} · {longDate(p.published_at)}
                    </p>
                    <h3 className="mt-3 font-display text-lg font-semibold group-hover:text-amber">
                      {p.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
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
