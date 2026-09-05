// Browser calls go through the SAME-ORIGIN Next.js proxy (next.config.mjs
// rewrites /homatri-api/* -> BACKEND_ORIGIN/*). No hardcoded absolute URLs,
// no CORS, no baked build-time API host. The checkout BFF route and the
// runtime-config endpoint read the backend origin from server env at runtime.
export const API_BASE_URL = "/homatri-api";

let _wsOriginPromise = null;

async function apiWsOrigin() {
  if (typeof window === "undefined") return null;
  if (!_wsOriginPromise) {
    _wsOriginPromise = fetch("/api/runtime-config", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.apiOrigin)
      .catch(() => null);
  }
  return _wsOriginPromise;
}

export const DELIVERY_FEE_DISPLAY = 11;

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

export async function registerUser({ phone, email, password, fullName }) {
  return apiRequest("/api/v1/auth/register", {
    method: "POST",
    body: { phone, email, password, full_name: fullName },
  });
}

export async function loginUser({ phone, password }) {
  return apiRequest("/api/v1/auth/login", {
    method: "POST",
    body: { phone, password },
  });
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
  const phone = addr.phone || "";
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

export async function fetchOrderPayment(orderId, token) {
  return apiRequest(`/api/v1/orders/${orderId}/payment`, {
    method: "GET",
    token,
  });
}

export async function verifyOrderPayment(orderId, token, gateway = null) {
  // gateway = Checkout.js success handler payload for real payments; the
  // simulator path (mock/token mode) just confirms with simulate=true.
  const body = gateway
    ? {
        razorpay_order_id: gateway.razorpay_order_id || null,
        razorpay_payment_id: gateway.razorpay_payment_id || null,
        razorpay_signature: gateway.razorpay_signature || null,
      }
    : { simulate: true };
  return apiRequest(`/api/v1/orders/${orderId}/verify-payment`, {
    method: "POST",
    token,
    body,
  });
}

export async function submitDietaryRequest(orderId, note, token) {
  return apiRequest(`/api/v1/orders/${orderId}/dietary-request`, {
    method: "POST",
    token,
    body: { note },
  });
}

export async function respondDietaryRequest(requestId, action, counterOffer, token) {
  return apiRequest(`/api/v1/chef/me/dietary/${requestId}/respond`, {
    method: "POST",
    token,
    body: { action, ...(counterOffer ? { counter_offer: counterOffer } : {}) },
  });
}

export async function fetchPublicChefs() {
  return apiRequest("/api/v1/kitchens");
}

export async function fetchFeaturedReviews(limit = 6) {
  return apiRequest(`/api/v1/reviews/featured?limit=${encodeURIComponent(limit)}`);
}

export async function fetchPublicReels() {
  return apiRequest("/api/v1/reels/feed");
}

export async function fetchReelComments(reelId) {
  return apiRequest(`/api/v1/reels/${encodeURIComponent(reelId)}/comments`);
}

export async function postReelComment({ reelId, text, parentCommentId, phone, fullName, avatarUrl }) {
  return apiRequest("/api/v1/reels/comments", {
    method: "POST",
    body: {
      reel_id: reelId,
      user_phone: phone,
      text,
      ...(parentCommentId ? { parent_comment_id: parentCommentId } : {}),
      ...(fullName ? { username: fullName } : {}),
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    },
  });
}

export async function likeReel(reelId, token) {
  return apiRequest(`/api/v1/reels/${encodeURIComponent(reelId)}/like`, {
    method: "POST",
    token,
  });
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

export function riderLocationWsUrl(apiOrigin, token) {
  const http = String(apiOrigin || "").replace(/\/$/, "");
  const ws = http.startsWith("https://")
    ? http.replace(/^https:\/\//, "wss://")
    : http.replace(/^http:\/\//, "ws://");
  const q = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${ws}/ws/v1/rider/location${q}`;
}

export async function fetchRiderWsUrl(token) {
  const origin = await apiWsOrigin();
  if (!origin) return null;
  return riderLocationWsUrl(origin, token);
}

export async function fetchKitchens({ cluster, mealWindow } = {}) {
  const params = new URLSearchParams();
  if (cluster) params.set("cluster", cluster);
  if (mealWindow) params.set("meal_window", mealWindow);
  const suffix = params.toString() ? `?${params}` : "";
  return apiRequest(`/api/v1/kitchens${suffix}`);
}

export async function fetchMyOrders(token) {
  return apiRequest("/api/v1/orders/mine", { token });
}

export async function submitOrderReview(orderId, body, token) {
  return apiRequest(`/api/v1/orders/${orderId}/review`, { method: "POST", token, body });
}

export async function fetchChefDashboard(token) {
  return apiRequest("/api/v1/chef/me", { token });
}

export async function chefSetAccepting(accepting, token) {
  return apiRequest("/api/v1/chef/me/accepting", { method: "POST", token, body: { accepting } });
}

export async function chefPauseKitchen(token) {
  return apiRequest("/api/v1/chef/me/pause", { method: "POST", token });
}

export async function chefLockBatch(token) {
  return apiRequest("/api/v1/chef/me/lock-batch", { method: "POST", token });
}

export async function chefMarkPacked(token) {
  return apiRequest("/api/v1/chef/me/packed", { method: "POST", token });
}

export async function chefCreateMenu(body, token) {
  return apiRequest("/api/v1/chef/me/menu", { method: "POST", token, body });
}

export async function chefPatchMenu(menuItemId, body, token) {
  return apiRequest(`/api/v1/chef/me/menu/${menuItemId}`, { method: "PATCH", token, body });
}

export async function chefToggleStock(menuItemId, token) {
  return apiRequest(`/api/v1/chef/me/menu/${menuItemId}/stock`, { method: "PATCH", token });
}

export async function chefPatchKitchen(body, token) {
  return apiRequest("/api/v1/chef/me/kitchen", { method: "PATCH", token, body });
}

export async function fetchRiderTrip(token) {
  return apiRequest("/api/v1/rider/me/trip", { token });
}

export async function riderSetShift(on, token) {
  return apiRequest("/api/v1/rider/me/shift", { method: "POST", token, body: { on } });
}

export async function riderConfirmPickup(token) {
  return apiRequest("/api/v1/rider/me/pickup", { method: "POST", token });
}

export async function riderDeliver(orderId, otp, token) {
  return apiRequest("/api/v1/rider/me/deliver", { method: "POST", token, body: { order_id: orderId, otp } });
}

export async function riderConfirmGate(deliveries, token) {
  return apiRequest("/api/v1/rider/me/confirm-gate", { method: "POST", token, body: { deliveries } });
}

export async function riderUndelivered(orderId, reason, token) {
  return apiRequest("/api/v1/rider/me/undelivered", { method: "POST", token, body: { order_id: orderId, reason } });
}

export async function riderReport(kind, token, orderId) {
  return apiRequest("/api/v1/rider/me/report", { method: "POST", token, body: { kind, order_id: orderId } });
}

export async function riderSos(token) {
  return apiRequest("/api/v1/rider/me/sos", { method: "POST", token });
}

