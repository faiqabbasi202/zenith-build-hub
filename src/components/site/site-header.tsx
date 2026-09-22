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
  ArrowRight,
  Building,
  Layers,
  FileText,
  Users,
  Compass,
  Briefcase,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Settings = Record<string, any> | null;

const NAV = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Real Estate", to: "/real-estate" },
  { label: "About", to: "/about" },
  { label: "Insights", to: "/insights" },
  { label: "Careers", to: "/careers" },
  { label: "Contact", to: "/contact" },
];

/* ─── Architectural Logo Icon ─────────────────────────────────────────── */
function AmarcBrandLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Brand Logo Emblem */}
      <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center">
        <img
          src="/logo.png?v=4"
          alt="AMARC Logo"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Brand Typographic Wordmark */}
      <div className="leading-tight">
        <span className="block font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          AMARC
        </span>
        <span className="block font-mono text-[8.5px] sm:text-[9.5px] font-medium tracking-[0.2em] text-slate-500 uppercase">
          Engineering &amp; Construction
        </span>
      </div>
    </div>
  );
}

/* ─── Refined Dark Obsidian Utility Strip ──────────────────────────────── */
function UtilityBar({ settings }: { settings: Settings }) {
  const email = settings?.["email"] || "info@amarc.com.pk";
  const phone = settings?.["phone"] || "+92 42 3577 8800";
  const officeHours = settings?.["office_hours"] || "Office Hours: 9:00 AM – 6:00 PM (Mon – Sat)";

  return (
    <div className="w-full border-b border-white/10 bg-slate-950 text-slate-300">
      <div className="container-page flex items-center justify-between py-2 text-xs">
        {/* Direct Contact Points */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-1.5 text-slate-300 hover:text-amber transition-colors font-medium"
          >
            <Mail className="h-3.5 w-3.5 text-amber" aria-hidden />
            <span>{email}</span>
          </a>
          <span className="hidden sm:inline-block text-slate-700">|</span>
          <a
            href={`tel:${String(phone).replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 text-slate-300 hover:text-amber transition-colors font-medium"
          >
            <Phone className="h-3.5 w-3.5 text-amber" aria-hidden />
            <span>{phone}</span>
          </a>
          <span className="hidden md:inline-block text-slate-700">|</span>
          <span className="hidden md:flex items-center gap-1.5 text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            <span>{officeHours}</span>
          </span>
        </div>

        {/* Right side: Portal quick link & Socials */}
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-400 hover:text-amber transition"
          >
            <Shield className="h-3 w-3 text-amber" />
            Admin Portal
          </Link>

          <div className="flex items-center gap-2.5 border-l border-white/10 pl-3">
            {settings?.["facebook_url"] && (
              <a
                href={settings["facebook_url"]}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-slate-400 hover:text-amber transition-colors"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
            )}
            {settings?.["twitter_url"] && (
              <a
                href={settings["twitter_url"]}
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="text-slate-400 hover:text-amber transition-colors"
              >
                <Twitter className="h-3.5 w-3.5" />
              </a>
            )}
            <a
              href={settings?.["linkedin_url"] || "https://linkedin.com"}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-slate-400 hover:text-amber transition-colors"
            >
              <Linkedin className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Modern Architectural Header ─────────────────────────────────── */
export function SiteHeader({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Sleek Dark Obsidian Utility Strip */}
      <UtilityBar settings={settings} />

      {/* Frosted Glass Navigation Bar */}
      <div
        className={cn(
          "w-full transition-all duration-300 border-b",
          scrolled || open
            ? "border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95 shadow-md backdrop-blur-md"
            : "border-slate-200/60 bg-white/90 dark:border-slate-800/80 dark:bg-slate-950/90 backdrop-blur-sm"
        )}
      >
        <div className="container-page flex h-18 sm:h-20 items-center justify-between gap-4">
          {/* Logo — Left */}
          <Link
            to="/"
            className="group flex items-center shrink-0"
            onClick={() => setOpen(false)}
          >
            <AmarcBrandLogo />
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden flex-1 items-center justify-center gap-1 xl:gap-2 lg:flex"
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
                    "relative px-3.5 py-2 text-sm font-semibold tracking-tight transition-colors duration-200",
                    isActive
                      ? "text-slate-950 dark:text-white"
                      : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                  )}
                >
                  {item.label}
                  {/* Understated Amber Line for active route */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 inset-x-3.5 h-0.5 rounded-full bg-amber"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden items-center gap-3 lg:flex shrink-0">
            {/* Direct Project Proposal CTA Button */}
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-amber hover:text-slate-950 hover:shadow-lg dark:bg-amber dark:text-slate-950 dark:hover:bg-amber/90"
            >
              <span>Get an Estimate</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-amber px-3 py-1.5 text-xs font-extrabold text-slate-950 shadow-xs"
            >
              Quote
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition hover:bg-slate-200"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Full-Screen Modern Drawer ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-x-0 top-[115px] bottom-0 z-40 overflow-y-auto bg-slate-950/98 backdrop-blur-xl text-white border-b border-white/10 lg:hidden flex flex-col justify-between p-6"
          >
            {/* Categorized Mobile Navigation */}
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  Navigation
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
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
                        "flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold tracking-tight transition-all",
                        isActive
                          ? "bg-amber text-slate-950 shadow-md font-black"
                          : "bg-white/5 text-slate-200 hover:bg-white/10"
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className={cn("h-4 w-4", isActive ? "text-slate-950" : "text-slate-500")} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile Contact Dock & Quick CTA */}
            <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${String(settings?.["phone"] || "+924235778800").replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-xs font-bold text-white hover:bg-white/15 transition"
                >
                  <Phone className="h-4 w-4 text-amber" />
                  Call Direct
                </a>
                <a
                  href={`mailto:${settings?.["email"] || "info@amarc.com.pk"}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-xs font-bold text-white hover:bg-white/15 transition"
                >
                  <Mail className="h-4 w-4 text-amber" />
                  Email Team
                </a>
              </div>

              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber py-3.5 text-center text-sm font-extrabold text-slate-950 shadow-lg transition active:scale-[0.99]"
              >
                <span>Request Project Proposal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="text-center">
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-amber transition"
                >
                  <Shield className="h-3.5 w-3.5 text-amber" />
                  Staff Administrator Portal
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
