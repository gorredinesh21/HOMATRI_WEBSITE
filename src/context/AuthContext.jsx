"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  googleLogin,
  refreshAuthSession,
  requestOtp as requestOtpApi,
  verifyMsg91Widget,
  verifyOtp as verifyOtpApi,
} from "@/lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "homatri_customer_session";

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("UNKNOWN");
  const [token, setToken] = useState(null);
  const [customerPhone, setCustomerPhone] = useState(null);
  const [user, setUser] = useState(null);
  const [otpRequestId, setOtpRequestId] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const continuationRef = useRef(null);

  const persist = useCallback((nextToken, phone, nextUser) => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: nextToken, customerPhone: phone, user: nextUser })
    );
  }, []);

  const applySession = useCallback(
    (result, fallbackPhone) => {
      const nextToken = result?.access_token || result?.token || result?.jwt || null;
      if (!nextToken) throw new Error("No session token was returned.");
      const nextUser = result.user || { phone: fallbackPhone };
      const phone = nextUser.phone || fallbackPhone || null;
      setToken(nextToken);
      setCustomerPhone(phone);
      setUser(nextUser);
      setStatus("AUTHENTICATED");
      persist(nextToken, phone, nextUser);
      setIsAuthModalOpen(false);
      const continuation = continuationRef.current;
      continuationRef.current = null;
      if (typeof continuation === "function") continuation();
      return result;
    },
    [persist]
  );

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.token) {
            if (!cancelled) {
              setToken(parsed.token);
              setCustomerPhone(parsed.customerPhone || null);
              setUser(parsed.user || { phone: parsed.customerPhone });
              setStatus("AUTHENTICATED");
            }
          }
        }
        try {
          const refreshed = await refreshAuthSession();
          if (refreshed?.access_token && !cancelled) {
            applySession(refreshed, refreshed.user?.phone);
            return;
          }
        } catch {
          /* guest until they sign in */
        }
        if (!cancelled && !raw) setStatus("GUEST");
      } catch {
        if (!cancelled) setStatus("GUEST");
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [applySession]);

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

  const verifyOtp = useCallback(
    async ({ phone, otp }) => {
      setIsLoading(true);
      setOtpError(null);
      setStatus("OTP_SUBMITTING");
      try {
        const result = await verifyOtpApi({ phone, otp });
        return applySession(result, phone);
      } catch (error) {
        setStatus("ERROR");
        setOtpError(error?.message || "Invalid OTP. Please retry.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [applySession]
  );

  const completeMsg91Auth = useCallback(
    async ({ phone, msg91Token, fullName, avatarUrl }) => {
      setIsLoading(true);
      setOtpError(null);
      try {
        const result = await verifyMsg91Widget({
          phone,
          msg91Token,
          fullName,
          avatarUrl,
          isCartoonAvatar: true,
        });
        return applySession(result, phone);
      } catch (error) {
        setStatus("ERROR");
        setOtpError(error?.message || "MSG91 verification failed.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [applySession]
  );

  const completeGoogleAuth = useCallback(
    async ({ idToken, avatarUrl, isCartoonAvatar }) => {
      setIsLoading(true);
      setOtpError(null);
      try {
        const result = await googleLogin({ idToken, avatarUrl, isCartoonAvatar });
        return applySession(result, result.user?.phone);
      } catch (error) {
        setStatus("ERROR");
        setOtpError(error?.message || "Google sign-in failed.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    setToken(null);
    setCustomerPhone(null);
    setUser(null);
    setOtpRequestId(null);
    setStatus("GUEST");
    continuationRef.current = null;
    window.sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshed = await refreshAuthSession();
    if (refreshed?.access_token) applySession(refreshed, refreshed.user?.phone);
  }, [applySession]);

  const requireAuthentication = useCallback(
    (continuation) => {
      if (status === "AUTHENTICATED" && token) {
        if (typeof continuation === "function") continuation();
        return;
      }
      continuationRef.current = continuation || null;
      setIsAuthModalOpen(true);
    },
    [status, token]
  );

  const loginWithPhone = useCallback(
    (phone, nextToken) => {
      applySession({ access_token: nextToken, user: { phone } }, phone);
    },
    [applySession]
  );

  const isAuthenticated = status === "AUTHENTICATED" && Boolean(token);

  const value = useMemo(
    () => ({
      status,
      token,
      jwtToken: token,
      customerPhone,
      user: user || (customerPhone ? { phone: customerPhone } : null),
      otpRequestId,
      otpError,
      isLoading,
      isAuthenticated,
      isAuthModalOpen,
      setIsAuthModalOpen,
      requestOtp,
      verifyOtp,
      completeMsg91Auth,
      completeGoogleAuth,
      logout,
      refreshSession,
      requireAuthentication,
      loginWithPhone,
    }),
    [
      status,
      token,
      customerPhone,
      user,
      otpRequestId,
      otpError,
      isLoading,
      isAuthenticated,
      isAuthModalOpen,
      requestOtp,
      verifyOtp,
      completeMsg91Auth,
      completeGoogleAuth,
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
