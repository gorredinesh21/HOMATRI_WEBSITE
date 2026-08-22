"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { requestOtp as requestOtpApi, verifyOtp as verifyOtpApi } from "@/lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "homatri_customer_session";

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("UNKNOWN");
  const [token, setToken] = useState(null);
  const [customerPhone, setCustomerPhone] = useState(null);
  const [otpRequestId, setOtpRequestId] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const continuationRef = useRef(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setStatus("GUEST");
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed?.token && parsed?.customerPhone) {
        setToken(parsed.token);
        setCustomerPhone(parsed.customerPhone);
        setStatus("AUTHENTICATED");
      } else {
        setStatus("GUEST");
      }
    } catch {
      setStatus("GUEST");
    }
  }, []);

  const persist = useCallback((nextToken, phone) => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: nextToken, customerPhone: phone })
    );
  }, []);

  const requestOtp = useCallback(async (phone) => {
    setIsLoading(true);
    setOtpError(null);
    setStatus("OTP_REQUESTED");
    try {
      const result = await requestOtpApi(phone);
      setOtpRequestId(result?.otp_request_id || result?.request_id || null);
      return result;
    } catch (error) {
      setStatus("ERROR");
      setOtpError(error?.message || "Unable to send OTP. Please retry.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async ({ phone, otp }) => {
    setIsLoading(true);
    setOtpError(null);
    setStatus("OTP_SUBMITTING");
    try {
      const result = await verifyOtpApi({ phone, otp });
      const nextToken = result?.token || result?.access_token || result?.jwt || null;
      if (!nextToken) {
        throw new Error("OTP verified but no session token was returned.");
      }
      setToken(nextToken);
      setCustomerPhone(phone);
      setStatus("AUTHENTICATED");
      persist(nextToken, phone);
      setIsAuthModalOpen(false);
      const continuation = continuationRef.current;
      continuationRef.current = null;
      if (typeof continuation === "function") {
        continuation();
      }
      return result;
    } catch (error) {
      setStatus("ERROR");
      setOtpError(error?.message || "Invalid OTP. Please retry.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [persist]);

  const logout = useCallback(async () => {
    setToken(null);
    setCustomerPhone(null);
    setOtpRequestId(null);
    setStatus("GUEST");
    continuationRef.current = null;
    window.sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshSession = useCallback(async () => {
    if (!token) {
      setStatus("GUEST");
    }
  }, [token]);

  const requireAuthentication = useCallback((continuation) => {
    if (status === "AUTHENTICATED" && token) {
      if (typeof continuation === "function") continuation();
      return;
    }
    continuationRef.current = continuation || null;
    setIsAuthModalOpen(true);
    if (status !== "OTP_REQUESTED" && status !== "OTP_SUBMITTING") {
      setStatus("GUEST");
    }
  }, [status, token]);

  const loginWithPhone = useCallback((phone, nextToken) => {
    setCustomerPhone(phone);
    setToken(nextToken);
    setStatus("AUTHENTICATED");
    persist(nextToken, phone);
    setIsAuthModalOpen(false);
  }, [persist]);

  const isAuthenticated = status === "AUTHENTICATED" && Boolean(token);

  const value = useMemo(
    () => ({
      status,
      token,
      jwtToken: token,
      customerPhone,
      user: customerPhone ? { phone: customerPhone } : null,
      otpRequestId,
      otpError,
      isLoading,
      isAuthenticated,
      isAuthModalOpen,
      setIsAuthModalOpen,
      requestOtp,
      verifyOtp,
      logout,
      refreshSession,
      requireAuthentication,
      loginWithPhone,
    }),
    [
      status,
      token,
      customerPhone,
      otpRequestId,
      otpError,
      isLoading,
      isAuthenticated,
      isAuthModalOpen,
      requestOtp,
      verifyOtp,
      logout,
      refreshSession,
      requireAuthentication,
      loginWithPhone,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
