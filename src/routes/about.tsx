import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Container, PageHero, Reveal, SectionHead } from "@/components/site/primitives";
import { SiteShell } from "@/components/site/site-shell";
import { aboutQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(aboutQuery),
  head: () => ({
    meta: [
      { title: "About AMARC | Engineering & Construction Company in Lahore" },
      {
        name: "description",
        content:
          "AMARC Engineering & Construction has delivered projects across Pakistan since 2004. Meet the leadership, milestones, certifications and clients behind the company.",
      },
      { property: "og:title", content: "About AMARC | Engineering & Construction Company" },
      {
        property: "og:description",
        content: "Leadership, history, certifications and clients of AMARC in Pakistan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data } = useSuspenseQuery(aboutQuery);
  const s = data.settings;

  return (
    <SiteShell>
      <PageHero
        eyebrow="About us"
        title={s?["company_full_name"] ?? "AMARC Engineering & Construction Company"}
        intro={s?["tagline"] ?? undefined}
      />

      <section className="py-20 md:py-28">
        <Container>
          <SectionHead
            eyebrow="Our history"
            heading="Two decades on Pakistani sites."
            subheading="From a single civil works contractor to a multi-disciplinary engineering firm with three regional offices."
          />
          <ol className="mt-14 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {data.milestones.map((m: any, i: number) => (
              <Reveal as="li" key={m.id} delay={(i % 3) * 0.06} className="bg-background p-8">
                <p className="font-display text-3xl font-bold text-amber">{m.year}</p>
                <h3 className="mt-4 font-display text-lg font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-20 md:py-28">
        <Container>
          <SectionHead eyebrow="Leadership" heading="The people accountable for delivery." />
          <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.team.map((member: any, i: number) => (
              <Reveal
                as="li"
                key={member.id}
                delay={(i % 3) * 0.06}
                className="border border-border bg-background"
              >
                {member.photo_url ? (
                  <div className="aspect-4/5 overflow-hidden">
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold">{member.name}</h3>
                  <p className="label-mono mt-1 text-amber">{member.role}</p>
                  {member.credentials ? (
                    <p className="mt-1 text-xs text-muted-foreground">{member.credentials}</p>
                  ) : null}
                  <p className="mt-4 text-sm text-muted-foreground">{member.bio}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container className="grid gap-16 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Compliance" heading="Certifications & registrations" />
            <ul className="mt-10 divide-y divide-border border-y border-border">
              {data.certifications.map((c: any) => (
                <li key={c.id} className="flex items-start justify-between gap-6 py-5">
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.issuer}</p>
                  </div>
                  <span className="label-mono text-amber">{c.issued_year ?? ""}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHead eyebrow="Recognition" heading="Awards" />
            <ul className="mt-10 divide-y divide-border border-y border-border">
              {data.awards.map((a: any) => (
                <li key={a.id} className="flex items-start justify-between gap-6 py-5">
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.issuer}</p>
                  </div>
                  <span className="label-mono text-amber">{a.year ?? ""}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
