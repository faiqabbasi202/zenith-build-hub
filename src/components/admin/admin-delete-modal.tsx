import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

interface AdminDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemName?: string;
  onConfirm: () => Promise<void>;
}

export function AdminDeleteModal({
  isOpen,
  onClose,
  title,
  itemName,
  onConfirm,
}: AdminDeleteModalProps) {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="admin-portal fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      style={{
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontFeatureSettings: 'normal',
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl">
        <div className="flex items-center gap-3.5 text-red-600">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 border border-red-100">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Delete {title}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Are you sure you want to permanently delete{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            "{itemName || "this record"}"
          </span>
          ? The item will be immediately removed from the live website and database.
        </div>

        <div className="mt-7 flex items-center justify-end gap-3.5">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting record…
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Record
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
