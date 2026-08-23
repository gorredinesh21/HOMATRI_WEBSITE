export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://homatri-backend-195132182954.us-central1.run.app";

export const DELIVERY_FEE_DISPLAY = 30;

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function apiRequest(path, { method = "GET", token, body, headers } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    credentials: "include",
  });

  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      data?.error ||
      `Request failed (${response.status})`;
    const error = new Error(typeof message === "string" ? message : JSON.stringify(message));
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export function orderStreamUrl(orderId) {
  return `${API_BASE_URL}/api/v1/orders/${orderId}/stream`;
}

export async function requestOtp(phone) {
  return apiRequest("/api/v1/auth/otp/request", {
    method: "POST",
    body: { phone },
  });
}

export async function verifyMsg91Widget({ phone, msg91Token, fullName, avatarUrl, isCartoonAvatar = true }) {
  return apiRequest("/api/v1/auth/verify-msg91-widget", {
    method: "POST",
    body: {
      phone,
      msg91_token: msg91Token,
      full_name: fullName,
      avatar_url: avatarUrl,
      is_cartoon_avatar: isCartoonAvatar,
    },
  });
}

export async function googleLogin({ idToken, avatarUrl, isCartoonAvatar }) {
  return apiRequest("/api/v1/auth/google-login", {
    method: "POST",
    body: {
      id_token: idToken,
      avatar_url: avatarUrl,
      is_cartoon_avatar: isCartoonAvatar,
    },
  });
}

export async function refreshAuthSession() {
  return apiRequest("/api/v1/auth/refresh", { method: "POST" });
}

export async function fetchAuthMe(token) {
  return apiRequest("/api/v1/auth/me", { token });
}

export async function submitChefOnboarding(body, token) {
  return apiRequest("/api/v1/auth/onboarding/chef", { method: "POST", token, body });
}

export async function submitRiderOnboarding(body, token) {
  return apiRequest("/api/v1/auth/onboarding/rider", { method: "POST", token, body });
}

export function normalizeAddress(addr) {
  if (!addr) return null;
  const flatNo = addr.flatNo || addr.flat_no || "";
  const streetAddress = addr.streetAddress || addr.street_address || "";
  const landmark = addr.landmark || "";
  const cluster = addr.cluster || "Ghansoli";
  const addressType = (addr.addressType || addr.address_type || "HOME").toUpperCase();
  const phone = addr.phone || "7416767453";
  const fullAddress =
    addr.fullAddress ||
    addr.full_address ||
    `${flatNo}, ${streetAddress}${landmark ? `, Near ${landmark}` : ""}, ${cluster}`;

  return {
    id: addr.id || `addr_${Date.now()}`,
    addressType,
    address_type: addressType,
    flatNo,
    flat_no: flatNo,
    streetAddress,
    street_address: streetAddress,
    landmark,
    fullAddress,
    full_address: fullAddress,
    phone,
    cluster,
    latitude: addr.latitude || 19.1234,
    longitude: addr.longitude || 73.0123,
    is_default: addr.is_default || false,
  };
}

export async function fetchSavedAddresses(token) {
  const raw = await apiRequest("/api/v1/customer/addresses", { token });
  return Array.isArray(raw) ? raw.map(normalizeAddress) : [];
}

export async function saveCustomerAddress(body, token) {
  return apiRequest("/api/v1/customer/addresses", { method: "POST", token, body });
}

export async function deleteCustomerAddress(addressId, token) {
  return apiRequest(`/api/v1/customer/addresses/${addressId}`, { method: "DELETE", token });
}

export async function fetchBulkTemplates(chefPhone) {
  const suffix = chefPhone ? `?chef_phone=${encodeURIComponent(chefPhone)}` : "";
  return apiRequest(`/api/v1/bulk/templates${suffix}`);
}

export async function checkoutBulkOrder(payload, token) {
  return apiRequest("/api/v1/bulk/checkout", { method: "POST", token, body: payload });
}

export async function verifyOtp({ phone, otp }) {
  return apiRequest("/api/v1/auth/otp/verify", {
    method: "POST",
    body: { phone, otp },
  });
}

export async function checkoutOrder(payload, token) {
  return apiRequest("/api/v1/orders/checkout", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function fetchPublicChefs() {
  return apiRequest("/api/v1/chefs");
}

export async function fetchPublicReels() {
  return apiRequest("/api/v1/reels");
}

export async function fetchOrder(orderId, token) {
  return apiRequest(`/api/v1/orders/${orderId}`, { token });
}

export async function uploadChefReel(formData, token) {
  const response = await fetch(`${API_BASE_URL}/api/v1/reels/upload`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  const data = await parseJsonSafe(response);
  if (!response.ok) {
    const message =
      data?.detail || data?.message || data?.error || `Upload failed (${response.status})`;
    const error = new Error(typeof message === "string" ? message : JSON.stringify(message));
    error.status = response.status;
    throw error;
  }
  return data;
}

export function riderLocationWsUrl() {
  const http = API_BASE_URL.replace(/\/$/, "");
  const ws = http.startsWith("https://")
    ? http.replace(/^https:\/\//, "wss://")
    : http.replace(/^http:\/\//, "ws://");
  return `${ws}/ws/v1/rider/location`;
}

