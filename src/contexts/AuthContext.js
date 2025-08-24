// src/contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = กำลังเช็ค

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (u) => setUser(u ?? null));
    return () => unsub();
  }, []);

  const value = { user, loading: user === undefined };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
