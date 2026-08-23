"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, CreditCard, ShieldCheck, MapPin, Package, Check, Sparkles } from "lucide-react";

export default function FullPagePayment() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("order_id") || "ORD-HOMATRI";
  const amountStr = searchParams.get("amount") || "179";
  const amountNumber = parseFloat(amountStr) || 179;
  const amountPaise = Math.round(amountNumber * 100);

  const [paymentStatus, setPaymentStatus] = useState("IDLE");
  const [errorMsg, setErrorMsg] = useState("");
  const [savedAddress, setSavedAddress] = useState(null);

  useEffect(() => {
    try {
      const local = window.localStorage.getItem("homatri_selected_address");
      if (local) {
        setSavedAddress(JSON.parse(local));
      }
    } catch (e) {}
  }, []);

  const simulateSuccess = () => {
    setPaymentStatus("SUCCESS");
    setTimeout(() => {
      router.push(`/order/tracking?order_id=${encodeURIComponent(orderId)}`);
    }, 800);
  };

  const triggerRazorpay = () => {
    if (typeof window === "undefined" || !window.Razorpay) {
      setErrorMsg("Razorpay SDK is loading... Please click again in 2 seconds.");
      return;
    }
    setErrorMsg("");
    setPaymentStatus("PROCESSING");

    const options = {
      key: "rzp_live_TTCnAhgfkFLtmh",
      amount: amountPaise,
      currency: "INR",
      name: "Homatri Tiffin Services",
      description: `Payment for Order ${orderId}`,
      image: "/logo.jpg",
      prefill: {
        name: "Homatri Member",
        contact: savedAddress?.phone || "7416767453",
      },
      theme: { color: "#E53A00" },
      handler: function (response) {
        setPaymentStatus("SUCCESS");
        setTimeout(() => {
          router.push(`/order/tracking?order_id=${encodeURIComponent(orderId)}`);
        }, 1000);
      },
      modal: {
        ondismiss: function () {
          setPaymentStatus("IDLE");
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPaymentStatus("IDLE");
      setErrorMsg(err?.message || "Could not launch Razorpay window.");
    }
  };

  return (
    <div className="min-h-screen bg-homatri-cream pb-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-homatri-border">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/order" className="flex items-center gap-2 text-sm font-bold text-homatri-dark hover:text-homatri-orange">
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Return</span>
          </Link>
          <span className="font-display italic font-medium text-lg text-homatri-orange">
            Homatri Test Checkout
          </span>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-8 space-y-6">
        
        {/* Payment Summary Box */}
        <div className="bg-white rounded-3xl p-6 border border-homatri-border shadow-xl text-center space-y-5">
          
          <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-center mx-auto text-emerald-800 shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>

          <div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              🧪 MOCK TEST MODE ACTIVE (FREE)
            </span>
            <h1 className="font-display font-medium text-2xl text-homatri-dark mt-2">
              Complete Test Order
            </h1>
            <p className="text-xs font-semibold text-homatri-muted mt-1">
              Order ID: <strong className="text-homatri-dark font-mono">{orderId}</strong>
            </p>
          </div>

          <div className="bg-homatri-cream border border-homatri-border rounded-2xl p-4 text-left space-y-2">
            <div className="flex justify-between text-xs text-homatri-muted">
              <span>Kitchen:</span>
              <span className="font-bold text-homatri-dark">Surmai Konkan Kitchen</span>
            </div>
            <div className="flex justify-between text-xs text-homatri-muted">
              <span>Delivery Address:</span>
              <span className="font-bold text-homatri-dark line-clamp-1">
                {savedAddress?.fullAddress || "Flat 402, Sector 8, Ghansoli"}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-homatri-dark pt-2 border-t border-homatri-border">
              <span>Order Value:</span>
              <span className="text-base text-emerald-600 font-extrabold">₹{amountNumber.toFixed(2)}</span>
            </div>
          </div>

          {errorMsg ? (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center font-medium">
              {errorMsg}
            </p>
          ) : null}

          {/* Primary FREE Mock Test Button (Zero Cost!) */}
          <button
            type="button"
            onClick={simulateSuccess}
            disabled={paymentStatus === "SUCCESS"}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            <span>
              {paymentStatus === "SUCCESS"
                ? "Payment Verified! Redirecting..."
                : "✅ FREE MOCK PAYMENT (SIMULATE SUCCESS)"}
            </span>
          </button>

          {/* Secondary Live Razorpay Button */}
          <button
            type="button"
            onClick={triggerRazorpay}
            disabled={paymentStatus === "PROCESSING" || paymentStatus === "SUCCESS"}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Test Real Razorpay Window (Live Bank Charge)</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-homatri-muted pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mock Mode Active — Zero Bank Charges</span>
          </div>

        </div>

      </main>
    </div>
  );
}
