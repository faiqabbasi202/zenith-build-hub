import { useState, useEffect } from "react";
import { X, Loader2, Save, AlertCircle } from "lucide-react";
import { AdminImageInput } from "./admin-image-input";
import type { TableConfig } from "./admin-tables-config";
import { validateRecord, sanitizeFormData, sanitizeSlug } from "@/lib/input-sanitizer";
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
      setFormData({ ...initialData });
    } else {
      const defaults: Record<string, any> = {};
      config.fields.forEach((f) => {
        if (f.type === "boolean") defaults[f.key] = true;
        else if (f.type === "number") defaults[f.key] = 0;
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
      await onSave(sanitized);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {isEdit ? `Edit ${config.title}` : `Create New ${config.title}`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Table: <span className="font-mono">{config.key}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Error Banner if any */}
        {Object.keys(errors).length > 0 && (
          <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-6 py-2.5 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Please correct the highlighted fields before saving.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {config.fields.map((field) => {
              const fullWidth =
                field.type === "textarea" ||
                field.type === "image" ||
                field.key === "title" ||
                field.key === "name" ||
                field.key === "description";

              const fieldError = errors[field.key];

              const inputBaseCls = cn(
                "w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition dark:bg-slate-800 dark:text-white",
                fieldError
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:focus:border-slate-300",
              );

              return (
                <div
                  key={field.key}
                  className={fullWidth ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}
                >
                  {field.type !== "image" && (
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.key === "slug" && !isEdit && (
                        <span className="text-[10px] text-slate-400">Auto-generated</span>
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
                      rows={3}
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
                      onChange={(e) => handleChange(field.key, e.target.value)}
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
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(formData[field.key])}
                          onChange={(e) => handleChange(field.key, e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-700"
                        />
                        <span className="text-xs text-slate-700 dark:text-slate-300">
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

                  {/* Inline Error Message */}
                  {fieldError && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {fieldError}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? "Update Record" : "Create Record"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

