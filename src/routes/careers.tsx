import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  Action,
  Container,
  FeatureStory,
  PageHero,
  Reveal,
  SectionHead,
} from "@/components/site/primitives";
import { SiteShell } from "@/components/site/site-shell";
import { submitApplication } from "@/lib/content.functions";
import { asList, longDate } from "@/lib/format";
import { careersQuery } from "@/lib/queries";

export const Route = createFileRoute("/careers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(careersQuery),
  head: () => ({
    meta: [
      { title: "Careers at AMARC | Construction Jobs in Pakistan" },
      {
        name: "description",
        content:
          "Open engineering, site and office positions at AMARC Engineering & Construction across Lahore, Karachi and Islamabad.",
      },
      { property: "og:title", content: "Careers at AMARC | Construction Jobs in Pakistan" },
      {
        property: "og:description",
        content: "Join the team building Pakistan's commercial and residential landmarks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareersPage,
});

const inputCls =
  "w-full rounded-sm border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-amber";

function CareersPage() {
  const { data: jobs } = useSuspenseQuery(careersQuery);
  const [open, setOpen] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    try {
      await submitApplication({
        data: {
          job_title: String(form.get("job_title") ?? ""),
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          cv_url: String(form.get("cv_url") ?? ""),
          cover_letter: String(form.get("cover_letter") ?? ""),
        },
      });
      toast.success("Application received. HR will be in touch.");
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Could not submit your application. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Careers"
        title="Build your career on real sites."
        intro="Direct employment, structured training and long projects that make your name."
      />

      {/* Feature Story block added per Phase 3 */}
      <section className="bg-background py-20 md:py-28">
        <Container>
          <FeatureStory
            eyebrow="Life at AMARC"
            heading="More than just a job site."
            body="We believe in training the next generation of engineers and builders. From comprehensive safety protocols to continuous professional development, joining AMARC means building a lasting career in Pakistan's construction sector."
            bars={[
              { label: "Internal Promotions", value: 65 },
              { label: "Retention Rate", value: 85 },
            ]}
            image="https://images.unsplash.com/photo-1541888086925-920eb1f10350?auto=format&fit=crop&q=80"
            imageAlt="AMARC team members reviewing plans on site"
            flip={true}
          />
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-20 md:py-28">
        <Container>
          <SectionHead eyebrow="Open roles" heading="Current vacancies" />
          <div className="mt-12 divide-y divide-border border-y border-border">
            {jobs.map((job: any) => (
              <details key={job.id} className="group py-7" onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open ? job.id : null)}>
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold">{job.title}</h2>
                    <p className="label-mono mt-2 text-muted-foreground">
                      {[job.department, job.location, job.employment_type].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="label-mono text-amber">
                    {job.closes_at ? `Closes ${longDate(job.closes_at)}` : "Open"}
                    <span className="ml-3 inline-block transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <div className="mt-6 grid gap-8 lg:grid-cols-2">
                  <div>
                    <p className="text-sm leading-relaxed text-foreground/85">{job.description ?? job.summary}</p>
                    {asList(job.responsibilities).length ? (
                      <ul className="mt-5 space-y-2">
                        {asList(job.responsibilities).map((r) => (
                          <li key={r} className="flex gap-3 text-sm text-muted-foreground">
                            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-amber" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="label-mono text-amber">Requirements</h3>
                    <ul className="mt-4 space-y-2">
                      {asList(job.requirements).map((r) => (
                        <li key={r} className="flex gap-3 text-sm text-muted-foreground">
                          <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-amber" />
                          {r}
                        </li>
                      ))}
                    </ul>
                    {job.experience ? (
                      <p className="label-mono mt-5 text-muted-foreground">Experience: {job.experience}</p>
                    ) : null}
                  </div>
                </div>

                {open === job.id ? (
                  <Reveal className="mt-8 border border-border bg-background p-7">
                    <h3 className="font-display text-lg font-semibold">Apply for this role</h3>
                    <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
                      <input type="hidden" name="job_title" value={job.title} />
                      <input required name="name" placeholder="Full name *" className={inputCls} />
                      <input required name="email" type="email" placeholder="Email *" className={inputCls} />
                      <input name="phone" placeholder="Phone" className={inputCls} />
                      <input name="cv_url" placeholder="Link to CV (Drive/Dropbox)" className={inputCls} />
                      <textarea
                        name="cover_letter"
                        placeholder="Short cover note"
                        rows={4}
                        className={`${inputCls} sm:col-span-2`}
                      />
                      <div className="sm:col-span-2">
                        <Action type="submit" disabled={sending}>
                          {sending ? "Submitting…" : "Submit application"}
                        </Action>
                      </div>
                    </form>
                  </Reveal>
                ) : null}
              </details>
            ))}
            {!jobs.length ? (
              <p className="py-10 text-muted-foreground">
                No open roles right now — send a general application through the contact page.
              </p>
            ) : null}
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
