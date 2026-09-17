import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import {
  Action,
  Container,
  Counter,
  Eyebrow,
  Reveal,
  SectionHead,
  StatusChip,
} from "@/components/site/primitives";
import { ProjectCard } from "@/components/site/project-card";
import { ResponsiveImage } from "@/components/site/responsive-image";
import { SiteShell } from "@/components/site/site-shell";
import { asObjects, longDate, pkr, statusLabel } from "@/lib/format";
import { homeQuery, siteSettingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(homeQuery),
      context.queryClient.ensureQueryData(siteSettingsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "AMARC Engineering & Construction | Builders in Pakistan" },
      {
        name: "description",
        content:
          "AMARC is a Lahore-based engineering and construction company delivering turnkey commercial, residential, industrial and infrastructure projects across Pakistan since 2004.",
      },
      {
        property: "og:title",
        content: "AMARC Engineering & Construction | Builders in Pakistan",
      },
      {
        property: "og:description",
        content:
          "Turnkey design, engineering and construction across Punjab and Sindh — 184 projects delivered, PEC C-A licensed, ISO 9001 certified.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

type Row = Record<string, any>;

function HomePage() {
  const { data } = useSuspenseQuery(homeQuery);
  const sections = Object.fromEntries(
    (data.sections as Row[]).map((s) => [s["key"], s]),
  ) as Record<string, Row | undefined>;

  return (
    <SiteShell>
      <Hero section={sections["hero"]} />
      <Credibility section={sections["credibility"]} />
      <Stats section={sections["stats"]} />
      <Services section={sections["services"]} services={data.services} />
      <Sectors section={sections["sectors"]} sectors={data.sectors} />
      <FeaturedProjects section={sections["projects"]} projects={data.projects} />
      <Process section={sections["process"]} />
      <Developments section={sections["developments"]} developments={data.developments} />
      <Clients section={sections["clients"]} clients={data.clients} />
      <Certifications section={sections["certifications"]} items={data.certifications} />
      <Testimonials section={sections["testimonials"]} items={data.testimonials} />
      <Insights section={sections["insights"]} posts={data.posts} />
      <ClosingCta section={sections["cta"]} />
    </SiteShell>
  );
}

/* ---------------------------------- hero --------------------------------- */

function Hero({ section }: { section?: Row | undefined }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  if (!section) return null;
  const secondaryLabel = section["extra"]?.secondary_label as string | undefined;
  const secondaryHref = section["extra"]?.secondary_href as string | undefined;

  return (
    <section ref={ref} className="relative isolate min-h-[92svh] overflow-hidden">
      <motion.div style={reduce ? {} : { y }} className="absolute inset-0 -z-10">
        <ResponsiveImage
          desktopSrc={section["media_url"] || "/images/hero/homepage-hero-desktop.jpg"}
          mobileSrc={section["poster_url"] || "/images/hero/homepage-hero---mobile.jpg"}
          alt={section["heading"] ?? "AMARC Engineering & Construction"}
          eager={true}
          className="h-full w-full"
          imgClassName="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
      </motion.div>
      <div aria-hidden className="grain absolute inset-0 -z-10" />

      <Container className="flex min-h-[92svh] flex-col justify-end pt-32 pb-16 md:pb-24">
        <motion.div style={reduce ? {} : { opacity: fade }} className="max-w-4xl">
          <Reveal>
            <Eyebrow>{section["eyebrow"]}</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] font-bold tracking-tight text-balance">
              {section["heading"]}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg text-foreground/80 sm:text-xl">
              {section["subheading"]}
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground">{section["body"]}</p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap gap-3">
              {section["cta_label"] ? (
                <Action href={section["cta_href"] ?? "/contact"}>{section["cta_label"]}</Action>
              ) : null}
              {secondaryLabel ? (
                <Action href={secondaryHref ?? "/projects"} variant="outline">
                  {secondaryLabel}
                </Action>
              ) : null}
            </div>
          </Reveal>
        </motion.div>
      </Container>

      <div className="pointer-events-none absolute right-6 bottom-8 hidden lg:block">
        <span className="label-mono text-muted-foreground [writing-mode:vertical-rl]">
          Scroll to explore
        </span>
      </div>
    </section>
  );
}

/* ------------------------------- credibility ------------------------------ */

function Credibility({ section }: { section?: Row | undefined }) {
  const items = asObjects(section?.["extra"]?.items);
  if (!items.length) return null;
  return (
    <section className="border-y border-border bg-surface">
      <Container className="grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
        {items.map((item: any, i: number) => (
          <Reveal key={item.label} delay={i * 0.06} className="px-1 py-8 md:px-8">
            <p className="label-mono text-muted-foreground">{item.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold">{item.value}</p>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}

/* ---------------------------------- stats --------------------------------- */

function Stats({ section }: { section?: Row | undefined }) {
  const items = asObjects(section?.["extra"]?.items);
  if (!section) return null;
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div aria-hidden className="rule-grid absolute inset-0 opacity-30" />
      <Container className="relative">
        <SectionHead
          eyebrow={section["eyebrow"]}
          heading={section["heading"]}
          subheading={section["subheading"]}
        />
        <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item: any, i: number) => {
            const value = Number(item.value);
            const decimals = String(item.value).includes(".") ? 1 : 0;
            return (
              <Reveal key={item.label} delay={i * 0.07} className="bg-background p-8">
                <p className="font-display text-4xl font-bold text-amber lg:text-5xl">
                  <Counter
                    value={value}
                    decimals={decimals}
                    prefix={item.prefix ?? ""}
                    suffix={item.suffix ?? ""}
                  />
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{item.label}</p>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------- services -------------------------------- */

function Services({ section, services }: { section?: Row | undefined; services: Row[] }) {
  if (!section) return null;
  return (
    <section className="border-t border-border bg-surface py-24 md:py-32">
      <Container>
        <SectionHead
          eyebrow={section["eyebrow"]}
          heading={section["heading"]}
          subheading={section["subheading"]}
          action={
            section["cta_label"] ? (
              <Action to="/services" variant="outline">
                {section["cta_label"]}
              </Action>
            ) : null
          }
        />
        <ul className="mt-14 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal as="li" key={service["slug"]} delay={(i % 3) * 0.06} className="bg-background">
              <Link
                to="/services/$slug"
                params={{ slug: service["slug"] }}
                className="group flex h-full flex-col p-8 transition-colors hover:bg-surface"
              >
                <span className="label-mono text-amber">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-amber">
                  {service["title"]}
                </h3>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{service["summary"]}</p>
                <span className="label-mono mt-6 text-foreground/60 transition-colors group-hover:text-amber">
                  Explore →
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* --------------------------------- sectors -------------------------------- */

function Sectors({ section, sectors }: { section?: Row | undefined; sectors: Row[] }) {
  if (!section) return null;
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHead
          eyebrow={section["eyebrow"]}
          heading={section["heading"]}
          subheading={section["subheading"]}
        />
        <ul className="mt-14 flex flex-wrap gap-3">
          {sectors.map((sector, i) => (
            <Reveal as="li" key={sector["slug"]} delay={i * 0.04}>
              <Link
                to="/projects"
                search={{ sector: sector["slug"] } as never}
                className="group flex items-center gap-3 rounded-sm border border-border px-5 py-4 transition-colors hover:border-amber"
              >
                <span className="font-display text-base font-semibold transition-colors group-hover:text-amber">
                  {sector["title"]}
                </span>
                <span className="label-mono text-muted-foreground">→</span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ---------------------------- featured projects --------------------------- */

function FeaturedProjects({ section, projects }: { section?: Row | undefined; projects: Row[] }) {
  if (!section) return null;
  return (
    <section className="border-t border-border py-24 md:py-32">
      <Container>
        <SectionHead
          eyebrow={section["eyebrow"]}
          heading={section["heading"]}
          subheading={section["subheading"]}
          action={
            section["cta_label"] ? (
              <Action to="/projects" variant="outline">
                {section["cta_label"]}
              </Action>
            ) : null
          }
        />
        <ul className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal as="li" key={project["slug"]} delay={(i % 3) * 0.08}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* --------------------------------- process -------------------------------- */

function Process({ section }: { section?: Row | undefined }) {
  const steps = asObjects(section?.["extra"]?.steps);
  if (!section || !steps.length) return null;
  return (
    <section className="border-t border-border bg-surface py-24 md:py-32">
      <Container>
        <SectionHead
          eyebrow={section["eyebrow"]}
          heading={section["heading"]}
          subheading={section["subheading"]}
        />
        <ol className="mt-14 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step: any, i: number) => (
            <Reveal as="li" key={step.title} delay={(i % 3) * 0.07} className="bg-background p-8">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-3xl font-bold text-amber/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-lg font-semibold tracking-tight">{step.title}</h3>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* ------------------------------ developments ------------------------------ */

function Developments({ section, developments }: { section?: Row | undefined; developments: Row[] }) {
  if (!section) return null;
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHead
          eyebrow={section["eyebrow"]}
          heading={section["heading"]}
          subheading={section["subheading"]}
          action={
            section["cta_label"] ? (
              <Action to="/real-estate" variant="outline">
                {section["cta_label"]}
              </Action>
            ) : null
          }
        />
        <ul className="mt-14 grid gap-8 lg:grid-cols-3">
          {developments.map((dev, i) => (
            <Reveal as="li" key={dev["slug"]} delay={i * 0.08}>
              <Link
                to="/real-estate/$slug"
                params={{ slug: dev["slug"] }}
                className="group relative block h-[26rem] overflow-hidden border border-border"
              >
                {dev["cover_image_url"] ? (
                  <ResponsiveImage
                    src={dev["cover_image_url"]}
                    alt={dev["title"]}
                    className="absolute inset-0 h-full w-full"
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <StatusChip label={statusLabel(dev["status"])} />
                  <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">
                    {dev["title"]}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{dev["location"] ?? dev["city"]}</p>
                  {dev["starting_price"] ? (
                    <p className="label-mono mt-4 text-amber">From {dev["starting_price"]}</p>
                  ) : null}
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* --------------------------------- clients -------------------------------- */

function Clients({ section, clients }: { section?: Row | undefined; clients: Row[] }) {
  if (!section || !clients.length) return null;
  return (
    <section className="border-y border-border bg-surface py-20">
      <Container>
        <SectionHead eyebrow={section["eyebrow"]} heading={section["heading"]} />
        <ul className="mt-12 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {clients.map((client) => (
            <li
              key={client["id"]}
              className="flex h-24 items-center justify-center bg-background px-4 text-center"
            >
              {client["logo_url"] ? (
                <img
                  src={client["logo_url"]}
                  alt={client["name"]}
                  loading="lazy"
                  className="max-h-10 opacity-70 transition-opacity hover:opacity-100"
                />
              ) : (
                <span className="text-sm font-medium text-muted-foreground">{client["name"]}</span>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ----------------------------- certifications ----------------------------- */

function Certifications({ section, items }: { section?: Row | undefined; items: Row[] }) {
  if (!section || !items.length) return null;
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHead
          eyebrow={section["eyebrow"]}
          heading={section["heading"]}
          subheading={section["subheading"]}
        />
        <ul className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {items.map((cert, i) => (
            <Reveal as="li" key={cert["id"]} delay={(i % 4) * 0.06} className="bg-background p-8">
              <p className="label-mono text-amber">{cert["issued_year"] ?? "—"}</p>
              <h3 className="mt-4 font-display text-base font-semibold">{cert["title"]}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{cert["issuer"]}</p>
              {cert["reference_no"] ? (
                <p className="label-mono mt-4 text-muted-foreground">{cert["reference_no"]}</p>
              ) : null}
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ------------------------------ testimonials ------------------------------ */

function Testimonials({ section, items }: { section?: Row | undefined; items: Row[] }) {
  if (!section || !items.length) return null;
  return (
    <section className="border-t border-border bg-surface py-24 md:py-32">
      <Container>
        <SectionHead eyebrow={section["eyebrow"]} heading={section["heading"]} />
        <ul className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((t, i) => (
            <Reveal
              as="li"
              key={t["id"]}
              delay={(i % 3) * 0.07}
              className="flex h-full flex-col border border-border bg-background p-8"
            >
              <p className="font-display text-4xl leading-none text-amber/40">“</p>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/85">
                {t["quote"]}
              </blockquote>
              <footer className="mt-6 border-t border-border pt-5">
                <p className="text-sm font-semibold">{t["author"]}</p>
                <p className="label-mono mt-1 text-muted-foreground">
                  {[t["author_role"], t["company"]].filter(Boolean).join(" · ")}
                </p>
              </footer>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* -------------------------------- insights -------------------------------- */

function Insights({ section, posts }: { section?: Row | undefined; posts: Row[] }) {
  if (!section || !posts.length) return null;
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHead
          eyebrow={section["eyebrow"]}
          heading={section["heading"]}
          subheading={section["subheading"]}
          action={
            section["cta_label"] ? (
              <Action to="/insights" variant="outline">
                {section["cta_label"]}
              </Action>
            ) : null
          }
        />
        <ul className="mt-14 grid gap-8 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal as="li" key={post["slug"]} delay={i * 0.08}>
              <Link
                to="/insights/$slug"
                params={{ slug: post["slug"] }}
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
                    {post["category"]} · {longDate(post["published_at"])}
                  </p>
                  <h3 className="mt-3 font-display text-lg leading-snug font-semibold transition-colors group-hover:text-amber">
                    {post["title"]}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{post["excerpt"]}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ------------------------------- closing cta ------------------------------ */

function ClosingCta({ section }: { section?: Row | undefined }) {
  if (!section) return null;
  return (
    <section className="relative overflow-hidden border-t border-border bg-surface py-24 md:py-32">
      <div aria-hidden className="rule-grid absolute inset-0 opacity-40" />
      <Container className="relative text-center">
        <Reveal>
          <Eyebrow className="justify-center">{section["eyebrow"]}</Eyebrow>
          <h2 className="mx-auto mt-6 max-w-3xl text-[clamp(2rem,5vw,3.75rem)] leading-[1.02] font-bold tracking-tight">
            {section["heading"]}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            {section["subheading"]}
          </p>
          <div className="mt-10 flex justify-center">
            <Action to="/contact">{section["cta_label"] ?? "Request a quote"}</Action>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
