"use client";

import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null if guest customer
  const [jwtToken, setJwtToken] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loginWithPhone = (phone, token) => {
    setUser({ phone });
    setJwtToken(token);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setJwtToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        jwtToken,
        isAuthenticated: !!user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginWithPhone,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
