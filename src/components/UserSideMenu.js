// src/components/UserSideMenu.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext"; // path ของคุณ

export default function UserSideMenu() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [checking, setChecking] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    let cancelled = false;
    async function checkAdmin() {
      try {
        if (!user) { setIsAdmin(false); return; }

        // 1) เช็ค custom claim admin
        const auth = getAuth();
        const token = await auth.currentUser.getIdTokenResult(true);
        if (token?.claims?.admin) {
          if (!cancelled) setIsAdmin(true);
          return;
        }

        // 2) เช็คเอกสาร Firestore ADMIN/{uid}
        const db = getFirestore();
        const snap = await getDoc(doc(db, "ADMIN", user.uid));
        if (!cancelled) setIsAdmin(snap.exists());
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    checkAdmin();
    return () => { cancelled = true; };
  }, [user]);

  const Item = ({ to, children }) => (
    <li>
      <Link
        to={to}
        className={
          "block px-3 py-1.5 rounded hover:underline " +
          (location.pathname.startsWith(to) ? "font-semibold" : "")
        }
      >
        {children}
      </Link>
    </li>
  );

  return (
    <div className="border rounded p-4 bg-white">
      <div className="font-bold mb-2">เมนูอื่น ๆ</div>
      <ul className="ml-0 space-y-1 text-sm">
        <Item to="/dashboard/announcements">ดูประกาศ/ข่าวสาร</Item>
        <Item to="/dashboard/profile">ตั้งค่าบัญชี</Item>
        {isAdmin && <Item to="/admin-dashboard">หน้าแอดมิน</Item>}
      </ul>
      {checking && <div className="text-xs text-slate-500 mt-2">ตรวจสอบสิทธิ์แอดมิน...</div>}
    </div>
  );
}
