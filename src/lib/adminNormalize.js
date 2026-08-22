const STAGES = ["DRAFT", "PENDING_PAYMENT", "CONFIRMED", "BATCHED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "PAYMENT_FAILED"];

export function todayIso() {
  const now = new Date();
  const tz = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return tz.toISOString().slice(0, 10);
}

export function normalizePipeline(data) {
  const counts = {};
  const raw = data?.counts || data?.stages || data?.pipeline || data || {};
  for (const stage of STAGES) {
    const lower = stage.toLowerCase();
    counts[stage] = Number(raw[stage] ?? raw[lower] ?? data?.[stage] ?? 0) || 0;
  }
  let kitchens = data?.kitchens || data?.capacities || data?.active_kitchens || data?.chef_capacities || [];
  if (!Array.isArray(kitchens)) kitchens = [];
  kitchens = kitchens.map((kitchen) => ({
    name: kitchen.kitchen_name || kitchen.name || kitchen.chef_name || "Kitchen",
    used: Number(kitchen.used ?? kitchen.committed ?? kitchen.meals_committed ?? kitchen.current ?? 0),
    cap: Number(kitchen.capacity ?? kitchen.daily_capacity ?? kitchen.limit ?? 15),
  }));
  return {
    counts,
    kitchens,
    serviceDate: data?.service_date || data?.serviceDate || todayIso(),
  };
}

export function normalizeChats(data) {
  const list = Array.isArray(data) ? data : data?.messages || data?.chats || data?.items || [];
  return list.map((message, index) => ({
    messageId: String(message.message_id || message.id || `msg-${index}`),
    customerId: String(message.customer_phone || message.customer_id || message.phone || "unknown"),
    channel: message.channel || "WHATSAPP",
    direction: message.direction || "INBOUND",
    senderRole: message.sender_role || (message.direction === "OUTBOUND" ? "ADMIN" : "CUSTOMER"),
    messageText: message.content || message.message_text || message.text || message.body || "",
    createdAt: message.timestamp || message.created_at || "",
  }));
}

export function normalizeCollection(data, keys = []) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function windowLabel(data, meal) {
  const node = data?.[meal] || data?.[meal.toLowerCase()] || data?.windows?.[meal] || {};
  return node.status || node.state || node.lock_status || (node.locked ? "LOCKED" : "OPEN");
}

export function fallbackPipeline() {
  return {
    counts: {
      DRAFT: 12,
      PENDING_PAYMENT: 4,
      CONFIRMED: 28,
      BATCHED: 28,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      PAYMENT_FAILED: 0,
    },
    kitchens: [
      { name: "Indravati Pure Veg", used: 8, cap: 15 },
      { name: "Konkan Coastal", used: 12, cap: 15 },
      { name: "Desi Punjabi Dhaba", used: 6, cap: 15 },
      { name: "Dakshin Annapoorna", used: 4, cap: 15 },
    ],
    serviceDate: todayIso(),
    local: true,
  };
}

