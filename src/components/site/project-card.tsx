import { Link } from "@tanstack/react-router";

import { pkr, statusLabel } from "@/lib/format";

import { StatusChip } from "./primitives";

export function ProjectCard({ project }: { project: Record<string, any> }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project["slug"] }}
      className="group flex flex-col overflow-hidden border border-border bg-surface transition-colors hover:border-amber/60"
    >
      {/* Image — fixed height, no aspect-ratio tricks that can collapse on Android */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-56">
        {project["cover_image_url"] ? (
          <img
            src={project["cover_image_url"]}
            alt={project["title"] ?? "AMARC Project"}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="hero-texture h-full w-full" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute top-3 left-3 z-10">
          <StatusChip label={statusLabel(project["status"])} />
        </div>
      </div>

      {/* Text content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="label-mono text-muted-foreground">
          {project["city"]}
          {project["sector_slug"] ? ` · ${String(project["sector_slug"]).replace(/-/g, " ")}` : ""}
        </p>
        <h2 className="mt-2 font-display text-base font-semibold leading-snug transition-colors group-hover:text-amber">
          {project["title"]}
        </h2>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{project["summary"]}</p>
        {project["value_pkr_millions"] ? (
          <p className="label-mono mt-3 text-amber">{pkr(project["value_pkr_millions"])}</p>
        ) : null}
      </div>
    </Link>
  );
}

