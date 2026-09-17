import { useState, useRef } from "react";
import { Upload, RotateCcw, Image as ImageIcon, ChevronDown } from "lucide-react";
import { CATEGORY_HERO_IMAGES, CATEGORY_GALLERIES, type CategoryKey } from "@/lib/image-wiring";

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

  // Match category default if categoryHint is provided
  const categoryDefaultUrl =
    (categoryHint && (categoryHint in CATEGORY_HERO_IMAGES))
      ? CATEGORY_HERO_IMAGES[categoryHint as CategoryKey]
      : CATEGORY_HERO_IMAGES.commercial;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to local preview Data URL (replaces ONLY this record's image)
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSetCategoryDefault = (url?: string) => {
    const targetUrl = url || categoryDefaultUrl;
    onChange(targetUrl);
    setShowPresets(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        {label}
      </label>

      {/* Preview box */}
      <div className="flex items-center gap-4 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-200 dark:border-slate-700 dark:bg-slate-800">
          {value ? (
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="truncate text-xs font-mono text-slate-600 dark:text-slate-400">
            {value ? value : "No image selected"}
          </p>

          {/* Action buttons: Upload new & Use category default side-by-side */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              Upload new
            </button>

            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => handleSetCategoryDefault()}
                className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                Use category default
              </button>

              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="ml-0.5 rounded border border-slate-300 bg-white p-1 text-xs text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                title="Choose specific category default"
              >
                <ChevronDown className="h-3 w-3" />
              </button>

              {showPresets && (
                <div className="absolute left-0 z-50 mt-1 w-56 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Category Defaults
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
                onClick={() => onChange("")}
                className="text-xs text-red-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}
