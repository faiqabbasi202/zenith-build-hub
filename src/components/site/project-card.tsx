import { Link } from "@tanstack/react-router";

import { pkr, statusLabel } from "@/lib/format";

import { StatusChip } from "./primitives";

export function ProjectCard({ project }: { project: Record<string, any> }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="group block h-full overflow-hidden border border-border bg-surface transition-colors hover:border-amber/60"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        {project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute top-4 left-4">
          <StatusChip label={statusLabel(project.status)} />
        </div>
      </div>
      <div className="p-6">
        <p className="label-mono text-muted-foreground">
          {project.city}
          {project.sector_slug ? ` · ${String(project.sector_slug).replace(/-/g, " ")}` : ""}
        </p>
        <h3 className="mt-3 font-display text-lg leading-snug font-semibold transition-colors group-hover:text-amber">
          {project.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{project.summary}</p>
        {project.value_pkr_millions ? (
          <p className="label-mono mt-5 text-amber">{pkr(project.value_pkr_millions)}</p>
        ) : null}
      </div>
    </Link>
  );
}
