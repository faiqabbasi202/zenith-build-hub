import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  caption?: string;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  title,
  caption,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Sync index when initialIndex or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
      setIsZoomed(false);
      setIsLoading(true);
      setHasError(false);
    }
  }, [isOpen, initialIndex, images.length]);

  const currentSrc = images[currentIndex] || "";

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setIsLoading(true);
    setHasError(false);
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setIsLoading(true);
    setHasError(false);
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll while lightbox is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/92 backdrop-blur-md text-white transition-opacity duration-200"
      onClick={onClose}
    >
      {/* ── Top Bar Controls */}
      <div
        className="flex w-full items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-slate-950/60 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex-1 pr-4">
          {title && <h3 className="truncate text-sm sm:text-base font-bold text-white">{title}</h3>}
          {caption && (
            <p className="truncate text-xs text-slate-400 font-medium">{caption}</p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Image Counter */}
          {images.length > 1 && (
            <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-slate-300 font-semibold tracking-wider">
              {currentIndex + 1} / {images.length}
            </span>
          )}

          {/* Zoom Toggle */}
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
            title={isZoomed ? "Fit to screen" : "Zoom in"}
          >
            {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          </button>

          {/* Open Original in New Tab */}
          <a
            href={currentSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
            title="Open raw image in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-red-600 transition"
            title="Close viewer (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Center Stage: Auto-sized Responsive Image */}
      <div
        className="relative flex flex-1 w-full items-center justify-center overflow-hidden p-2 sm:p-6"
        onClick={onClose}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-amber" />
          </div>
        )}

        {/* Previous Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:left-6 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-amber hover:text-slate-950 shadow-xl transition backdrop-blur-xs"
            title="Previous image (Left Arrow)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Main Image Container */}
        <div
          className="flex h-full w-full items-center justify-center overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {hasError ? (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-900/60 rounded-xl border border-white/10">
              <ImageIcon className="h-12 w-12 text-slate-500 mb-3" />
              <p className="text-sm font-semibold text-slate-300">Unable to load full-size photo</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">{currentSrc}</p>
            </div>
          ) : (
            <img
              key={currentSrc}
              src={currentSrc}
              alt={title || `Photo ${currentIndex + 1}`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              style={{
                // Automatic sizing according to desktop and window dimensions:
                // Perfectly bounded by viewport, keeping natural aspect ratio
                maxHeight: isZoomed ? "none" : "80vh",
                maxWidth: isZoomed ? "none" : "90vw",
              }}
              className={`select-none rounded-lg shadow-2xl transition-all duration-300 ${
                isZoomed
                  ? "cursor-zoom-out object-none"
                  : "cursor-zoom-in object-contain w-auto h-auto"
              } ${isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          )}
        </div>

        {/* Next Arrow */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:right-6 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-amber hover:text-slate-950 shadow-xl transition backdrop-blur-xs"
            title="Next image (Right Arrow)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* ── Bottom Filmstrip Thumbnail Bar */}
      {images.length > 1 && (
        <div
          className="flex w-full justify-center overflow-x-auto p-3 sm:p-4 bg-slate-950/80 border-t border-white/10 z-20 gap-2 sm:gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={img + idx}
              type="button"
              onClick={() => {
                setIsLoading(true);
                setHasError(false);
                setIsZoomed(false);
                setCurrentIndex(idx);
              }}
              className={`relative h-14 w-20 sm:h-16 sm:w-24 shrink-0 overflow-hidden rounded-md border-2 transition ${
                idx === currentIndex
                  ? "border-amber ring-2 ring-amber/40 scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
