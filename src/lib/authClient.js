export const CARTOON_AVATARS = [
  { id: "avatar_chef_cartoon_1.png", label: "Chef Mom", emoji: "👩‍🍳" },
  { id: "avatar_foodie_cartoon_2.png", label: "Happy Foodie", emoji: "😋" },
  { id: "avatar_tiffin_cartoon_3.png", label: "Tiffin Box", emoji: "🍱" },
  { id: "avatar_spices_cartoon_4.png", label: "Spices", emoji: "🌶️" },
];

export const MSG91_WIDGET_ID =
  process.env.NEXT_PUBLIC_MSG91_WIDGET_ID ||
  process.env.NEXT_PUBLIC_MSG91_WIDGET_ID ||
  "";

export const MSG91_WIDGET_TOKEN =
  process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN ||
  process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN ||
  "";

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function loadMsg91Sdk() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("MSG91 SDK is browser-only"));
      return;
    }
    if (window.sendOtp || window.verifyOtp || window.initSendOTP) {
      resolve(window);
      return;
    }
    const existing = document.querySelector("script[data-msg91-otp]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window));
      existing.addEventListener("error", () => reject(new Error("Failed to load MSG91 SDK")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://verify.msg91.com/otp-provider.js";
    script.async = true;
    script.dataset.msg91Otp = "true";
    script.onload = () => resolve(window);
    script.onerror = () => reject(new Error("Failed to load MSG91 SDK"));
    document.body.appendChild(script);
  });
}

export function initMsg91Widget({ identifier, onSuccess, onFailure }) {
  const configuration = {
    widgetId: MSG91_WIDGET_ID,
    tokenAuth: MSG91_WIDGET_TOKEN,
    identifier,
    exposeMethods: true,
    success: onSuccess,
    failure: onFailure,
  };
  if (typeof window.initSendOTP === "function") {
    window.initSendOTP(configuration);
  }
  return configuration;
}
