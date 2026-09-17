import { Link } from "@tanstack/react-router";
import {
  Clock,
  Facebook,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

type Settings = Record<string, any> | null;

const QUICK_LINKS = [
  { label: "Home",          to: "/" },
  { label: "About",         to: "/about" },
  { label: "Services",      to: "/services" },
  { label: "Projects",      to: "/projects" },
  { label: "Real Estate",   to: "/real-estate" },
  { label: "Insights",      to: "/insights" },
  { label: "Careers",       to: "/careers" },
  { label: "Contact",       to: "/contact" },
];

/* ─── Social icon button ───────────────────────────────────────────────── */
function SocialBtn({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-sm bg-amber text-primary-foreground transition-all hover:brightness-110"
    >
      {children}
    </a>
  );
}

/* ─── Footer ───────────────────────────────────────────────────────────── */
export function SiteFooter({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  const companyName =
    settings?.["company_full_name"] ?? "AMARC Engineering & Construction Company";

  return (
    <footer
      className="border-t border-[oklch(1_0_0/10%)]"
      style={{
        backgroundColor: "var(--color-dark-section)",
        color: "var(--color-dark-section-foreground)",
      }}
    >
      {/* ── Main grid ── */}
      <div className="container-page py-14 lg:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Column 1 — Logo + tagline + socials */}
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center bg-amber font-display text-lg font-bold text-primary-foreground">
                A
              </span>
              <span>
                <span className="block font-display text-xl font-bold tracking-tight">
                  AMARC
                </span>
                <span className="label-mono text-[9px] opacity-50">
                  Engineering &amp; Construction
                </span>
              </span>
            </Link>

            <p className="mt-5 text-sm leading-relaxed opacity-60">
              {settings?.["tagline"] ??
                "Engineering the built environment of Pakistan since 2004."}
            </p>

            {/* Orange social icons */}
            <div className="mt-7 flex flex-wrap gap-2">
              {settings?.["facebook_url"] ? (
                <SocialBtn href={settings["facebook_url"]} label="Facebook">
                  <Facebook className="h-3.5 w-3.5" />
                </SocialBtn>
              ) : null}
              {settings?.["twitter_url"] ? (
                <SocialBtn href={settings["twitter_url"]} label="Twitter / X">
                  <Twitter className="h-3.5 w-3.5" />
                </SocialBtn>
              ) : null}
              {settings?.["linkedin_url"] ? (
                <SocialBtn href={settings["linkedin_url"]} label="LinkedIn">
                  <Linkedin className="h-3.5 w-3.5" />
                </SocialBtn>
              ) : null}
              {settings?.["youtube_url"] ? (
                <SocialBtn href={settings["youtube_url"]} label="YouTube">
                  <Youtube className="h-3.5 w-3.5" />
                </SocialBtn>
              ) : null}
            </div>
          </div>

          {/* Column 2 — Get In Touch */}
          <div>
            <h3 className="font-display text-base font-semibold">Get In Touch</h3>
            <div className="mt-5 space-y-4 text-sm">
              {settings?.["address"] ? (
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-amber text-primary-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="label-mono text-[10px] opacity-40">Location</p>
                    <p className="mt-0.5 opacity-75">
                      {settings["address"]}
                      {settings?.["city"] ? `, ${settings["city"]}` : ""}
                    </p>
                  </div>
                </div>
              ) : null}

              {settings?.["email"] ? (
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-amber text-primary-foreground">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="label-mono text-[10px] opacity-40">Email</p>
                    <a
                      href={`mailto:${settings["email"]}`}
                      className="mt-0.5 block opacity-75 transition-opacity hover:opacity-100 hover:text-amber"
                    >
                      {settings["email"]}
                    </a>
                  </div>
                </div>
              ) : null}

              {settings?.["phone"] ? (
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-amber text-primary-foreground">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="label-mono text-[10px] opacity-40">Phone</p>
                    <a
                      href={`tel:${String(settings["phone"]).replace(/\s/g, "")}`}
                      className="mt-0.5 block opacity-75 transition-opacity hover:opacity-100 hover:text-amber"
                    >
                      {settings["phone"]}
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Column 3 — Quick Links */}
          <div>
            <h3 className="font-display text-base font-semibold">Quick Links</h3>
            <ul className="mt-5 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm opacity-65 transition-all hover:opacity-100 hover:text-amber"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Office Time */}
          <div>
            <h3 className="font-display text-base font-semibold">Office Time</h3>
            <ul className="mt-5 space-y-2.5 text-sm">
              {settings?.["office_hours_schedule"] ? (
                /* If a structured schedule exists in settings, render it */
                (settings["office_hours_schedule"] as { day: string; hours: string }[]).map(
                  (row) => (
                    <li key={row.day} className="flex items-center justify-between gap-4">
                      <span className="opacity-65">{row.day}</span>
                      <span className="text-amber">{row.hours}</span>
                    </li>
                  ),
                )
              ) : (
                /* Fallback — static default schedule */
                <>
                  <li className="flex items-center gap-3">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-amber" />
                    <div>
                      <span className="opacity-65">Mon – Sat</span>
                      <span className="ml-2 text-amber">9:00AM – 6:00PM</span>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-amber" />
                    <div>
                      <span className="opacity-65">Sunday</span>
                      <span className="ml-2 text-amber">10:00AM – 4:00PM</span>
                    </div>
                  </li>
                </>
              )}
            </ul>

            {/* PEC / NTN numbers if available */}
            {(settings?.["pec_number"] || settings?.["ntn_number"]) ? (
              <div className="mt-8 space-y-1 border-t border-[oklch(1_0_0/10%)] pt-5">
                {settings?.["pec_number"] ? (
                  <p className="label-mono text-[10px] opacity-45">
                    PEC {settings["pec_number"]}
                  </p>
                ) : null}
                {settings?.["ntn_number"] ? (
                  <p className="label-mono text-[10px] opacity-45">
                    NTN {settings["ntn_number"]}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Copyright bar ── */}
      <div className="border-t border-[oklch(1_0_0/10%)]">
        <div className="container-page flex flex-col gap-2 py-5 text-xs opacity-45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {companyName}. All rights reserved.
          </p>
          <p className="label-mono">
            Designed &amp; built with precision.
          </p>
        </div>
      </div>
    </footer>
  );
}
