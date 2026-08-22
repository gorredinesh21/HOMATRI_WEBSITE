import { API_BASE_URL } from "@/lib/api";

const TOKEN_KEY = "homatri_admin_token";
export const LOCAL_SESSION_KEY = "homatri_admin_local";

export function adminApiBase() {
  if (typeof window !== "undefined") return "/homatri-api";
  return API_BASE_URL.replace(/\/$/, "");
}

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
  else window.sessionStorage.removeItem(TOKEN_KEY);
}

export function isLocalAdminSession() {
  return typeof window !== "undefined" && window.sessionStorage.getItem(LOCAL_SESSION_KEY) === "1";
}

export function setLocalAdminSession(on) {
  if (typeof window === "undefined") return;
  if (on) window.sessionStorage.setItem(LOCAL_SESSION_KEY, "1");
  else window.sessionStorage.removeItem(LOCAL_SESSION_KEY);
}

export function formatApiError(data, status) {
  const detail = data?.detail || data?.message || data?.error;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || JSON.stringify(item)).join(" ");
  }
  if (detail && typeof detail === "object") return JSON.stringify(detail);
  return `Request failed (${status})`;
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function adminRequest(path, { method = "GET", body, token, headers } = {}) {
  const auth = token || getAdminToken();
  const response = await fetch(`${adminApiBase()}${path}`, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const error = new Error(formatApiError(data, response.status));
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

export function extractToken(payload) {
  return (
    payload?.token ||
    payload?.access_token ||
    payload?.jwt ||
    payload?.homatri_admin_token ||
    payload?.admin_token ||
    null
  );
}

export const adminApi = {
  login: (email, password) =>
    adminRequest("/api/admin/login", { method: "POST", body: { email, password } }),
  me: () => adminRequest("/api/admin/me"),
  logout: () => adminRequest("/api/admin/logout", { method: "POST" }),
  pipeline: (serviceDate) =>
    adminRequest(`/api/admin/pipeline${serviceDate ? `?service_date=${encodeURIComponent(serviceDate)}` : ""}`),
  windows: (serviceDate) =>
    adminRequest(`/api/admin/windows${serviceDate ? `?service_date=${encodeURIComponent(serviceDate)}` : ""}`),
  lockWindow: (meal_type, service_date) =>
    adminRequest("/api/admin/lock-window", {
      method: "POST",
      body: { meal_type, service_date: service_date || null },
    }),
  chats: ({ phone, limit = 50 } = {}) => {
    const q = new URLSearchParams();
    if (phone) q.set("phone", phone);
    if (limit) q.set("limit", String(limit));
    const suffix = q.toString() ? `?${q}` : "";
    return adminRequest(`/api/admin/chats${suffix}`);
  },
  escalations: (status = "PENDING") =>
    adminRequest(`/api/admin/escalations?status=${encodeURIComponent(status)}`),
  resolveEscalation: (session_id, admin_notes, custom_reply) =>
    adminRequest("/api/admin/escalations/resolve", {
      method: "POST",
      body: { session_id, admin_notes, custom_reply: custom_reply || null },
    }),
  chefs: () => adminRequest("/api/admin/chefs"),
  createChef: (payload) => adminRequest("/api/admin/chefs", { method: "POST", body: payload }),
  drivers: () => adminRequest("/api/admin/drivers"),
  createDriver: (payload) => adminRequest("/api/admin/drivers", { method: "POST", body: payload }),
  seed: () => adminRequest("/api/admin/seed-chefs-and-riders", { method: "POST" }),
  wipe: () => adminRequest("/api/admin/clear-all-data", { method: "POST" }),
};

export function chatsStreamUrl() {
  return `${adminApiBase()}/api/admin/chats/stream`;
}
