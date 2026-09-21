import { Link } from "@tanstack/react-router";

import { pkr, statusLabel } from "@/lib/format";

import { ResponsiveImage } from "./responsive-image";
import { StatusChip } from "./primitives";

export function ProjectCard({ project }: { project: Record<string, any> }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project["slug"] }}
      className="group flex h-full flex-col overflow-hidden border border-border bg-surface transition-colors hover:border-amber/60"
    >
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: "75%" }}>
        <ResponsiveImage
          src={project["cover_image_url"]}
          alt={project["title"] ?? "AMARC Project"}
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="absolute top-4 left-4 z-10">
          <StatusChip label={statusLabel(project["status"])} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="label-mono text-muted-foreground">
          {project["city"]}
          {project["sector_slug"] ? ` · ${String(project["sector_slug"]).replace(/-/g, " ")}` : ""}
        </p>
        <h2 className="mt-2 font-display text-base leading-snug font-semibold transition-colors group-hover:text-amber sm:text-lg">
          {project["title"]}
        </h2>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{project["summary"]}</p>
        {project["value_pkr_millions"] ? (
          <p className="label-mono mt-4 text-amber">{pkr(project["value_pkr_millions"])}</p>
        ) : null}
      </div>
    </Link>
  );
}
