"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PhoneOtpModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    requestOtp,
    verifyOtp,
    otpError,
    isLoading,
    status,
  } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("PHONE");

  if (!isAuthModalOpen) return null;

  const close = () => {
    setIsAuthModalOpen(false);
    setOtp("");
    setStep("PHONE");
  };

  const onRequest = async (event) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return;
    try {
      await requestOtp(digits);
      setStep("OTP");
    } catch {
      /* error surface via otpError */
    }
  };

  const onVerify = async (event) => {
    event.preventDefault();
    try {
      await verifyOtp({ phone: phone.replace(/\D/g, ""), otp });
      setOtp("");
      setStep("PHONE");
    } catch {
      /* error surface via otpError */
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-homatri-dark/50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-homatri-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-homatri-orange">
              Phone OTP
            </p>
            <h2 className="font-display text-2xl font-medium italic text-homatri-dark mt-1">
              Sign in to continue
            </h2>
            <p className="text-sm text-homatri-muted mt-2">
              Browse freely. Login is required only to add to cart, like, comment, or follow.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="text-homatri-muted hover:text-homatri-dark text-sm font-semibold"
          >
            Close
          </button>
        </div>

        {step === "PHONE" ? (
          <form onSubmit={onRequest} className="mt-6 space-y-4">
            <label className="block text-xs font-semibold text-homatri-dark">
              Mobile number
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="10-digit Indian mobile"
                className="mt-2 w-full rounded-xl border border-homatri-border px-4 py-3 text-sm font-medium text-homatri-dark focus:outline-none focus:ring-2 focus:ring-homatri-orange/40"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-homatri-orange hover:bg-homatri-orange-dark text-white font-bold py-3 rounded-xl disabled:opacity-60"
            >
              {isLoading ? "Sending OTP…" : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerify} className="mt-6 space-y-4">
            <p className="text-xs text-homatri-muted">
              Enter the OTP sent to <strong>{phone}</strong>
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="6-digit OTP"
              className="w-full rounded-xl border border-homatri-border px-4 py-3 text-sm font-medium tracking-[0.3em] text-center text-homatri-dark focus:outline-none focus:ring-2 focus:ring-homatri-orange/40"
            />
            <button
              type="submit"
              disabled={isLoading || status === "OTP_SUBMITTING"}
              className="w-full bg-homatri-orange hover:bg-homatri-orange-dark text-white font-bold py-3 rounded-xl disabled:opacity-60"
            >
              {isLoading ? "Verifying…" : "Verify & continue"}
            </button>
            <button
              type="button"
              onClick={() => setStep("PHONE")}
              className="w-full text-sm font-semibold text-homatri-muted"
            >
              Change number
            </button>
          </form>
        )}

        {otpError ? (
          <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {otpError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
