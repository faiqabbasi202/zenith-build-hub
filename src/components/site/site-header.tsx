import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const NAV = [
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects" },
  { label: "Real Estate", to: "/real-estate" },
  { label: "About", to: "/about" },
  { label: "Insights", to: "/insights" },
  { label: "Careers", to: "/careers" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader({ phone }: { phone?: string | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        scrolled || open
          ? "border-border bg-white/90 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-18 items-center justify-between gap-6 py-4">
        <Link to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center bg-amber font-display text-base font-bold text-primary-foreground">
            A
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg font-bold tracking-tight">AMARC</span>
            <span className="label-mono mt-1 block text-[9px] text-muted-foreground">
              Engineering &amp; Construction
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-sm px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-amber"
              activeProps={{ className: "text-amber" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="label-mono flex items-center gap-2 text-foreground/70 transition-colors hover:text-amber"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {phone}
            </a>
          ) : null}
          <Link
            to="/contact"
            className="rounded-sm bg-amber px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
          >
            Request a quote
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-border lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <nav className="container-page flex flex-col py-4" aria-label="Mobile">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-4 font-display text-xl font-semibold tracking-tight"
                  activeProps={{ className: "text-amber" }}
                >
                  {item.label}
                </Link>
              ))}
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
