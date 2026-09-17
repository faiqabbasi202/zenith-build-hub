import { Link } from "@tanstack/react-router";
import { Facebook, Linkedin, Mail, MapPin, Phone } from "lucide-react";

import { asObjects } from "@/lib/format";

type Settings = Record<string, any> | null;

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About AMARC", to: "/about" },
      { label: "Insights", to: "/insights" },
      { label: "Careers", to: "/careers" },
      { label: "Tenders & vendors", to: "/tenders" },
    ],
  },
  {
    title: "What we do",
    links: [
      { label: "Services", to: "/services" },
      { label: "Projects", to: "/projects" },
      { label: "Real estate", to: "/real-estate" },
      { label: "Downloads", to: "/downloads" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "FAQ", to: "/faq" },
      { label: "Staff login", to: "/auth" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: Settings }) {
  const offices = asObjects(settings?.["offices"]);
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-[oklch(1_0_0/12%)]"
      style={{ backgroundColor: "var(--color-dark-section)", color: "var(--color-dark-section-foreground)" }}
    >
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.4fr_2fr] lg:py-20">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-amber font-display text-lg font-bold text-primary-foreground">
              A
            </span>
            <span>
              <span className="block font-display text-xl font-bold tracking-tight">AMARC</span>
              <span className="label-mono text-[9px] opacity-50">
                Engineering &amp; Construction
              </span>
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm opacity-60">
            {settings?.["tagline"] ?? "Engineering the built environment of Pakistan."}
          </p>

          <div className="mt-7 space-y-3 text-sm">
            {settings?.["phone"] ? (
              <a
                href={`tel:${String(settings["phone"]).replace(/\s/g, "")}`}
                className="flex items-center gap-3 opacity-70 transition-colors hover:opacity-100 hover:text-amber"
              >
                <Phone className="h-4 w-4 text-amber" aria-hidden />
                {settings["phone"]}
              </a>
            ) : null}
            {settings?.["email"] ? (
              <a
                href={`mailto:${settings["email"]}`}
                className="flex items-center gap-3 opacity-70 transition-colors hover:opacity-100 hover:text-amber"
              >
                <Mail className="h-4 w-4 text-amber" aria-hidden />
                {settings["email"]}
              </a>
            ) : null}
            {settings?.["address"] ? (
              <p className="flex items-start gap-3 opacity-70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
                <span>
                  {settings["address"]}, {settings["city"]}
                </span>
              </p>
            ) : null}
          </div>

          <div className="mt-7 flex gap-3">
            {settings?.["facebook_url"] ? (
              <a
                href={settings["facebook_url"]}
                target="_blank"
                rel="noreferrer"
                aria-label="AMARC on Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-[oklch(1_0_0/15%)] transition-colors hover:border-amber hover:text-amber"
              >
                <Facebook className="h-4 w-4" />
              </a>
            ) : null}
            {settings?.["linkedin_url"] ? (
              <a
                href={settings["linkedin_url"]}
                target="_blank"
                rel="noreferrer"
                aria-label="AMARC on LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-[oklch(1_0_0/15%)] transition-colors hover:border-amber hover:text-amber"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            ) : null}
            {settings?.["google_maps_url"] ? (
              <a
                href={settings["google_maps_url"]}
                target="_blank"
                rel="noreferrer"
                aria-label="AMARC on Google Maps"
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-[oklch(1_0_0/15%)] transition-colors hover:border-amber hover:text-amber"
              >
                <MapPin className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="label-mono opacity-40">{col.title}</h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm opacity-70 transition-colors hover:opacity-100 hover:text-amber"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {offices.length ? (
        <div className="border-t border-[oklch(1_0_0/12%)]">
          <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
            {offices.map((office: any) => (
              <div key={office.city}>
                <p className="label-mono text-amber">{office.label ?? office.city}</p>
                <p className="mt-3 text-sm font-semibold">{office.city}</p>
                <p className="mt-1 text-sm opacity-55">{office.address}</p>
                {office.phone ? (
                  <p className="mt-1 text-sm opacity-55">{office.phone}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="border-t border-[oklch(1_0_0/12%)]">
        <div className="container-page flex flex-col gap-3 py-6 text-xs opacity-50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings?.["company_full_name"] ?? "AMARC Engineering & Construction Company"}.
            All rights reserved.
          </p>
          <p className="label-mono">
            {settings?.["pec_number"] ? `PEC ${settings["pec_number"]}` : null}
            {settings?.["ntn_number"] ? ` · NTN ${settings["ntn_number"]}` : null}
          </p>
        </div>
      </div>
    </footer>
  );
}
