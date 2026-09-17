import { Link } from "@tanstack/react-router";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ─── Container ─────────────────────────────────────────────────────────── */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("container-page", className)}>{children}</div>;
}

/* ─── Eyebrow ───────────────────────────────────────────────────────────── */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("label-mono flex items-center gap-2 text-amber", className)}>
      <span aria-hidden className="inline-block h-px w-6 bg-amber" />
      {children}
    </p>
  );
}

/* ─── SectionHead ───────────────────────────────────────────────────────── */
export function SectionHead({
  eyebrow,
  heading,
  subheading,
  align = "left",
  action,
}: {
  eyebrow?: string | null;
  heading?: string | null;
  subheading?: string | null;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow ? (
          <Eyebrow className={cn(align === "center" && "justify-center")}>{eyebrow}</Eyebrow>
        ) : null}
        {heading ? (
          <h2 className="mt-4 text-3xl leading-[1.05] font-semibold sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
        ) : null}
        {subheading ? (
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">{subheading}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ─── Action button / link ──────────────────────────────────────────────── */
type ActionProps = {
  children: ReactNode;
  to?: string;
  params?: Record<string, string>;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

const actionBase =
  "group inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 text-sm font-semibold tracking-tight transition-all duration-200 disabled:pointer-events-none disabled:opacity-60";

const actionVariants = {
  solid: "bg-amber text-primary-foreground hover:brightness-110 active:brightness-95",
  outline:
    "border border-border text-foreground hover:border-amber hover:text-amber bg-transparent",
  ghost: "text-foreground/80 hover:text-amber",
} as const;

export function Action({
  children,
  to,
  params,
  href,
  onClick,
  variant = "solid",
  className,
  type = "button",
  disabled,
}: ActionProps) {
  const classes = cn(actionBase, actionVariants[variant], className);
  if (to) {
    return (
      <Link to={to} params={params as never} className={classes}>
        {children}
        <ArrowGlyph />
      </Link>
    );
  }
  if (href) {
    return (
      <a
        href={href}
        className={classes}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}

function ArrowGlyph() {
  return (
    <span
      aria-hidden
      className="inline-block translate-x-0 transition-transform duration-200 group-hover:translate-x-1"
    >
      →
    </span>
  );
}

/* ─── Reveal (scroll-triggered fade-up) ────────────────────────────────── */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref as never}
      className={className}
      {...(reduce
        ? {}
        : {
            initial: { opacity: 0, y: 18 },
            animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
            transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
          })}
    >
      {children}
    </MotionTag>
  );
}

/* ─── Counter ───────────────────────────────────────────────────────────── */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setShown(value); return; }
    let frame = 0;
    const total = 60;
    const tick = () => {
      frame += 1;
      const t = 1 - Math.pow(1 - frame / total, 3);
      setShown(value * t);
      if (frame < total) requestAnimationFrame(tick);
      else setShown(value);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [inView, reduce, value]);

  const display =
    decimals > 0
      ? shown.toFixed(decimals)
      : Math.round(shown).toLocaleString("en-PK");

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ─── StatusChip ────────────────────────────────────────────────────────── */
export function StatusChip({ label }: { label: string }) {
  return (
    <span className="label-mono inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 text-foreground/80 backdrop-blur">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber" />
      {label}
    </span>
  );
}

/* ─── Hairline ──────────────────────────────────────────────────────────── */
export function Hairline({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}

/* ─── PageHero — centered light-grey textured banner ───────────────────── */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image?: string | null;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-border">
      {/* Background */}
      {image ? (
        <>
          <img
            src={image}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-surface/50" />
        </>
      ) : (
        <div aria-hidden className="hero-texture absolute inset-0" />
      )}

      {/* Content — centered */}
      <Container className="relative py-16 text-center md:py-24">
        <Reveal>
          <Eyebrow className="justify-center">{eyebrow}</Eyebrow>
          <h1 className="mt-5 text-3xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {intro ? (
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {intro}
            </p>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </Reveal>
      </Container>
    </header>
  );
}

/* ─── ProgressBar ───────────────────────────────────────────────────────── */
export function ProgressBar({
  label,
  value,
}: {
  label: string;
  value: number; // 0–100
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  return (
    <div ref={ref}>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium">{label}</span>
        <span className="label-mono text-amber">{value}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full bg-amber"
          initial={{ width: 0 }}
          animate={inView ? { width: `${value}%` } : { width: 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }
          }
        />
      </div>
    </div>
  );
}

/* ─── FeatureStory — photo + text split section ─────────────────────────── */
export function FeatureStory({
  eyebrow,
  heading,
  body,
  bars,
  ctaLabel,
  ctaHref,
  image,
  imageAlt,
  flip = false,
}: {
  eyebrow?: string;
  heading: string;
  body: string;
  bars?: { label: string; value: number }[];
  ctaLabel?: string;
  ctaHref?: string;
  image?: string | null;
  imageAlt?: string;
  flip?: boolean; // true = text left, photo right; false = photo left, text right (default false = text left)
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-10 md:grid-cols-2 lg:gap-16",
        flip && "md:[&>*:first-child]:order-2",
      )}
    >
      {/* Text side */}
      <Reveal>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
          {heading}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {body}
        </p>

        {bars && bars.length > 0 ? (
          <div className="mt-7 space-y-4">
            {bars.map((bar) => (
              <ProgressBar key={bar.label} label={bar.label} value={bar.value} />
            ))}
          </div>
        ) : null}

        {ctaLabel ? (
          <div className="mt-8">
            <Action href={ctaHref ?? "#"}>{ctaLabel}</Action>
          </div>
        ) : null}
      </Reveal>

      {/* Photo side */}
      <Reveal delay={0.1} className="order-first md:order-none">
        {image ? (
          <img
            src={image}
            alt={imageAlt ?? ""}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
        ) : (
          <div className="hero-texture aspect-[4/3] w-full rounded-sm" />
        )}
      </Reveal>
    </div>
  );
}

/* ─── IconCard ──────────────────────────────────────────────────────────── */
export function IconCard({
  icon,
  title,
  body,
  elevated = false,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  elevated?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-sm border border-border bg-background p-8 text-center transition-shadow",
        elevated && "md:shadow-lg md:shadow-black/8",
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber text-primary-foreground">
        {icon}
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

/* ─── IconCardGrid ──────────────────────────────────────────────────────── */
export function IconCardGrid({
  cards,
}: {
  cards: { icon: ReactNode; title: string; body: string }[];
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        <Reveal as="li" key={card.title} delay={(i % 3) * 0.07}>
          <IconCard
            icon={card.icon}
            title={card.title}
            body={card.body}
            elevated={i % 3 === 1} /* center column elevated on desktop */
          />
        </Reveal>
      ))}
    </ul>
  );
}
