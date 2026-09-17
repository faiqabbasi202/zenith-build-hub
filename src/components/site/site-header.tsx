import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Clock,
  Facebook,
  Linkedin,
  Mail,
  Menu,
  Phone,
  Search,
  Twitter,
  X,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Settings = Record<string, any> | null;

const NAV = [
  { label: "Home",        to: "/" },
  { label: "Services",   to: "/services" },
  { label: "Projects",   to: "/projects" },
  { label: "Real Estate",to: "/real-estate" },
  { label: "About",      to: "/about" },
  { label: "Insights",   to: "/insights" },
  { label: "Careers",    to: "/careers" },
  { label: "Contact",    to: "/contact" },
];

/* ─── Utility bar (desktop only) ──────────────────────────────────────── */
function UtilityBar({ settings }: { settings: Settings }) {
  return (
    <div className="hidden border-b border-border bg-amber md:block">
      <div className="container-page flex h-9 items-center justify-between gap-4">
        {/* Left — contact info + office hours */}
        <div className="flex items-center gap-5 text-primary-foreground">
          {settings?.["email"] ? (
            <a
              href={`mailto:${settings["email"]}`}
              className="label-mono flex items-center gap-1.5 text-[10px] opacity-90 transition-opacity hover:opacity-100"
            >
              <Mail className="h-3 w-3 shrink-0" aria-hidden />
              {settings["email"]}
            </a>
          ) : null}
          {settings?.["phone"] ? (
            <a
              href={`tel:${String(settings["phone"]).replace(/\s/g, "")}`}
              className="label-mono flex items-center gap-1.5 text-[10px] opacity-90 transition-opacity hover:opacity-100"
            >
              <Phone className="h-3 w-3 shrink-0" aria-hidden />
              {settings["phone"]}
            </a>
          ) : null}
          {settings?.["office_hours"] ? (
            <span className="label-mono flex items-center gap-1.5 text-[10px] opacity-90">
              <Clock className="h-3 w-3 shrink-0" aria-hidden />
              {settings["office_hours"]}
            </span>
          ) : (
            <span className="label-mono flex items-center gap-1.5 text-[10px] opacity-90">
              <Clock className="h-3 w-3 shrink-0" aria-hidden />
              Office Hours: 9AM – 6PM
            </span>
          )}
        </div>

        {/* Right — social icons */}
        <div className="flex items-center gap-2">
          {settings?.["facebook_url"] ? (
            <a
              href={settings["facebook_url"]}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-5 w-5 items-center justify-center text-primary-foreground opacity-80 transition-opacity hover:opacity-100"
            >
              <Facebook className="h-3 w-3" />
            </a>
          ) : null}
          {settings?.["twitter_url"] ? (
            <a
              href={settings["twitter_url"]}
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter / X"
              className="flex h-5 w-5 items-center justify-center text-primary-foreground opacity-80 transition-opacity hover:opacity-100"
            >
              <Twitter className="h-3 w-3" />
            </a>
          ) : null}
          {settings?.["linkedin_url"] ? (
            <a
              href={settings["linkedin_url"]}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="flex h-5 w-5 items-center justify-center text-primary-foreground opacity-80 transition-opacity hover:opacity-100"
            >
              <Linkedin className="h-3 w-3" />
            </a>
          ) : null}
          {settings?.["youtube_url"] ? (
            <a
              href={settings["youtube_url"]}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="flex h-5 w-5 items-center justify-center text-primary-foreground opacity-80 transition-opacity hover:opacity-100"
            >
              <Youtube className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ─── Main nav bar ─────────────────────────────────────────────────────── */
export function SiteHeader({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* close mobile menu on route change */
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Utility bar */}
      <UtilityBar settings={settings} />

      {/* White main nav */}
      <div
        className={cn(
          "w-full border-b transition-colors duration-300",
          scrolled || open
            ? "border-border bg-white shadow-sm"
            : "border-border bg-white",
        )}
      >
        <div className="container-page flex h-16 items-center gap-4">
          {/* Logo — left */}
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2.5"
            onClick={() => setOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center bg-amber font-display text-base font-bold text-primary-foreground">
              A
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-bold tracking-tight">
                AMARC
              </span>
              <span className="label-mono mt-0.5 block text-[9px] text-muted-foreground">
                Engineering &amp; Construction
              </span>
            </span>
          </Link>

          {/* Nav — centered (desktop) */}
          <nav
            className="hidden flex-1 items-center justify-center gap-0.5 lg:flex"
            aria-label="Primary"
          >
            {NAV.map((item) => {
              const isActive =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-amber text-primary-foreground"
                      : "text-foreground/75 hover:text-amber",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search icon — right (desktop) */}
          <button
            type="button"
            aria-label="Search"
            className="ml-auto hidden h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/60 transition-colors hover:border-amber hover:text-amber lg:flex"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-sm border border-border text-foreground lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-border bg-white lg:hidden"
          >
            <nav className="container-page flex flex-col py-4" aria-label="Mobile">
              {NAV.map((item) => {
                const isActive =
                  item.to === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "border-b border-border py-4 font-display text-xl font-semibold tracking-tight transition-colors",
                      isActive ? "text-amber" : "text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="mt-5 rounded-sm bg-amber px-4 py-3.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Request a quote
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
