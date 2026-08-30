import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Action, Container, PageHero } from "@/components/site/primitives";
import { SiteShell } from "@/components/site/site-shell";
import { submitLead } from "@/lib/content.functions";
import { asObjects } from "@/lib/format";
import { servicesQuery, siteSettingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/contact")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(siteSettingsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Contact AMARC | Construction Company Lahore, Pakistan" },
      {
        name: "description",
        content:
          "Request a quote or site visit from AMARC Engineering & Construction. Offices in Lahore, Karachi and Islamabad. Written response within two working days.",
      },
      { property: "og:title", content: "Contact AMARC | Construction Company Lahore" },
      {
        property: "og:description",
        content: "Send us the plot details and a rough brief — we reply within two working days.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const inputCls =
  "w-full rounded-sm border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-amber";

function ContactPage() {
  const { data: settings } = useSuspenseQuery(siteSettingsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const offices = asObjects(settings?.offices);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    try {
      await submitLead({
        data: {
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          company: String(form.get("company") ?? ""),
          city: String(form.get("city") ?? ""),
          service_interest: String(form.get("service_interest") ?? ""),
          project_type: String(form.get("project_type") ?? ""),
          budget: String(form.get("budget") ?? ""),
          message: String(form.get("message") ?? ""),
          source: "contact-page",
        },
      });
      toast.success("Enquiry sent — we reply within two working days.");
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error("Could not send your enquiry. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <SiteShell>
      <PageHero
        eyebrow="Contact"
        title="Tell us what you want to build."
        intro="Send the plot details and a rough brief. You will get a written response within two working days."
      />

      <section className="py-20 md:py-28">
        <Container className="grid gap-16 lg:grid-cols-[1.5fr_1fr]">
          <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
            <input required name="name" placeholder="Full name *" className={inputCls} />
            <input name="email" type="email" placeholder="Email" className={inputCls} />
            <input name="phone" placeholder="Phone / WhatsApp" className={inputCls} />
            <input name="company" placeholder="Company" className={inputCls} />
            <input name="city" placeholder="Project city" className={inputCls} />
            <select name="service_interest" className={inputCls} defaultValue="">
              <option value="" disabled>
                Service of interest
              </option>
              {services.map((s: any) => (
                <option key={s.slug} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
            <input name="project_type" placeholder="Project type (e.g. plaza, house)" className={inputCls} />
            <input name="budget" placeholder="Indicative budget (PKR)" className={inputCls} />
            <textarea
              name="message"
              placeholder="Brief description of the project"
              rows={5}
              className={`${inputCls} sm:col-span-2`}
            />
            <div className="sm:col-span-2">
              <Action type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send enquiry"}
              </Action>
            </div>
          </form>

          <aside className="space-y-8">
            <div className="space-y-4 border border-border bg-surface p-7">
              {settings?.phone ? (
                <a href={`tel:${String(settings.phone).replace(/\s/g, "")}`} className="flex items-center gap-3 text-sm transition-colors hover:text-amber">
                  <Phone className="h-4 w-4 text-amber" aria-hidden /> {settings.phone}
                </a>
              ) : null}
              {settings?.email ? (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-sm transition-colors hover:text-amber">
                  <Mail className="h-4 w-4 text-amber" aria-hidden /> {settings.email}
                </a>
              ) : null}
              {settings?.google_maps_url ? (
                <a href={settings.google_maps_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm transition-colors hover:text-amber">
                  <MapPin className="h-4 w-4 text-amber" aria-hidden /> Find us on Google Maps
                </a>
              ) : null}
            </div>

            {offices.length ? (
              <div className="space-y-6">
                {offices.map((office: any) => (
                  <div key={office.city} className="border-l-2 border-amber pl-5">
                    <p className="label-mono text-amber">{office.label ?? office.city}</p>
                    <p className="mt-2 text-sm font-semibold">{office.address}</p>
                    {office.phone ? (
                      <p className="mt-1 text-sm text-muted-foreground">{office.phone}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </aside>
        </Container>
      </section>

      {settings?.map_embed_url ? (
        <section className="border-t border-border">
          <iframe
            title="AMARC office location map"
            src={settings.map_embed_url}
            className="h-[420px] w-full grayscale invert-[0.9] contrast-[0.9]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      ) : null}
    </SiteShell>
  );
}
