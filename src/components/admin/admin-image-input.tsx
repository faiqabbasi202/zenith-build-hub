import { useState, useRef } from "react";
import { Upload, RotateCcw, Image as ImageIcon, ChevronDown, Loader2, Sparkles, Link as LinkIcon, Check } from "lucide-react";
import { toast } from "sonner";

import { CATEGORY_HERO_IMAGES, CATEGORY_GALLERIES, type CategoryKey } from "@/lib/image-wiring";
import { optimizeImage, validateImageFile, formatBytes } from "@/lib/image-optimizer";
import { sanitizeUrl } from "@/lib/input-sanitizer";

interface AdminImageInputProps {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  categoryHint?: string;
}

const CATEGORY_PRESETS: { label: string; url: string }[] = [
  { label: "Residential (Hero)", url: CATEGORY_HERO_IMAGES.residential },
  { label: "Residential (Interior)", url: CATEGORY_GALLERIES.residential[1] || CATEGORY_HERO_IMAGES.residential },
  { label: "Commercial (Hero)", url: CATEGORY_HERO_IMAGES.commercial },
  { label: "Commercial (Exterior)", url: CATEGORY_GALLERIES.commercial[1] || CATEGORY_HERO_IMAGES.commercial },
  { label: "Renovation (Hero)", url: CATEGORY_HERO_IMAGES.renovation },
  { label: "Real Estate (Dusk)", url: CATEGORY_HERO_IMAGES["real-estate"] },
  { label: "Careers (Culture)", url: CATEGORY_HERO_IMAGES.careers },
  { label: "About (Campus)", url: CATEGORY_HERO_IMAGES.about },
];

export function AdminImageInput({
  label,
  value,
  onChange,
  categoryHint,
}: AdminImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [qualityMode, setQualityMode] = useState<"top_notch" | "ultra">("top_notch");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [optStats, setOptStats] = useState<{
    original: string;
    optimized: string;
    savings: number;
    resolution: string;
  } | null>(null);

  // Match category default if categoryHint is provided
  const categoryDefaultUrl =
    categoryHint && categoryHint in CATEGORY_HERO_IMAGES
      ? CATEGORY_HERO_IMAGES[categoryHint as CategoryKey]
      : CATEGORY_HERO_IMAGES.commercial;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input element value so the same file can be re-selected if desired
    e.target.value = "";

    // 1. Strict security check & format validation
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file format.");
      return;
    }

    // 2. High-fidelity top-notch automatic compression
    setIsOptimizing(true);
    try {
      const targetQuality = qualityMode === "ultra" ? 0.98 : 0.95;
      const result = await optimizeImage(file, {
        quality: targetQuality,
        maxDimension: 3840, // 3840px for full 4K ultra-high-definition architectural details
      });

      onChange(result.dataUrl);
      setOptStats({
        original: formatBytes(result.originalSize),
        optimized: formatBytes(result.optimizedSize),
        savings: result.savingsPercent,
        resolution: `${result.dimensions.width}×${result.dimensions.height}`,
      });

      toast.success(
        `Top-notch image processed: ${formatBytes(result.originalSize)} → ${formatBytes(result.optimizedSize)} at ${result.dimensions.width}×${result.dimensions.height}.`,
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to optimize image.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSetCategoryDefault = (url?: string) => {
    const targetUrl = url || categoryDefaultUrl;
    onChange(targetUrl);
    setShowPresets(false);
    setOptStats(null);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    const clean = sanitizeUrl(customUrl);
    onChange(clean);
    setShowUrlInput(false);
    setOptStats(null);
    toast.success("Image URL updated.");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Fidelity:</span>
          <button
            type="button"
            onClick={() => setQualityMode((prev) => (prev === "top_notch" ? "ultra" : "top_notch"))}
            className="inline-flex items-center gap-1 rounded bg-amber/10 px-1.5 py-0.5 text-[10px] font-medium text-amber transition hover:bg-amber/20"
            title="Toggle between Top-Notch (95%) and Ultra Fidelity (98%)"
          >
            <Sparkles className="h-3 w-3" />
            {qualityMode === "ultra" ? "Ultra (98%)" : "Top Notch (95%)"}
          </button>
        </div>
      </div>

      {/* Preview box */}
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="relative flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-200 dark:border-slate-700 dark:bg-slate-800">
            {value ? (
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-7 w-7 text-slate-400" />
            )}
            {isOptimizing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-xs text-slate-600 dark:text-slate-400">
              {value ? (value.startsWith("data:") ? "High-res data:image/webp" : value) : "No image selected"}
            </p>

            {/* Optimization metrics badge */}
            {optStats && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
                  <Sparkles className="h-3 w-3" />
                  Top-Notch WebP: {optStats.original} → {optStats.optimized} (-{optStats.savings}%) • {optStats.resolution}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isOptimizing}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {isOptimizing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
                ) : (
                  <Upload className="h-3.5 w-3.5 text-slate-500" />
                )}
                {isOptimizing ? "Optimizing…" : "Upload photo"}
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <LinkIcon className="h-3.5 w-3.5 text-slate-500" />
                Paste URL
              </button>

              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => handleSetCategoryDefault()}
                  className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                  Use preset
                </button>

                <button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  className="ml-0.5 rounded border border-slate-300 bg-white p-1 text-xs text-slate-600 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  title="Choose specific category default"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>

                {showPresets && (
                  <div className="absolute left-0 z-50 mt-1 w-56 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Category Presets
                    </div>
                    {CATEGORY_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleSetCategoryDefault(preset.url)}
                        className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <span>{preset.label}</span>
                        <span className="text-[10px] text-slate-400">Apply</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOptStats(null);
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Custom URL Input Panel */}
        {showUrlInput && (
          <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
            <input
              type="text"
              placeholder="https://... or /images/..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-amber dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="button"
              onClick={handleApplyCustomUrl}
              className="inline-flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              <Check className="h-3.5 w-3.5" />
              Apply
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}

