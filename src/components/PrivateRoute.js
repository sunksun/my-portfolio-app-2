import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">กำลังตรวจสอบสิทธิ์...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireAdmin() {
  const { user, loading } = useAuth();
  const [ok, setOk] = React.useState(undefined);

  React.useEffect(() => {
    async function check() {
      if (!user) return setOk(false);
      try {
        const auth = getAuth();
        const token = await auth.currentUser.getIdTokenResult(true);
        if (token?.claims?.admin) return setOk(true); // custom claim
      } catch {}
      try {
        const db = getFirestore();
        const snap = await getDoc(doc(db, "ADMIN", user.uid)); // fallback firestore
        setOk(snap.exists());
      } catch {
        setOk(false);
      }
    }
    check();
  }, [user]);

  if (loading || ok === undefined) return <div className="p-6">กำลังตรวจสอบสิทธิ์แอดมิน...</div>;
  if (!user || !ok) return <div className="p-6 text-rose-600">ไม่มีสิทธิ์แอดมิน</div>;
  return <Outlet />;
}
