import { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import { AdminImageInput } from "./admin-image-input";
import type { TableConfig, FieldConfig } from "./admin-tables-config";

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
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
  }, [initialData, config]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {config.fields.map((field) => {
              const fullWidth =
                field.type === "textarea" ||
                field.type === "image" ||
                field.key === "title" ||
                field.key === "name" ||
                field.key === "description";

              return (
                <div
                  key={field.key}
                  className={fullWidth ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
                >
                  {field.type !== "image" && (
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                  )}

                  {/* Text / URL / Email */}
                  {field.type === "text" && (
                    <input
                      type="text"
                      required={field.required}
                      value={formData[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-300"
                    />
                  )}

                  {/* Textarea */}
                  {field.type === "textarea" && (
                    <textarea
                      rows={3}
                      required={field.required}
                      value={formData[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-300"
                    />
                  )}

                  {/* Number */}
                  {field.type === "number" && (
                    <input
                      type="number"
                      value={formData[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value === "" ? null : Number(e.target.value))}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-300"
                    />
                  )}

                  {/* Date */}
                  {field.type === "date" && (
                    <input
                      type="date"
                      value={formData[field.key] ? String(formData[field.key]).split("T")[0] : ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-300"
                    />
                  )}

                  {/* Select */}
                  {field.type === "select" && (
                    <select
                      value={formData[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-300"
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

                  {/* Dedicated Image with Upload New & Category Default */}
                  {field.type === "image" && (
                    <AdminImageInput
                      label={field.label}
                      value={formData[field.key]}
                      onChange={(url) => handleChange(field.key, url)}
                      categoryHint={field.categoryHint || formData["sector_slug"] || formData["category"]}
                    />
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
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
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
