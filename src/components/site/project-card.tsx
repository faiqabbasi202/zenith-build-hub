import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Maximize2 } from "lucide-react";

import { pkr, statusLabel } from "@/lib/format";
import { ImageLightbox } from "./image-lightbox";
import { StatusChip } from "./primitives";

export function ProjectCard({ project }: { project: Record<string, any> }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const coverImg = project["cover_image_url"] || "";

  return (
    <>
      <div className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-lg border border-border/80 bg-surface shadow-xs transition-all duration-300 md:hover:-translate-y-1 md:hover:border-amber/60 md:hover:shadow-xl">
        {/* Clickable Image Showcase — generous height and object-top to preserve tower tops */}
        <div className="relative h-64 w-full shrink-0 overflow-hidden bg-slate-950 sm:h-72 md:h-80">
          {coverImg ? (
            <>
              {/* Ambient atmospheric backdrop */}
              <div
                className="absolute inset-0 scale-110 bg-cover bg-center opacity-25 blur-lg"
                style={{ backgroundImage: `url(${coverImg})` }}
              />
              {/* Crisp Main Photo — object-cover object-top prevents cropping building crowns */}
              <img
                src={coverImg}
                alt={project["title"] ?? "AMARC Project"}
                loading="lazy"
                decoding="async"
                className="relative h-full w-full object-cover object-top transition-transform duration-700 md:group-hover:scale-105"
              />
            </>
          ) : (
            <div className="hero-texture h-full w-full" />
          )}

          {/* Bottom subtle shade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <StatusChip label={statusLabel(project["status"])} />
          </div>

          {/* Quick Uncropped Lightbox Action */}
          {coverImg && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setLightboxOpen(true);
              }}
              title="View full uncropped photo"
              aria-label="View full uncropped photo"
              className="absolute top-3.5 right-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-sm transition hover:scale-110 hover:bg-amber hover:text-slate-950 shadow-md"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Tap-through overlay link for image area */}
          <Link
            to="/projects/$slug"
            params={{ slug: project["slug"] }}
            className="absolute inset-0 z-10"
            aria-label={`View ${project["title"]}`}
          />
        </div>

        {/* Text Content */}
        <Link
          to="/projects/$slug"
          params={{ slug: project["slug"] }}
          className="flex flex-1 flex-col p-4 sm:p-5"
        >
          <p className="label-mono text-[11px] text-muted-foreground sm:text-xs">
            {project["city"]}
            {project["sector_slug"] ? ` · ${String(project["sector_slug"]).replace(/-/g, " ")}` : ""}
          </p>
          <h2 className="mt-2 font-display text-base font-bold leading-snug tracking-tight text-foreground transition-colors sm:text-lg md:group-hover:text-amber">
            {project["title"]}
          </h2>
          <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {project["summary"]}
          </p>
          {project["value_pkr_millions"] ? (
            <p className="label-mono mt-3 text-xs font-semibold text-amber sm:text-sm">
              {pkr(project["value_pkr_millions"])}
            </p>
          ) : null}
        </Link>
      </div>

      {/* Lightbox Modal */}
      {coverImg && (
        <ImageLightbox
          images={[coverImg]}
          initialIndex={0}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          title={project["title"]}
          caption={project["summary"]}
        />
      )}
    </>
  );
}

