"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { GOOGLE_CLIENT_ID } from "@/lib/authClient";

export default function PhoneOtpModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    registerWithPassword,
    loginWithPassword,
    completeGoogleAuth,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState("SIGN_UP"); // "SIGN_UP" or "LOG_IN"
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [localError, setLocalError] = useState("");

  if (!isAuthModalOpen) return null;

  const close = () => {
    setIsAuthModalOpen(false);
    setLocalError("");
    setPassword("");
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, "").slice(-10);
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
    const digits = phone.replace(/\D/g, "").slice(-10);
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
            {mode === "SIGN_UP" ? "Create Your Account 🍱" : "Welcome Back 👋"}
          </h2>
          <p className="text-xs text-homatri-muted">
            {mode === "SIGN_UP"
              ? "Sign up with your phone, email & password to order home-cooked tiffins."
              : "Log in with your registered phone number & password."}
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
        ) : (
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
          </form>
        )}

        {/* GOOGLE SIGN IN BUTTON */}
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

        {/* LINK TO TOGGLE BETWEEN SIGN_UP AND LOG_IN */}
        <div className="text-center pt-1 border-t border-slate-100">
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
