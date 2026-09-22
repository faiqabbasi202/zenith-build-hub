import { useState, useEffect } from "react";
import { X, Loader2, Save, AlertCircle } from "lucide-react";
import { AdminImageInput } from "./admin-image-input";
import { AdminGalleryInput } from "./admin-gallery-input";
import type { TableConfig } from "./admin-tables-config";
import { validateRecord, sanitizeFormData, sanitizeSlug } from "@/lib/input-sanitizer";
import { asList } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TableConfig;
  initialData?: Record<string, any> | null;
  onSave: (formData: Record<string, any>) => Promise<void>;
}

export function AdminModal({
  isOpen,
  onClose,
  config,
  initialData,
  onSave,
}: AdminModalProps) {
  const isEdit = Boolean(initialData);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setErrors({});
    if (initialData) {
      const clone = { ...initialData };
      if (Array.isArray(clone["scope"])) {
        clone["scope"] = clone["scope"].join(", ");
      }
      if (clone["gallery"] !== undefined) {
        clone["gallery"] = asList(clone["gallery"]);
      }
      setFormData(clone);
    } else {
      const defaults: Record<string, any> = {};
      config.fields.forEach((f) => {
        if (f.type === "boolean") defaults[f.key] = true;
        else if (f.type === "number") defaults[f.key] = 0;
        else if (f.type === "gallery") defaults[f.key] = [];
        else if (f.type === "date") defaults[f.key] = null;
        else defaults[f.key] = "";
      });
      setFormData(defaults);
    }
  }, [initialData, config, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };

      // Auto-generate slug from title/name for new records if slug was empty or previously auto-derived
      if (!isEdit && (key === "title" || key === "name") && typeof value === "string") {
        const currentSlug = prev["slug"];
        const autoSlug = sanitizeSlug(value);
        if (!currentSlug || currentSlug === sanitizeSlug(prev[key])) {
          updated["slug"] = autoSlug;
        }
      }

      return updated;
    });

    // Clear error on edit
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Strict validation check
    const validationErrors = validateRecord(formData, config);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      // 2. Security sanitization (XSS stripping, URL normalization, trimming)
      const sanitized = sanitizeFormData(formData, config);
      // Absolute guard: Ensure all date and numeric fields never pass empty strings to Supabase
      for (const field of config.fields) {
        if (field.type === "date") {
          const v = sanitized[field.key];
          if (!v || (typeof v === "string" && v.trim() === "")) {
            sanitized[field.key] = null;
          }
        }
      }
      await onSave(sanitized);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="admin-portal fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-y-auto bg-slate-900/60 p-0 sm:p-6 backdrop-blur-xs"
      style={{
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontFeatureSettings: 'normal',
      }}
    >
      <div className="relative flex h-full sm:h-auto max-h-screen sm:max-h-[92vh] w-full max-w-3xl flex-col rounded-none sm:rounded-2xl border-0 sm:border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7 sm:py-5 bg-white">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              {isEdit ? `Edit ${config.title}` : `Create New ${config.title}`}
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Database Table: <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{config.key}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Error Banner if any */}
        {Object.keys(errors).length > 0 && (
          <div className="flex items-center gap-2.5 border-b border-red-200 bg-red-50 px-5 py-3 sm:px-7 text-xs sm:text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <span>Please correct the highlighted errors below before saving.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              {config.fields.map((field) => {
                const fullWidth =
                  field.type === "textarea" ||
                  field.type === "image" ||
                  field.type === "gallery" ||
                  field.key === "title" ||
                  field.key === "name" ||
                  field.key === "description";

                const fieldError = errors[field.key];

                const inputBaseCls = cn(
                  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-base sm:text-sm text-slate-900 shadow-xs outline-none transition dark:bg-slate-800 dark:text-white",
                  fieldError
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:focus:border-slate-300",
                );

              return (
                <div
                  key={field.key}
                  className={fullWidth ? "space-y-2 sm:col-span-2" : "space-y-2"}
                >
                  {field.type !== "image" && field.type !== "gallery" && (
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {field.label} {field.required && <span className="text-red-500 font-bold">*</span>}
                      </label>
                      {field.key === "slug" && !isEdit && (
                        <span className="text-xs text-slate-400 font-normal">Auto-generated</span>
                      )}
                    </div>
                  )}

                  {/* Text / URL / Email */}
                  {field.type === "text" && (
                    <input
                      type="text"
                      value={formData[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className={inputBaseCls}
                    />
                  )}

                  {/* Textarea */}
                  {field.type === "textarea" && (
                    <textarea
                      rows={4}
                      value={formData[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className={inputBaseCls}
                    />
                  )}

                  {/* Number */}
                  {field.type === "number" && (
                    <input
                      type="number"
                      value={formData[field.key] ?? ""}
                      onChange={(e) =>
                        handleChange(field.key, e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className={inputBaseCls}
                    />
                  )}

                  {/* Date */}
                  {field.type === "date" && (
                    <input
                      type="date"
                      value={formData[field.key] ? String(formData[field.key]).split("T")[0] : ""}
                      onChange={(e) => handleChange(field.key, e.target.value.trim() ? e.target.value.trim() : null)}
                      className={inputBaseCls}
                    />
                  )}

                  {/* Select */}
                  {field.type === "select" && (
                    <select
                      value={formData[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className={inputBaseCls}
                    >
                      <option value="">Select option</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Boolean Checkbox */}
                  {field.type === "boolean" && (
                    <div className="pt-2">
                      <label className="inline-flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(formData[field.key])}
                          onChange={(e) => handleChange(field.key, e.target.checked)}
                          className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-700"
                        />
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {field.label}
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Dedicated Image with Top-Notch Optimization */}
                  {field.type === "image" && (
                    <AdminImageInput
                      label={field.label}
                      value={formData[field.key]}
                      onChange={(url) => handleChange(field.key, url)}
                      categoryHint={field.categoryHint || formData["sector_slug"] || formData["category"]}
                    />
                  )}

                  {/* Multi-Image Gallery */}
                  {field.type === "gallery" && (
                    <AdminGalleryInput
                      label={field.label}
                      value={formData[field.key]}
                      onChange={(urls) => {
                        handleChange(field.key, urls);
                        if (!formData["cover_image_url"] && urls.length > 0) {
                          handleChange("cover_image_url", urls[0]);
                        }
                      }}
                      onSetCover={(url) => handleChange("cover_image_url", url)}
                      coverImageUrl={formData["cover_image_url"]}
                      categoryHint={field.categoryHint || formData["sector_slug"]}
                    />
                  )}

                  {/* Inline Error Message */}
                  {fieldError && (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {fieldError}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

          {/* Footer actions */}
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-200 p-4 sm:px-7 sm:py-5 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-amber px-5 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber/90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving changes…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? "Update Record" : "Save New Record"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

