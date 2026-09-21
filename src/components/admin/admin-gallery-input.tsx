import { useState, useRef } from "react";
import {
  Upload,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { CATEGORY_GALLERIES, CATEGORY_HERO_IMAGES, type CategoryKey } from "@/lib/image-wiring";
import { optimizeImage, validateImageFile } from "@/lib/image-optimizer";
import { sanitizeUrl } from "@/lib/input-sanitizer";
import { ImageLightbox } from "@/components/site/image-lightbox";

interface AdminGalleryInputProps {
  label: string;
  value?: string[] | null;
  onChange: (urls: string[]) => void;
  onSetCover?: (url: string) => void;
  coverImageUrl?: string | null;
  categoryHint?: string;
}

export function AdminGalleryInput({
  label,
  value = [],
  onChange,
  onSetCover,
  coverImageUrl,
  categoryHint,
}: AdminGalleryInputProps) {
  const images = Array.isArray(value) ? value : [];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  // Lightbox preview state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Handle batch file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = ""; // Reset input

    setIsUploading(true);
    const validFiles: File[] = [];
    for (const f of files) {
      const v = validateImageFile(f);
      if (v.valid) validFiles.push(f);
      else toast.error(`${f.name}: ${v.error}`);
    }

    if (!validFiles.length) {
      setIsUploading(false);
      return;
    }

    try {
      toast.info(`Processing ${validFiles.length} photo${validFiles.length > 1 ? "s" : ""}...`);
      const results: string[] = [];

      for (const file of validFiles) {
        const optimized = await optimizeImage(file, {
          quality: 0.95,
          maxDimension: 3840, // 4K resolution support
        });
        results.push(optimized.dataUrl);
      }

      const updated = [...images, ...results];
      onChange(updated);

      // Auto-set cover image if none was set
      if (!coverImageUrl && results.length > 0 && results[0] && onSetCover) {
        onSetCover(results[0]);
      }

      toast.success(`Successfully added ${results.length} high-res photo${results.length > 1 ? "s" : ""} to gallery.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to process gallery images.");
    } finally {
      setIsUploading(false);
    }
  };

  // Add custom URL
  const handleAddUrl = () => {
    if (!customUrl.trim()) return;
    const clean = sanitizeUrl(customUrl);
    if (!clean) {
      toast.error("Please enter a valid URL or path.");
      return;
    }
    const updated = [...images, clean];
    onChange(updated);
    if (!coverImageUrl && onSetCover) {
      onSetCover(clean);
    }
    setCustomUrl("");
    setShowUrlInput(false);
    toast.success("Image added to gallery.");
  };

  // Add preset gallery images
  const handleAddPreset = (url: string) => {
    if (images.includes(url)) {
      toast.info("Image already in gallery.");
      return;
    }
    const updated = [...images, url];
    onChange(updated);
    if (!coverImageUrl && onSetCover) {
      onSetCover(url);
    }
    setShowPresetPicker(false);
    toast.success("Preset image added to gallery.");
  };

  // Remove image
  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    toast.info("Photo removed from gallery.");
  };

  // Move image (reorder)
  const handleMove = (index: number, direction: "left" | "right") => {
    const newIdx = direction === "left" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const copy = [...images];
    const item = copy[index]!;
    copy[index] = copy[newIdx]!;
    copy[newIdx] = item;
    onChange(copy);
  };

  // Set as Cover
  const handleSetCover = (url: string) => {
    if (onSetCover) {
      onSetCover(url);
      toast.success("Selected as project cover image.");
    }
  };

  // Open Lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            {label}
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add multiple pictures. Click any picture to view in full size.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber px-3 py-1.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-amber/90 transition disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {isUploading ? "Processing..." : "Add Photos"}
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <LinkIcon className="h-3.5 w-3.5 text-slate-500" />
            Paste URL
          </button>

          <button
            type="button"
            onClick={() => setShowPresetPicker(!showPresetPicker)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-slate-500" />
            Presets
          </button>
        </div>
      </div>

      {/* URL input drawer */}
      {showUrlInput && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900">
          <input
            type="text"
            placeholder="https://... or /images/..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Add
          </button>
        </div>
      )}

      {/* Preset Picker Drawer */}
      {showPresetPicker && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Presets from Library
            </span>
            <button
              type="button"
              onClick={() => setShowPresetPicker(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(CATEGORY_GALLERIES).flatMap(([cat, catImages]) =>
              (catImages as string[]).filter(Boolean).map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => handleAddPreset(src)}
                  className="group relative h-16 overflow-hidden rounded-md border border-slate-200 hover:border-amber transition dark:border-slate-700"
                >
                  <img src={src} alt={cat} className="h-full w-full object-cover group-hover:scale-105 transition" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[9px] text-white capitalize truncate">
                    {cat} {i + 1}
                  </span>
                </button>
              )),
            )}
          </div>
        </div>
      )}

      {/* Images Grid */}
      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-amber hover:bg-amber/5 transition dark:border-slate-700 dark:bg-slate-900/50"
        >
          <ImageIcon className="h-9 w-9 text-slate-400 mb-2" />
          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
            No gallery photos added yet
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Click here to upload multiple photos, or use the buttons above
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((src, idx) => {
            const isCover = coverImageUrl === src || (!coverImageUrl && idx === 0);
            return (
              <div
                key={src + idx}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Image preview with click to view full */}
                <div
                  className="relative aspect-4/3 cursor-pointer overflow-hidden bg-slate-200 dark:bg-slate-800"
                  onClick={() => openLightbox(idx)}
                  title="Click to view full picture of perfect size"
                >
                  <img
                    src={src}
                    alt={`Photo ${idx + 1}`}
                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                    <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
                  </div>

                  {isCover && (
                    <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-amber px-2 py-0.5 text-[10px] font-extrabold text-slate-950 shadow-sm">
                      <Star className="h-3 w-3 fill-slate-950" />
                      COVER
                    </span>
                  )}
                </div>

                {/* Card footer controls */}
                <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "left")}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-700"
                      title="Move left"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, "right")}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-700"
                      title="Move right"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isCover && onSetCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(src)}
                        className="rounded p-1 text-xs text-slate-500 hover:text-amber dark:hover:text-amber"
                        title="Set as Cover photo"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      title="Delete photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox for instant full-size responsive inspection */}
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title="Project Gallery Preview"
      />
    </div>
  );
}
