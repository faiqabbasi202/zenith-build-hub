import { Link } from "@tanstack/react-router";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("container-page", className)}>{children}</div>;
}

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
        {eyebrow ? <Eyebrow className={cn(align === "center" && "justify-center")}>{eyebrow}</Eyebrow> : null}
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
      <a href={href} className={classes} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
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
      initial={reduce ? undefined : { opacity: 0, y: 18 }}
      animate={inView || reduce ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

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
    if (reduce) {
      setShown(value);
      return;
    }
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

export function StatusChip({ label }: { label: string }) {
  return (
    <span className="label-mono inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 text-foreground/80 backdrop-blur">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber" />
      {label}
    </span>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}

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
    <header className="relative overflow-hidden border-b border-border bg-surface">
      {image ? (
        <>
          <img
            src={image}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
        </>
      ) : (
        <div aria-hidden className="rule-grid absolute inset-0 opacity-40" />
      )}
      <Container className="relative py-20 md:py-28">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl text-4xl leading-[1.02] font-semibold sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">{intro}</p>
        ) : null}
        {children}
      </Container>
    </header>
  );
}
