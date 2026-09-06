"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { GOOGLE_CLIENT_ID } from "@/lib/authClient";
import { forgotPassword, resetPassword } from "@/lib/api";

export default function PhoneOtpModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    registerWithPassword,
    loginWithPassword,
    completeGoogleAuth,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState("SIGN_UP"); // SIGN_UP | LOG_IN | FORGOT_1 | FORGOT_2
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [localError, setLocalError] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetHint, setResetHint] = useState("");
  const [resetBusy, setResetBusy] = useState(false);

  if (!isAuthModalOpen) return null;

  const close = () => {
    setIsAuthModalOpen(false);
    setLocalError("");
    setPassword("");
    setMode("SIGN_UP");
    setResetOtp("");
    setNewPassword("");
    setResetHint("");
  };

  const digitsOf = (raw) => raw.replace(/\D/g, "").slice(-10);

  const handleForgotStart = async (event) => {
    event.preventDefault();
    const digits = digitsOf(phone);
    if (digits.length !== 10) {
      setLocalError("Please enter a valid 10-digit Indian phone number.");
      return;
    }
    setLocalError("");
    setResetBusy(true);
    try {
      const res = await forgotPassword(digits);
      if (res?.channel === "EMAIL") {
        setResetHint(`We emailed a 6-digit code to ${res.hint || "your email"}. It expires in 10 minutes.`);
      } else if (res?.channel === "SMS") {
        setResetHint(`We SMSed a 6-digit code to ${res.hint || "your phone"}. It expires in 10 minutes.`);
      } else {
        setLocalError("No password account found for this number. Try signing up instead.");
        setResetBusy(false);
        return;
      }
      setMode("FORGOT_2");
    } catch (error) {
      setLocalError(error?.message || "Could not send the reset code.");
    } finally {
      setResetBusy(false);
    }
  };

  const handleForgotFinish = async (event) => {
    event.preventDefault();
    const digits = digitsOf(phone);
    if (!/^\d{6}$/.test(resetOtp.trim())) {
      setLocalError("Enter the 6-digit code we sent you.");
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setLocalError("New password must be at least 4 characters long.");
      return;
    }
    setLocalError("");
    setResetBusy(true);
    try {
      await resetPassword({ phone: digits, otp: resetOtp.trim(), newPassword });
      setLocalError("");
      setPassword("");
      setResetOtp("");
      setNewPassword("");
      setResetHint("");
      setMode("LOG_IN");
    } catch (error) {
      setLocalError(error?.message || "Could not reset the password.");
    } finally {
      setResetBusy(false);
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    const digits = digitsOf(phone);
    if (digits.length !== 10) {
      setLocalError("Please enter a valid 10-digit Indian phone number.");
      return;
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setLocalError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 4) {
      setLocalError("Password must be at least 4 characters long.");
      return;
    }

    setLocalError("");
    try {
      await registerWithPassword({ phone: digits, email: email.trim(), password, fullName: fullName.trim() });
      close();
    } catch (error) {
      setLocalError(error?.message || "Sign up failed. Phone number may already be registered.");
    }
  };

  const handleLogIn = async (event) => {
    event.preventDefault();
    const digits = digitsOf(phone);
    if (digits.length !== 10) {
      setLocalError("Please enter a valid 10-digit Indian phone number.");
      return;
    }
    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    setLocalError("");
    try {
      await loginWithPassword({ phone: digits, password });
      close();
    } catch (error) {
      setLocalError(error?.message || "Log in failed. Invalid phone or password.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-homatri-border space-y-5">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
        >
          ✕
        </button>

        {/* Modal Title Header */}
        <div className="text-center space-y-1 pt-2">
          <h2 className="text-2xl font-black text-homatri-dark">
            {mode === "SIGN_UP"
              ? "Create Your Account 🍱"
              : mode === "LOG_IN"
                ? "Welcome Back 👋"
                : mode === "FORGOT_1"
                  ? "Reset Your Password 🔑"
                  : "Enter the Code ✉️"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {mode === "SIGN_UP"
              ? "Sign up with your phone, email & password to order home-cooked tiffins."
              : mode === "LOG_IN"
                ? "Log in with your registered phone number & password."
                : mode === "FORGOT_1"
                  ? "We'll send a 6-digit code to your email (or phone) on file."
                  : resetHint || "Check your email or messages for the 6-digit code."}
          </p>
        </div>

        {localError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl text-center">
            {localError}
          </div>
        ) : null}

        {/* SEPARATE SIGN_UP FORM */}
        {mode === "SIGN_UP" ? (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9820098200"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Full Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Dinesh Chandan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md transition disabled:opacity-50 uppercase tracking-wider"
            >
              {isLoading ? "Creating Account..." : "Create Account & Sign Up"}
            </button>
          </form>
        ) : mode === "LOG_IN" ? (
          /* SEPARATE LOG_IN FORM */
          <form onSubmit={handleLogIn} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9820098200"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md transition disabled:opacity-50 uppercase tracking-wider"
            >
              {isLoading ? "Logging in..." : "Log In to Homatri"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("FORGOT_1");
                setLocalError("");
                setResetHint("");
              }}
              className="w-full text-center text-xs font-bold text-orange-600 hover:underline"
            >
              Forgot password?
            </button>
          </form>
        ) : mode === "FORGOT_1" ? (
          <form onSubmit={handleForgotStart} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                Registered Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9820098200"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={resetBusy}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md transition disabled:opacity-50 uppercase tracking-wider"
            >
              {resetBusy ? "Sending code…" : "Send Reset Code"}
            </button>
          </form>
        ) : mode === "FORGOT_2" ? (
          <form onSubmit={handleForgotFinish} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                6-Digit Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-bold tracking-[0.4em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Choose a new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                required
              />
            </div>
            <button
              type="submit"
              disabled={resetBusy}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-md transition disabled:opacity-50 uppercase tracking-wider"
            >
              {resetBusy ? "Resetting…" : "Set New Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("FORGOT_1");
                setLocalError("");
              }}
              className="w-full text-center text-xs font-bold text-slate-500 hover:underline"
            >
              Didn&apos;t get the code? Send again
            </button>
          </form>
        ) : null}

        {/* GOOGLE SIGN IN BUTTON — only when a client id is configured
            (rendering GoogleLogin without GoogleOAuthProvider crashes the app) */}
        {(mode === "SIGN_UP" || mode === "LOG_IN") && GOOGLE_CLIENT_ID ? (
          <div className="pt-2 border-t border-slate-200">
            <div className="text-center text-[10px] uppercase font-bold text-slate-400 mb-2">Or Continue With</div>
            <div className="flex justify-center">
              <GoogleLogin
                clientId={GOOGLE_CLIENT_ID}
                onSuccess={(res) => completeGoogleAuth({ idToken: res.credential })}
                onError={() => setLocalError("Google sign in failed.")}
              />
            </div>
          </div>
        ) : null}

        {/* LINK TO TOGGLE BETWEEN SIGN_UP AND LOG_IN */}
        <div className={`text-center pt-1 border-t border-slate-100 ${(mode === "SIGN_UP" || mode === "LOG_IN") ? "" : "hidden"}`}>
          {mode === "SIGN_UP" ? (
            <p className="text-xs text-slate-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("LOG_IN");
                  setLocalError("");
                }}
                className="font-bold text-orange-600 hover:underline"
              >
                Log In
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("SIGN_UP");
                  setLocalError("");
                }}
                className="font-bold text-orange-600 hover:underline"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
