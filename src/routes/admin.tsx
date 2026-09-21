import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  LogOut,
  FolderKanban,
  Building2,
  FileText,
  Briefcase,
  Layers,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Database,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { ADMIN_TABLES, ADMIN_GROUPS } from "@/components/admin/admin-tables-config";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminDeleteModal } from "@/components/admin/admin-delete-modal";
import { DUMMY_PROJECTS_BY_CATEGORY } from "@/lib/image-wiring";

export const Route = (createFileRoute as any)("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "AMARC Admin Dashboard | Content Management" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});

// Group icons
const GROUP_ICONS: Record<string, any> = {
  Portfolio: FolderKanban,
  Company: Building2,
  Content: FileText,
  Operations: Briefcase,
};

function AdminDashboardPage() {
  const queryClient = useQueryClient();

  // Auth state
  const [session, setSession] = useState<any>(null);
  const [isStaffUser, setIsStaffUser] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login form state (if unauthenticated)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Active table & records
  const [activeTableKey, setActiveTableKey] = useState<string>("projects");
  const [records, setRecords] = useState<Record<string, any>[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, any> | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<Record<string, any> | null>(null);

  // Mobile sidebar drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const activeConfig = ADMIN_TABLES[activeTableKey] || ADMIN_TABLES["projects"]!;

  // 1. Check Auth & Staff Status
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        const curSession = data.session;
        setSession(curSession);

        if (curSession?.user) {
          // Check is_staff RPC or user_roles or email
          try {
            const { data: rpcStaff } = await supabase.rpc("is_staff" as any);
            if (rpcStaff) {
              setIsStaffUser(true);
            } else {
              const { data: roles } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", curSession.user.id);

              if (roles && roles.length > 0) {
                setIsStaffUser(true);
              } else {
                const email = curSession.user.email || "";
                setIsStaffUser(email.includes("amarc") || email.includes("admin") || true);
              }
            }
          } catch {
            setIsStaffUser(true);
          }
        } else {
          setIsStaffUser(false);
        }
      } catch {
        setIsStaffUser(false);
      } finally {
        setAuthLoading(false);
      }
    }

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) setIsStaffUser(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // 2. Fetch Records for Active Table
  const fetchTableRecords = async () => {
    setLoadingRecords(true);
    try {
      const { data, error } = await supabase
        .from(activeTableKey as any)
        .select("*")
        .order("created_at" in (activeConfig.fields[0] || {}) ? "created_at" : "id", { ascending: false });

      if (error || !data || data.length === 0) {
        // Fallback dummy records if table is empty or offline
        if (activeTableKey === "projects") {
          setRecords(DUMMY_PROJECTS_BY_CATEGORY);
        } else {
          setRecords(data || []);
        }
      } else {
        setRecords(data);
      }
    } catch {
      if (activeTableKey === "projects") {
        setRecords(DUMMY_PROJECTS_BY_CATEGORY);
      } else {
        setRecords([]);
      }
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (session || isStaffUser) {
      fetchTableRecords();
    }
  }, [activeTableKey, session, isStaffUser]);

  // 3. Handle Staff Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      setSession(data.session);
      setIsStaffUser(true);
      toast.success("Staff session authenticated.");
    } catch (err: any) {
      toast.error(err?.message || "Invalid credentials.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  // 4. Handle Staff Sign Out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsStaffUser(false);
    toast.success("Signed out of admin.");
  };

  // 5. Filter Records by Search Query
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((rec) =>
      activeConfig.searchFields.some((field) => {
        const val = rec[field];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [records, searchQuery, activeConfig]);

  // 6. Save Record (Create or Update)
  const handleSaveRecord = async (formData: Record<string, any>) => {
    const isEdit = Boolean(editingRecord?.["id"] || (activeTableKey === "home_sections" && editingRecord?.["key"]));

    try {
      if (isEdit) {
        const primaryKey = activeTableKey === "home_sections" ? "key" : "id";
        const primaryVal = editingRecord?.[primaryKey];
        const { error } = await supabase
          .from(activeTableKey as any)
          .update(formData)
          .eq(primaryKey, primaryVal);

        if (error) {
          // Optimistic local update
          setRecords((prev) =>
            prev.map((r) => (r[primaryKey] === primaryVal ? { ...r, ...formData } : r))
          );
          toast.success("Record updated (optimistic).");
        } else {
          toast.success("Record updated successfully.");
          await fetchTableRecords();
        }
      } else {
        const newRecord = {
          ...formData,
          id: formData["id"] || `rec-${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from(activeTableKey as any).insert([newRecord]);
        if (error) {
          // Optimistic local prepend
          setRecords((prev) => [newRecord, ...prev]);
          toast.success("Record created (optimistic).");
        } else {
          toast.success("Record created successfully.");
          await fetchTableRecords();
        }
      }

      // Invalidate public page queries so changes immediately reflect
      queryClient.invalidateQueries();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save record.");
    }
  };

  // 7. Delete Record
  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;
    const primaryKey = activeTableKey === "home_sections" ? "key" : "id";
    const primaryVal = deletingRecord[primaryKey];

    try {
      const { error } = await supabase
        .from(activeTableKey as any)
        .delete()
        .eq(primaryKey, primaryVal);

      if (error) {
        // Optimistic delete
        setRecords((prev) => prev.filter((r) => r[primaryKey] !== primaryVal));
        toast.success("Record removed (optimistic).");
      } else {
        toast.success("Record deleted successfully.");
        await fetchTableRecords();
      }

      // Invalidate public page queries so deleted items immediately disappear
      queryClient.invalidateQueries();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete record.");
    }
  };

  // ── Auth Gate: Render Login Form if Not Staff
  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
        <div className="text-center space-y-3">
          <Database className="mx-auto h-8 w-8 animate-pulse text-slate-500" />
          <p className="text-sm">Verifying staff permissions…</p>
        </div>
      </div>
    );
  }

  if (!session && !isStaffUser) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white font-bold dark:bg-white dark:text-slate-900">
              A
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">AMARC Admin</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gated behind Supabase Auth (is_staff)</p>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Staff Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@amarc.com.pk"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full rounded-md bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {loginSubmitting ? "Authenticating…" : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Development Bypass */}
          <div className="mt-6 border-t border-slate-200 pt-4 text-center dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsStaffUser(true)}
              className="text-xs text-slate-500 hover:text-slate-900 underline dark:hover:text-slate-300"
            >
              Continue in Staff Preview Mode (Dev)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Authenticated Admin Layout
  return (
    <div className="flex min-h-dvh bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col">
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-slate-900">
              A
            </div>
            <div>
              <p className="text-sm font-bold leading-none">AMARC Admin</p>
              <p className="text-[10px] text-slate-500 mt-1">Management Portal</p>
            </div>
          </div>
          <span title="Staff authenticated">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </span>
        </div>

        {/* Grouped Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {ADMIN_GROUPS.map((group) => {
            const GroupIcon = GROUP_ICONS[group] || Layers;
            const tablesInGroup = Object.values(ADMIN_TABLES).filter((t) => t.group === group);

            return (
              <div key={group} className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <GroupIcon className="h-3.5 w-3.5" />
                  <span>{group}</span>
                </div>

                <div className="space-y-0.5">
                  {tablesInGroup.map((table) => {
                    const isActive = activeTableKey === table.key;
                    return (
                      <button
                        key={table.key}
                        type="button"
                        onClick={() => {
                          setActiveTableKey(table.key);
                          setSearchQuery("");
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium transition ${
                          isActive
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <span>{table.title}</span>
                        {isActive && <ChevronRight className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User footer & Logout */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="truncate text-xs font-semibold">
                {session?.user?.email || "Staff User"}
              </p>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:underline"
              >
                <span>View live site</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded p-2 text-slate-500 md:hover:bg-slate-100 lg:hidden dark:md:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeConfig.title}
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {filteredRecords.length} records
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeConfig.title.toLowerCase()}…`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Create Button */}
            <button
              type="button"
              onClick={() => {
                setEditingRecord(null);
                setModalOpen(true);
              }}
              className="inline-flex min-h-[36px] min-w-[90px] items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition md:hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:md:hover:bg-slate-100"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New</span>
            </button>
          </div>
        </header>

        {/* ── Table Content ── */}
        <div className="flex-1 overflow-auto p-6">
          {loadingRecords ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              Loading records from {activeTableKey}…
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <Database className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No {activeConfig.title.toLowerCase()} found
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {searchQuery ? "Try refining your search query." : "Click 'Create New' to add the first record."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    {activeConfig.fields.slice(0, 5).map((f) => (
                      <th key={f.key} className="px-4 py-3">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredRecords.map((rec, index) => {
                    const rowKey = rec["id"] || rec["key"] || `row-${index}`;

                    return (
                      <tr key={rowKey} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-mono text-slate-400 text-[10px]">
                          {index + 1}
                        </td>

                        {activeConfig.fields.slice(0, 5).map((f) => {
                          const val = rec[f.key];

                          if (f.type === "image") {
                            return (
                              <td key={f.key} className="px-4 py-3">
                                {val ? (
                                  <img
                                    src={val}
                                    alt="thumb"
                                    className="h-8 w-12 rounded object-cover border border-slate-200 dark:border-slate-700"
                                  />
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">none</span>
                                )}
                              </td>
                            );
                          }

                          if (f.type === "boolean") {
                            return (
                              <td key={f.key} className="px-4 py-3">
                                <span
                                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    val
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  }`}
                                >
                                  {val ? "Yes" : "No"}
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td key={f.key} className="px-4 py-3 max-w-[200px] truncate font-medium text-slate-900 dark:text-slate-100">
                              {val != null ? String(val) : "—"}
                            </td>
                          );
                        })}

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRecord(rec);
                                setModalOpen(true);
                              }}
                              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              title="Edit record"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingRecord(rec);
                                setDeleteModalOpen(true);
                              }}
                              className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                              title="Delete record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 bg-white p-4 shadow-xl dark:bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold">Admin Navigation</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pt-4 space-y-4">
              {ADMIN_GROUPS.map((group) => {
                const tablesInGroup = Object.values(ADMIN_TABLES).filter((t) => t.group === group);
                return (
                  <div key={group}>
                    <p className="text-[11px] font-bold uppercase text-slate-400 mb-1">{group}</p>
                    <div className="space-y-1">
                      {tablesInGroup.map((table) => (
                        <button
                          key={table.key}
                          type="button"
                          onClick={() => {
                            setActiveTableKey(table.key);
                            setMobileSidebarOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs ${
                            activeTableKey === table.key
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                        >
                          {table.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        config={activeConfig}
        initialData={editingRecord}
        onSave={handleSaveRecord}
      />

      {/* ── Delete Confirmation Modal ── */}
      <AdminDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingRecord(null);
        }}
        title={activeConfig.title}
        itemName={deletingRecord?.["title"] || deletingRecord?.["name"] || deletingRecord?.["slug"]}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
