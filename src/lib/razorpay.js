// Shared Razorpay Checkout.js loader + modal opener. Used by the cart drawer
// checkout flow and the order-tracking "complete payment" retry.

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open the real Razorpay checkout modal.
 * `verify` receives the success-handler response (gateway ids + signature).
 * `onDone` always fires once the flow is over (success-verified, failed or dismissed).
 */
export async function openRazorpayCheckout({ payment, orderId, customerPhone, name, verify, onDone }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onDone?.({ ok: false, reason: "script-load-failed" });
    return;
  }
  const finish = (result) => onDone?.(result);
  const rzp = new window.Razorpay({
    key: payment.key_id,
    amount: Math.round((payment.amount_rupees || 0) * 100),
    currency: "INR",
    name: "Homaatri",
    description: `Tiffin order ${orderId}`,
    order_id: payment.razorpay_order_id,
    prefill: {
      name: name || "",
      contact: customerPhone ? `+91${String(customerPhone).slice(-10)}` : "",
    },
    theme: { color: "#F97316" },
    handler: async (response) => {
      let ok = true;
      try {
        await verify(response);
      } catch {
        ok = false;
      }
      finish({ ok, reason: ok ? "verified" : "verification-failed" });
    },
    modal: { ondismiss: () => finish({ ok: false, reason: "dismissed" }) },
  });
  rzp.on("payment.failed", () => finish({ ok: false, reason: "payment-failed" }));
  rzp.open();
}
