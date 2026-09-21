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
import { homeQuery, pageSeoQuery, siteSettingsQuery } from "@/lib/queries";
import { buildSeoHead, buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [, , seo] = await Promise.all([
      context.queryClient.ensureQueryData(homeQuery),
      context.queryClient.ensureQueryData(siteSettingsQuery),
      context.queryClient.ensureQueryData(pageSeoQuery("/")),
    ]);
    return { seo };
  },
  head: ({ loaderData }) =>
    buildSeoHead({
      path: "/",
      seo: loaderData?.seo,
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
            <h1 className="mt-6 text-[clamp(2.4rem,6.5vw,5.5rem)] leading-[0.98] font-bold tracking-tight text-balance sm:text-[clamp(2.8rem,7vw,5.5rem)]">
              {section["heading"]}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 max-w-xl text-base text-foreground/80 sm:mt-6 sm:text-lg md:text-xl">
              {section["subheading"]}
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <p className="mt-3 max-w-xl text-xs text-muted-foreground sm:mt-4 sm:text-sm md:text-base">{section["body"]}</p>
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
          <Reveal key={item.label} delay={i * 0.06} className="px-1 py-6 sm:py-8 md:px-8">
            <p className="label-mono text-[10px] text-muted-foreground sm:text-xs">{item.label}</p>
            <p className="mt-1.5 font-display text-xl font-semibold sm:mt-2 sm:text-2xl md:text-3xl">{item.value}</p>
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
              <Reveal key={item.label} delay={i * 0.07} className="bg-background p-6 sm:p-8">
                <p className="font-display text-3xl font-bold text-amber sm:text-4xl lg:text-5xl">
                  <Counter
                    value={value}
                    decimals={decimals}
                    prefix={item.prefix ?? ""}
                    suffix={item.suffix ?? ""}
                  />
                </p>
                <p className="mt-2 text-xs text-muted-foreground sm:mt-3 sm:text-sm md:text-base">{item.label}</p>
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
        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal as="li" key={service["slug"]} delay={(i % 3) * 0.06}>
              <Link
                to="/services/$slug"
                params={{ slug: service["slug"] }}
                className="group relative flex h-[28rem] min-h-[22rem] flex-col justify-end overflow-hidden border border-border bg-surface transition-colors md:hover:border-amber/60"
              >
                {service["hero_image_url"] ? (
                  <>
                    <ResponsiveImage
                      src={service["hero_image_url"]}
                      alt={service["title"]}
                      className="absolute inset-0 h-full w-full"
                      imgClassName="h-full w-full object-cover transition-transform duration-700 md:group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
                  </>
                ) : null}
                
                <div className="relative z-10 p-6 sm:p-8">
                  <span className="label-mono text-xs text-amber sm:text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-foreground transition-colors sm:text-2xl md:group-hover:text-amber">
                    {service["title"]}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs text-foreground/80 sm:text-sm md:text-base">{service["summary"]}</p>
                  <span className="label-mono mt-5 block text-xs text-foreground/60 transition-colors sm:mt-6 sm:text-sm md:group-hover:text-amber">
                    Explore →
                  </span>
                </div>
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
        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sectors.map((sector, i) => (
            <Reveal as="li" key={sector["slug"]} delay={i * 0.04}>
              <Link
                to="/projects"
                search={{ sector: sector["slug"] } as never}
                className="group relative flex h-48 min-h-[12rem] items-end overflow-hidden rounded-sm border border-border p-5 transition-colors md:hover:border-amber"
              >
                {sector["hero_image_url"] ? (
                  <>
                    <ResponsiveImage
                      src={sector["hero_image_url"]}
                      alt={sector["title"]}
                      className="absolute inset-0 h-full w-full"
                      imgClassName="h-full w-full object-cover transition-transform duration-700 md:group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-background/10" />
                  </>
                ) : null}
                <div className="relative z-10 flex w-full items-center justify-between gap-3">
                  <span className="font-display text-base font-semibold text-foreground transition-colors sm:text-lg md:group-hover:text-amber">
                    {sector["title"]}
                  </span>
                  <span className="label-mono text-amber opacity-0 transition-opacity md:group-hover:opacity-100">→</span>
                </div>
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
            <Reveal as="li" key={step.title} delay={(i % 3) * 0.07} className="bg-background p-6 sm:p-8">
              <div className="flex items-baseline gap-3 sm:gap-4">
                <span className="font-display text-2xl font-bold text-amber/30 sm:text-3xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-base font-semibold tracking-tight sm:text-lg md:text-xl">{step.title}</h3>
              </div>
              <p className="mt-3 text-xs text-muted-foreground sm:mt-4 sm:text-sm md:text-base">{step.body}</p>
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
                className="group relative block h-[26rem] min-h-[20rem] overflow-hidden border border-border"
              >
                {dev["cover_image_url"] ? (
                  <ResponsiveImage
                    src={dev["cover_image_url"]}
                    alt={dev["title"]}
                    className="absolute inset-0 h-full w-full"
                    imgClassName="transition-transform duration-700 md:group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <StatusChip label={statusLabel(dev["status"])} />
                  <h3 className="mt-3 font-display text-xl font-semibold tracking-tight sm:mt-4 sm:text-2xl">
                    {dev["title"]}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{dev["location"] ?? dev["city"]}</p>
                  {dev["starting_price"] ? (
                    <p className="label-mono mt-3 text-xs text-amber sm:mt-4 sm:text-sm">From {dev["starting_price"]}</p>
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
                  className="max-h-10 opacity-70 transition-opacity md:hover:opacity-100"
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
            <Reveal as="li" key={cert["id"]} delay={(i % 4) * 0.06} className="bg-background p-6 sm:p-8">
              <p className="label-mono text-xs text-amber">{cert["issued_year"] ?? "—"}</p>
              <h3 className="mt-3 font-display text-sm font-semibold sm:mt-4 sm:text-base md:text-lg">{cert["title"]}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">{cert["issuer"]}</p>
              {cert["reference_no"] ? (
                <p className="label-mono mt-3 text-[10px] text-muted-foreground sm:mt-4 sm:text-xs">{cert["reference_no"]}</p>
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
              className="flex h-full flex-col border border-border bg-background p-6 sm:p-8"
            >
              <p className="font-display text-3xl leading-none text-amber/40 sm:text-4xl">“</p>
              <blockquote className="mt-3 flex-1 text-xs leading-relaxed text-foreground/85 sm:mt-4 sm:text-sm md:text-base">
                {t["quote"]}
              </blockquote>
              <footer className="mt-5 border-t border-border pt-4 sm:mt-6 sm:pt-5">
                <p className="text-xs font-semibold sm:text-sm">{t["author"]}</p>
                <p className="label-mono mt-1 text-[10px] text-muted-foreground sm:text-xs">
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
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal as="li" key={post["slug"]} delay={i * 0.08}>
              <Link
                to="/insights/$slug"
                params={{ slug: post["slug"] }}
                className="group flex h-full min-h-[22rem] flex-col overflow-hidden border border-border bg-surface transition-colors sm:min-h-[24rem] md:hover:border-amber/60"
              >
                {post["cover_image_url"] ? (
                  <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-52">
                    <ResponsiveImage
                      src={post["cover_image_url"]}
                      alt={post["title"]}
                      aspectRatio="16/9"
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover transition-transform duration-700 md:group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="hero-texture h-48 w-full shrink-0 sm:h-52" />
                )}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="label-mono text-[10px] text-muted-foreground sm:text-xs">
                    {post["category"]} · {longDate(post["published_at"])}
                  </p>
                  <h3 className="mt-3 font-display text-base font-semibold leading-snug transition-colors sm:text-lg md:text-xl md:group-hover:text-amber">
                    {post["title"]}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-xs text-muted-foreground sm:text-sm md:text-base">{post["excerpt"]}</p>
                  <span className="label-mono mt-4 block text-xs text-amber opacity-0 transition-opacity sm:text-sm md:group-hover:opacity-100">
                    Read article →
                  </span>
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
          <h2 className="mx-auto mt-6 max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.75rem] leading-[1.05]">
            {section["heading"]}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:mt-6 sm:text-base md:text-lg">
            {section["subheading"]}
          </p>
          <div className="mt-8 flex justify-center sm:mt-10">
            <Action to="/contact">{section["cta_label"] ?? "Request a quote"}</Action>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
