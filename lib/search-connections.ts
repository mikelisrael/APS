// src/lib/search.ts
import type { UserProfile } from "@/types/models";
import type { Connection } from "@/types/connection";

/**
 * Build the searchable strings for a user-like object.
 * Accepts objects with: username, first_name, last_name, full_name
 */
export function buildUserSearchStrings(user: Partial<UserProfile> | any) {
  const username = (user.username || "").toString().trim().toLowerCase();
  const first = (user.first_name || "").toString().trim().toLowerCase();
  const last = (user.last_name || "").toString().trim().toLowerCase();
  const full =
    (user.full_name && user.full_name.toString().trim().toLowerCase()) ||
    `${first} ${last}`.trim();
  return { username, first, last, full };
}

/**
 * Returns true if the provided query matches any of the user's searchable fields.
 * - user: object that has username/first_name/last_name/full_name
 * - q: string (case-insensitive). Empty/null returns true.
 */
export function matchesUserQuery(user: Partial<UserProfile> | any, q?: string) {
  if (!q || !q.toString().trim()) return true;
  const ql = q.toString().trim().toLowerCase();
  const { username, first, last, full } = buildUserSearchStrings(user);
  return (
    username.includes(ql) ||
    first.includes(ql) ||
    last.includes(ql) ||
    full.includes(ql)
  );
}

/**
 * Filters a list of users by optional q (search query) and optional status.
 * status can be 'undergraduate' | 'alumnus' or undefined to not filter by status.
 */
export function filterUsers(
  users: Partial<UserProfile>[] = [],
  q?: string,
  status?: "undergraduate" | "alumnus" | "all"
) {
  let list = users || [];
  if (status && status !== "all") {
    list = list.filter((u) => (u?.status || "").toString() === status);
  }
  if (!q || !q.toString().trim()) return list;
  return list.filter((u) => matchesUserQuery(u, q));
}

/**
 * Filters a list of Connection objects by q (search query) and optional status.
 * Each connection is expected to have a `.user` property (the connected user's profile).
 */
export function filterConnections(
  connections: Connection[] = [],
  q?: string,
  status?: "undergraduate" | "alumnus" | "all"
) {
  let list = connections || [];
  if (status && status !== "all") {
    list = list.filter((c) => (c.user?.status || "").toString() === status);
  }
  if (!q || !q.toString().trim()) return list;
  return list.filter((c) => matchesUserQuery(c.user, q));
}
