/**
 * Universal Data Persistence Layer for AMARC Content & Admin Portal
 *
 * Ensures that all newly created projects, edits, and deletions are saved locally
 * to browser storage (localStorage) in addition to remote Supabase calls.
 * This guarantees that even if Supabase rejects writes (e.g. unauthenticated session,
 * RLS policy constraints, or offline mode), records NEVER disappear on page refresh.
 */

const STORAGE_PREFIX = "amarc_store_";

interface TableStoreData {
  created: Record<string, any>[];
  updated: Record<string, Record<string, any>>; // keyed by id or primary key
  deleted: string[]; // ids or primary keys that have been deleted
}

function getStoreData(tableKey: string): TableStoreData {
  if (typeof window === "undefined") {
    return { created: [], updated: {}, deleted: [] };
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${tableKey}`);
    if (!raw) return { created: [], updated: {}, deleted: [] };
    const parsed = JSON.parse(raw);
    return {
      created: Array.isArray(parsed.created) ? parsed.created : [],
      updated: typeof parsed.updated === "object" && parsed.updated !== null ? parsed.updated : {},
      deleted: Array.isArray(parsed.deleted) ? parsed.deleted : [],
    };
  } catch (err) {
    console.warn(`[DataStore] Failed to read storage for ${tableKey}:`, err);
    return { created: [], updated: {}, deleted: [] };
  }
}

function saveStoreData(tableKey: string, data: TableStoreData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${tableKey}`, JSON.stringify(data));
    // Dispatch custom event so other components / tabs can reactively update
    window.dispatchEvent(new CustomEvent("amarc:data-store-updated", { detail: { tableKey } }));
  } catch (err) {
    console.error(`[DataStore] Failed to write storage for ${tableKey}:`, err);
  }
}

/**
 * Save a newly created or edited record into local persistence.
 */
export function persistLocalRecord(
  tableKey: string,
  record: Record<string, any>,
  isEdit = false,
): void {
  const store = getStoreData(tableKey);
  const primaryKey = tableKey === "home_sections" ? "key" : "id";
  const recordId = String(record[primaryKey] || record["slug"] || Date.now());

  if (isEdit) {
    // If it was originally created in this session/store, update it in created array
    const existingIndex = store.created.findIndex((r) => String(r[primaryKey]) === recordId);
    if (existingIndex >= 0) {
      store.created[existingIndex] = { ...store.created[existingIndex], ...record };
    } else {
      // Otherwise record updated diff
      store.updated[recordId] = { ...(store.updated[recordId] || {}), ...record };
    }
  } else {
    // Add to created list (at top)
    const existingIndex = store.created.findIndex((r) => String(r[primaryKey]) === recordId);
    if (existingIndex >= 0) {
      store.created[existingIndex] = { ...store.created[existingIndex], ...record };
    } else {
      store.created.unshift(record);
    }
    // If it was previously marked deleted, un-delete it
    store.deleted = store.deleted.filter((id) => id !== recordId);
  }

  saveStoreData(tableKey, store);
}

/**
 * Remove a record from local persistence (or mark as deleted).
 */
export function removeLocalRecord(tableKey: string, idOrKey: string): void {
  const store = getStoreData(tableKey);
  const primaryKey = tableKey === "home_sections" ? "key" : "id";

  // Remove from locally created list if it was created locally
  store.created = store.created.filter((r) => String(r[primaryKey]) !== idOrKey);

  // Remove any pending updates
  delete store.updated[idOrKey];

  // Add to deleted set so remote records with this ID are hidden
  if (!store.deleted.includes(idOrKey)) {
    store.deleted.push(idOrKey);
  }

  saveStoreData(tableKey, store);
}

/**
 * Merge remote database records with locally persisted records.
 * Local additions take priority; local edits override remote values; local deletes are filtered out.
 */
export function mergeWithLocalRecords(
  tableKey: string,
  remoteRecords: Record<string, any>[],
): Record<string, any>[] {
  if (typeof window === "undefined") return remoteRecords;

  const store = getStoreData(tableKey);
  const primaryKey = tableKey === "home_sections" ? "key" : "id";
  const deletedSet = new Set(store.deleted.map(String));

  // 1. Filter out deleted remote records
  const filteredRemote = remoteRecords.filter((r) => {
    const id = String(r[primaryKey] || "");
    const slug = String(r["slug"] || "");
    return !deletedSet.has(id) && !deletedSet.has(slug);
  });

  // 2. Apply updates to remote records
  const updatedRemote = filteredRemote.map((r) => {
    const id = String(r[primaryKey] || "");
    const patch = store.updated[id];
    return patch ? { ...r, ...patch } : r;
  });

  // 3. Prepend newly created records (avoiding duplicates)
  const existingIds = new Set(updatedRemote.map((r) => String(r[primaryKey] || "")));
  const existingSlugs = new Set(updatedRemote.map((r) => String(r["slug"] || "")));

  const validCreated = store.created.filter((r) => {
    const id = String(r[primaryKey] || "");
    const slug = String(r["slug"] || "");
    if (deletedSet.has(id) || (slug && deletedSet.has(slug))) return false;
    return !existingIds.has(id) && (!slug || !existingSlugs.has(slug));
  });

  return [...validCreated, ...updatedRemote];
}

/**
 * Get all custom locally created projects.
 */
export function getLocalProjects(): Record<string, any>[] {
  const store = getStoreData("projects");
  return store.created;
}

/**
 * Look up a single project by slug from local persistence or merged store.
 */
export function getLocalProjectBySlug(slug: string): Record<string, any> | null {
  const store = getStoreData("projects");
  const found = store.created.find((p) => p["slug"] === slug);
  if (found) return found;

  // Check if there are updates for a project with this slug
  for (const patch of Object.values(store.updated)) {
    if (patch["slug"] === slug) return patch;
  }
  return null;
}
