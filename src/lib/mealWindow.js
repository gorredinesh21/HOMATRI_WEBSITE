export function getActiveMealWindow(now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const lunchCutoff = 11 * 60 + 30;
  const dinnerCutoff = 18 * 60 + 30;

  if (minutes < lunchCutoff) {
    return {
      mealWindow: "LUNCH",
      cutoffTime: "11:30 AM",
      label: "LUNCH · 11:30 AM cutoff",
      isPastCutoff: false,
    };
  }
  if (minutes < dinnerCutoff) {
    return {
      mealWindow: "DINNER",
      cutoffTime: "6:30 PM",
      label: "DINNER · 6:30 PM cutoff",
      isPastCutoff: false,
    };
  }
  return {
    mealWindow: "LUNCH",
    cutoffTime: "11:30 AM",
    label: "LUNCH · next window (today's dinner cutoff passed)",
    isPastCutoff: true,
  };
}

// ---- Checkout window resolution (mirrors the mobile app fix) ----
const LUNCH_CUTOFF_MINUTES = 11 * 60 + 30; // 11:30 IST
const DINNER_CUTOFF_MINUTES = 18 * 60 + 30; // 18:30 IST

function istMinutes(now = new Date()) {
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
  return ist.getHours() * 60 + ist.getMinutes();
}

export function isWindowOrderable(mealWindow, now = new Date()) {
  const minutes = istMinutes(now);
  return mealWindow === "LUNCH" ? minutes < LUNCH_CUTOFF_MINUTES : minutes < DINNER_CUTOFF_MINUTES;
}

/**
 * Which meal_window should checkout send for this cart?
 * - Cart line says LUNCH/DINNER and that window is still orderable -> keep it.
 * - Its window's cutoff passed (or unknown) -> the currently orderable window.
 */
export function resolveCheckoutMealWindow(cartLines = []) {
  const minutes = istMinutes();
  const orderable =
    minutes < LUNCH_CUTOFF_MINUTES
      ? { mealWindow: "LUNCH", label: "Lunch · 11:30 AM cutoff" }
      : minutes < DINNER_CUTOFF_MINUTES
        ? { mealWindow: "DINNER", label: "Dinner · 6:30 PM cutoff" }
        : { mealWindow: "LUNCH", label: "Lunch · tomorrow (dinner cutoff passed)" };
  const first = (cartLines || [])[0];
  const requested =
    first && (first.mealWindow === "LUNCH" || first.mealWindow === "DINNER") ? first.mealWindow : null;
  if (!requested || !isWindowOrderable(requested)) return orderable;
  return {
    mealWindow: requested,
    label: requested === "LUNCH" ? "Lunch · 11:30 AM cutoff" : "Dinner · 6:30 PM cutoff",
  };
}
