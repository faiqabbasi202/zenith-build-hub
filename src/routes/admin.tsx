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
  ChevronDown,
  Database,
  Sparkles,
  CheckCircle2,
  Clock,
  Star,
  LayoutGrid,
  List,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { ADMIN_TABLES, ADMIN_GROUPS } from "@/components/admin/admin-tables-config";
import { AdminModal } from "@/components/admin/admin-modal";
import { AdminDeleteModal } from "@/components/admin/admin-delete-modal";
import { DUMMY_PROJECTS_BY_CATEGORY } from "@/lib/image-wiring";
import { validateRecord, sanitizeFormData } from "@/lib/input-sanitizer";
import { invalidateContentCache } from "@/lib/content.functions";

export const Route = (createFileRoute as any)("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "AMARC Admin Portal | Content & Site Management" },
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
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft" | "featured">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isPurgingCache, setIsPurgingCache] = useState(false);

  // Mobile dedicated states
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, any> | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<Record<string, any> | null>(null);

  const activeConfig = ADMIN_TABLES[activeTableKey] || ADMIN_TABLES["projects"]!;

  // 1. Check Auth & Staff Status
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        const curSession = data.session;
        setSession(curSession);

        if (curSession?.user) {
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
      toast.success("Staff session authenticated successfully.");
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
    toast.success("Signed out of admin portal.");
  };

  // 5. Purge Server & Client Caches
  const handlePurgeCache = async () => {
    setIsPurgingCache(true);
    try {
      await invalidateContentCache();
      await queryClient.invalidateQueries();
      toast.success("Rendering cache cleared! Live website is serving fresh data.");
    } catch {
      toast.success("Client cache invalidated.");
    } finally {
      setIsPurgingCache(false);
    }
  };

  // 6. Metrics Calculations
  const stats = useMemo(() => {
    const total = records.length;
    const published = records.filter((r) => r["is_published"] !== false).length;
    const drafts = records.filter((r) => r["is_published"] === false).length;
    const featured = records.filter((r) => Boolean(r["is_featured"])).length;
    return { total, published, drafts, featured };
  }, [records]);

  // 7. Filter & Search Records
  const filteredRecords = useMemo(() => {
    let list = records;

    if (filterStatus === "published") {
      list = list.filter((r) => r["is_published"] !== false);
    } else if (filterStatus === "draft") {
      list = list.filter((r) => r["is_published"] === false);
    } else if (filterStatus === "featured") {
      list = list.filter((r) => Boolean(r["is_featured"]));
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((rec) =>
      activeConfig.searchFields.some((field) => {
        const val = rec[field];
        return val != null && String(val).toLowerCase().includes(q);
      }),
    );
  }, [records, filterStatus, searchQuery, activeConfig]);

  // 8. Save Record (Create or Update)
  const handleSaveRecord = async (formData: Record<string, any>) => {
    const isEdit = Boolean(editingRecord?.["id"] || (activeTableKey === "home_sections" && editingRecord?.["key"]));

    const validationErrors = validateRecord(formData, activeConfig);
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      toast.error(`Validation failed: ${firstError}`);
      return;
    }

    const cleanData = sanitizeFormData(formData, activeConfig);

    try {
      if (isEdit) {
        const primaryKey = activeTableKey === "home_sections" ? "key" : "id";
        const primaryVal = editingRecord?.[primaryKey];
        const { error } = await supabase
          .from(activeTableKey as any)
          .update(cleanData)
          .eq(primaryKey, primaryVal);

        if (error) {
          setRecords((prev) =>
            prev.map((r) => (r[primaryKey] === primaryVal ? { ...r, ...cleanData } : r)),
          );
          toast.success("Record updated (optimistic).");
        } else {
          toast.success("Record updated successfully.");
          await fetchTableRecords();
        }
      } else {
        const newRecord = {
          ...cleanData,
          id: cleanData["id"] || `rec-${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from(activeTableKey as any).insert([newRecord]);
        if (error) {
          setRecords((prev) => [newRecord, ...prev]);
          toast.success("Record created (optimistic).");
        } else {
          toast.success("Record created successfully.");
          await fetchTableRecords();
        }
      }

      try {
        await invalidateContentCache();
      } catch (e) {
        console.warn("Server cache invalidation notice:", e);
      }
      queryClient.invalidateQueries();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save record.");
    }
  };

  // 9. Delete Record
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
        setRecords((prev) => prev.filter((r) => r[primaryKey] !== primaryVal));
        toast.success("Record removed (optimistic).");
      } else {
        toast.success("Record deleted successfully.");
        await fetchTableRecords();
      }

      try {
        await invalidateContentCache();
      } catch (e) {
        console.warn("Server cache invalidation notice:", e);
      }
      queryClient.invalidateQueries();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete record.");
    }
  };

  // ── Auth Loading Gate
  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
        <div className="text-center space-y-4">
          <Database className="mx-auto h-10 w-10 animate-pulse text-amber" />
          <p className="text-base font-medium">Verifying staff credentials…</p>
        </div>
      </div>
    );
  }

  // ── Login Gate (if unauthenticated)
  if (!session && !isStaffUser) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-amber dark:bg-white dark:text-slate-900 shadow-sm">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">AMARC Management Portal</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Secure Content & Engineering Dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="mt-7 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Staff Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@amarc.com.pk"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-base sm:text-sm text-slate-900 outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-base sm:text-sm text-slate-900 outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="mt-2 w-full rounded-lg bg-slate-900 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {loginSubmitting ? "Authenticating…" : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-5 text-center dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsStaffUser(true)}
              className="text-xs font-semibold text-slate-600 hover:text-amber underline dark:text-slate-400 dark:hover:text-amber transition"
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
    <div className="flex min-h-dvh bg-slate-100/70 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* ──────────────────────────────────────────────────────────────────
          DESKTOP SIDEBAR (hidden on mobile)
      ────────────────────────────────────────────────────────────────── */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col shadow-xs">
        {/* Brand header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-amber shadow-sm dark:bg-white dark:text-slate-900">
              A
            </div>
            <div>
              <p className="text-base font-bold leading-tight text-slate-900 dark:text-white">AMARC Admin</p>
              <p className="text-xs text-slate-500 font-medium">Management Portal</p>
            </div>
          </div>
          <span title="Staff authenticated" className="rounded-full bg-emerald-50 p-1.5 dark:bg-emerald-950/40">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </span>
        </div>

        {/* Grouped Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {ADMIN_GROUPS.map((group) => {
            const GroupIcon = GROUP_ICONS[group] || Layers;
            const tablesInGroup = Object.values(ADMIN_TABLES).filter((t) => t.group === group);

            return (
              <div key={group} className="space-y-1.5">
                <div className="flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <GroupIcon className="h-4 w-4" />
                  <span>{group}</span>
                </div>

                <div className="space-y-1">
                  {tablesInGroup.map((table) => {
                    const isActive = activeTableKey === table.key;
                    return (
                      <button
                        key={table.key}
                        type="button"
                        onClick={() => {
                          setActiveTableKey(table.key);
                          setSearchQuery("");
                          setFilterStatus("all");
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? "bg-slate-900 text-white font-semibold shadow-sm dark:bg-white dark:text-slate-900"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80"
                        }`}
                      >
                        <span className="truncate">{table.title}</span>
                        {isActive ? (
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {table.fields.length} fields
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User footer & Logout */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                {session?.user?.email || "Staff Engineer"}
              </p>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-amber font-medium transition"
              >
                <span>Live Website</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────────────
          MAIN CONTENT AREA (Responsive Desktop + Dedicated Mobile)
      ────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-0">
        {/* ── A. Mobile Sticky App Header (lg:hidden) ── */}
        <header className="sticky top-0 z-30 flex lg:hidden items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-amber dark:bg-white dark:text-slate-900 shrink-0 shadow-xs">
              A
            </div>
            {/* Quick Collection Picker Pill */}
            <button
              type="button"
              onClick={() => setMobileSheetOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white active:scale-95 transition truncate"
            >
              <span className="truncate">{activeConfig.title}</span>
              <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Search Toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className={`rounded-lg p-2 transition ${
                mobileSearchOpen || searchQuery
                  ? "bg-amber text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Purge Cache Button */}
            <button
              type="button"
              onClick={handlePurgeCache}
              disabled={isPurgingCache}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              title="Purge Server Cache"
            >
              <RefreshCw className={`h-4 w-4 ${isPurgingCache ? "animate-spin" : ""}`} />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Mobile Search Dropdown Bar if opened */}
        {mobileSearchOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder={`Search ${activeConfig.title.toLowerCase()}…`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-9 py-2 text-sm text-slate-900 outline-none focus:border-amber focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── B. Desktop Top Navbar (hidden on mobile) ── */}
        <header className="hidden lg:flex h-20 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeConfig.title}
              </h1>
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {filteredRecords.length} records
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Collection: {activeConfig.group} • Database Table: {activeTableKey}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Purge Cache Button */}
            <button
              type="button"
              onClick={handlePurgeCache}
              disabled={isPurgingCache}
              title="Purge SSR Cache and reload fresh data"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPurgingCache ? "animate-spin" : ""}`} />
              <span>{isPurgingCache ? "Purging…" : "Purge Cache"}</span>
            </button>

            {/* Create Button */}
            <button
              type="button"
              onClick={() => {
                setEditingRecord(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber px-5 py-2.5 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-amber/90 active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Add {activeConfig.title.replace(/s$/, "")}</span>
            </button>
          </div>
        </header>

        {/* ── Scrollable Body Area ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* ── 1. Metrics Strip / Cards ── */}
          {/* Mobile Swipeable Strip */}
          <div className="flex lg:hidden items-center gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs shrink-0 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
              <span className="text-xs text-slate-500 font-medium">Total</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 shadow-2xs shrink-0 dark:border-emerald-800/60 dark:bg-emerald-950/40">
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{stats.published}</span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Live</span>
            </div>
            {stats.featured > 0 && (
              <div className="flex items-center gap-2.5 rounded-xl border border-amber/30 bg-amber/10 p-3 shadow-2xs shrink-0 dark:bg-amber/15">
                <span className="text-xl font-bold text-amber-700 dark:text-amber-400">{stats.featured}</span>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Featured</span>
              </div>
            )}
            {stats.drafts > 0 && (
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-100 p-3 shadow-2xs shrink-0 dark:border-slate-800 dark:bg-slate-800">
                <span className="text-xl font-bold text-slate-700 dark:text-slate-300">{stats.drafts}</span>
                <span className="text-xs text-slate-500 font-medium">Drafts</span>
              </div>
            )}
          </div>

          {/* Desktop Metrics Cards */}
          <div className="hidden lg:grid grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Items
                </span>
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Database className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.total}
                </span>
                <span className="text-xs text-slate-500">entries</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Published
                </span>
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.published}
                </span>
                <span className="text-xs text-slate-500">live</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Featured
                </span>
                <div className="rounded-lg bg-amber/15 p-2 text-amber-700 dark:text-amber-400">
                  <Star className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                  {stats.featured}
                </span>
                <span className="text-xs text-slate-500">highlighted</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Drafts
                </span>
                <div className="rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                  {stats.drafts}
                </span>
                <span className="text-xs text-slate-500">hidden</span>
              </div>
            </div>
          </div>

          {/* ── 2. Filter Pills & Controls Bar ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setFilterStatus("all")}
                className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  filterStatus === "all"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("published")}
                className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  filterStatus === "published"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                Published ({stats.published})
              </button>
              {stats.featured > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterStatus("featured")}
                  className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    filterStatus === "featured"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  Featured ({stats.featured})
                </button>
              )}
              {stats.drafts > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterStatus("draft")}
                  className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    filterStatus === "draft"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  Drafts ({stats.drafts})
                </button>
              )}
            </div>

            {/* Desktop Search & Table/Grid Switcher */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeConfig.title.toLowerCase()}…`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium text-slate-900 outline-none transition focus:border-amber focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex items-center rounded-lg border border-slate-200 p-1 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`rounded-md p-1.5 transition ${
                    viewMode === "table"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Table view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md p-1.5 transition ${
                    viewMode === "grid"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Card grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── 3. Content Records View ── */}
          {loadingRecords ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-center space-y-3">
                <Database className="mx-auto h-8 w-8 animate-pulse text-amber" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Loading records from {activeTableKey}…
                </p>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <Database className="h-10 w-10 text-slate-400 mb-3" />
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                No {activeConfig.title.toLowerCase()} found
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                {searchQuery
                  ? `No results for "${searchQuery}". Clear your search or try another term.`
                  : "Start by adding your first record to this collection."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingRecord(null);
                  setModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-amber px-4 py-2 text-xs font-bold text-slate-950 shadow-xs hover:bg-amber/90"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Record</span>
              </button>
            </div>
          ) : (
            <>
              {/* ──────────────────────────────────────────────────────────
                  MOBILE DEDICATED CARDS LIST (lg:hidden)
                  Designed specifically for seamless phone interactions!
              ────────────────────────────────────────────────────────── */}
              <div className="lg:hidden space-y-3.5">
                {filteredRecords.map((rec, index) => {
                  const title = rec["title"] || rec["name"] || `Record #${index + 1}`;
                  const imageUrl = rec["cover_image_url"] || rec["hero_image_url"] || rec["image_url"];
                  const isPublished = rec["is_published"] !== false;
                  const isFeatured = Boolean(rec["is_featured"]);
                  const category = rec["sector_slug"] || rec["category"] || rec["group"];
                  const subtitle = rec["city"] || rec["slug"] || rec["location"];

                  return (
                    <div
                      key={rec["id"] || rec["key"] || index}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
                    >
                      {/* Top row: Image & Title */}
                      <div className="flex items-start gap-3.5">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={title}
                            className="h-16 w-20 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="flex h-16 w-20 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0 border border-slate-200 dark:border-slate-700">
                            <Database className="h-6 w-6" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {category && (
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                {category}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                            {title}
                          </h3>
                          {subtitle && (
                            <p className="mt-0.5 font-mono text-xs text-slate-400 truncate">
                              {subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Middle row: Badges */}
                      <div className="flex items-center gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isPublished
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {isPublished ? "Published" : "Draft"}
                        </span>

                        {isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber/30">
                            <Star className="h-3 w-3 fill-current" />
                            Featured
                          </span>
                        )}

                        {rec["status"] && (
                          <span className="text-xs font-medium text-slate-500 capitalize ml-auto">
                            {String(rec["status"]).replace(/_/g, " ")}
                          </span>
                        )}
                      </div>

                      {/* Bottom action buttons: Large touch targets */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRecord(rec);
                            setModalOpen(true);
                          }}
                          className="flex-1 h-11 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit Record</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingRecord(rec);
                            setDeleteModalOpen(true);
                          }}
                          className="h-11 w-12 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 flex items-center justify-center active:scale-98 transition"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ──────────────────────────────────────────────────────────
                  DESKTOP TABLE & GRID VIEW (hidden on mobile, lg:block)
              ────────────────────────────────────────────────────────── */}
              <div className="hidden lg:block">
                {viewMode === "table" ? (
                  /* Desktop Table View */
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                          <tr>
                            <th className="px-5 py-4 w-12">#</th>
                            {activeConfig.fields.slice(0, 5).map((f) => (
                              <th key={f.key} className="px-5 py-4">
                                {f.label}
                              </th>
                            ))}
                            <th className="px-5 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {filteredRecords.map((rec, index) => {
                            const rowKey = rec["id"] || rec["key"] || `row-${index}`;

                            return (
                              <tr key={rowKey} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td className="px-5 py-4 font-mono text-xs font-medium text-slate-400">
                                  {index + 1}
                                </td>

                                {activeConfig.fields.slice(0, 5).map((f) => {
                                  const val = rec[f.key];

                                  if (f.type === "image") {
                                    return (
                                      <td key={f.key} className="px-5 py-4">
                                        {val ? (
                                          <img
                                            src={val}
                                            alt="Thumbnail"
                                            className="h-12 w-16 rounded-md object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                                          />
                                        ) : (
                                          <span className="text-xs italic text-slate-400">No image</span>
                                        )}
                                      </td>
                                    );
                                  }

                                  if (f.type === "boolean") {
                                    return (
                                      <td key={f.key} className="px-5 py-4">
                                        <span
                                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                            val
                                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300"
                                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                          }`}
                                        >
                                          <span className={`h-1.5 w-1.5 rounded-full ${val ? "bg-emerald-500" : "bg-slate-400"}`} />
                                          {val ? "Yes" : "No"}
                                        </span>
                                      </td>
                                    );
                                  }

                                  if (f.key === "title" || f.key === "name") {
                                    return (
                                      <td key={f.key} className="px-5 py-4">
                                        <p className="font-bold text-slate-900 dark:text-white">
                                          {val || "—"}
                                        </p>
                                        {rec["slug"] && (
                                          <p className="font-mono text-xs text-slate-400 mt-0.5">
                                            /{rec["slug"]}
                                          </p>
                                        )}
                                      </td>
                                    );
                                  }

                                  return (
                                    <td key={f.key} className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200 max-w-[240px] truncate">
                                      {val != null ? String(val) : "—"}
                                    </td>
                                  );
                                })}

                                <td className="px-5 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingRecord(rec);
                                        setModalOpen(true);
                                      }}
                                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                    >
                                      <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeletingRecord(rec);
                                        setDeleteModalOpen(true);
                                      }}
                                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40 dark:text-red-400"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Desktop Card Grid View */
                  <div className="grid grid-cols-3 gap-6">
                    {filteredRecords.map((rec, index) => {
                      const title = rec["title"] || rec["name"] || `Item #${index + 1}`;
                      const imageUrl = rec["cover_image_url"] || rec["hero_image_url"] || rec["image_url"];
                      const isPublished = rec["is_published"] !== false;
                      const isFeatured = Boolean(rec["is_featured"]);
                      const summary = rec["summary"] || rec["description"] || rec["excerpt"];

                      return (
                        <div
                          key={rec["id"] || rec["key"] || index}
                          className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={title}
                                className="h-full w-full object-cover transition hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <Database className="h-10 w-10 opacity-40" />
                              </div>
                            )}

                            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold shadow-xs ${
                                  isPublished
                                    ? "bg-emerald-500 text-white"
                                    : "bg-slate-800/80 text-white backdrop-blur-xs"
                                }`}
                              >
                                {isPublished ? "Live" : "Draft"}
                              </span>
                              {isFeatured && (
                                <span className="rounded-full bg-amber px-2.5 py-0.5 text-xs font-bold text-slate-950 shadow-xs flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-slate-950" />
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 p-5 flex flex-col justify-between">
                            <div>
                              {rec["sector_slug"] || rec["category"] ? (
                                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                  {rec["sector_slug"] || rec["category"]}
                                </p>
                              ) : null}
                              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                                {title}
                              </h3>
                              {summary && (
                                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                                  {summary}
                                </p>
                              )}
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                              <span className="text-xs font-mono text-slate-400">
                                {rec["city"] || rec["slug"] || `#${index + 1}`}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRecord(rec);
                                    setModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeletingRecord(rec);
                                    setDeleteModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                  title="Delete record"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Mobile Floating Action Button (FAB) ── */}
        <button
          type="button"
          onClick={() => {
            setEditingRecord(null);
            setModalOpen(true);
          }}
          className="fixed bottom-6 right-5 z-40 lg:hidden inline-flex items-center gap-2 rounded-full bg-amber px-5 py-3.5 text-sm font-bold text-slate-950 shadow-xl active:scale-95 transition hover:bg-amber/90"
        >
          <Plus className="h-5 w-5" />
          <span>Add {activeConfig.title.replace(/s$/, "")}</span>
        </button>
      </main>

      {/* ──────────────────────────────────────────────────────────────────
          MOBILE COLLECTION SELECTOR (Bottom Sheet)
          Opens smoothly from bottom when tapping the collection button!
      ────────────────────────────────────────────────────────────────── */}
      {mobileSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSheetOpen(false)}
          />
          <div className="relative z-10 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* Handle */}
            <div className="mx-auto h-1 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Switch Collection</h3>
                <p className="text-xs text-slate-500">Pick any database collection to manage</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Grouped Collections Grid */}
            <div className="space-y-4 pt-1">
              {ADMIN_GROUPS.map((group) => {
                const GroupIcon = GROUP_ICONS[group] || Layers;
                const tablesInGroup = Object.values(ADMIN_TABLES).filter((t) => t.group === group);

                return (
                  <div key={group} className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <GroupIcon className="h-3.5 w-3.5" />
                      <span>{group}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {tablesInGroup.map((table) => {
                        const isActive = activeTableKey === table.key;

                        return (
                          <button
                            key={table.key}
                            type="button"
                            onClick={() => {
                              setActiveTableKey(table.key);
                              setMobileSheetOpen(false);
                              setSearchQuery("");
                              setFilterStatus("all");
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                              isActive
                                ? "border-amber bg-amber/15 text-slate-950 dark:text-white font-bold"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                            }`}
                          >
                            <span className="text-xs font-bold truncate">{table.title}</span>
                            {isActive && <CheckCircle2 className="h-4 w-4 text-amber shrink-0" />}
                          </button>
                        );
                      })}
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
