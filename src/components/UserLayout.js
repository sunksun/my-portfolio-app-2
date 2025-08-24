// src/components/UserLayout.js
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

const Item = ({ to, children, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `block rounded px-3 py-2 text-sm ${
        isActive ? "bg-black text-white" : "hover:bg-black/5"
      }`
    }
  >
    {children}
  </NavLink>
);

export default function UserLayout() {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(getAuth());
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      {/* เมนูซ้าย */}
      <aside className="border-r p-4">
        <div className="font-bold mb-3">e-Portfolio</div>
        <div className="space-y-1">
          {/* ใช้ 'relative path' เพราะเราอยู่ใต้ /dashboard แล้ว */}
          <Item to="." end>แดชบอร์ด</Item>          {/* /dashboard */}
          <Item to="profile" end>โปรไฟล์</Item>      {/* /dashboard/profile */}
          <Item to="education">การศึกษา</Item>       {/* /dashboard/education */}
          <Item to="works">ผลงาน</Item>             {/* /dashboard/works */}
          <Item to="builder">สร้างหน้าปก </Item> {/* /dashboard/builder */}
          {/* แอดมินใช้ absolute path */}
          <Item to="/admin-dashboard" end>ไปหน้าแอดมิน</Item>
        </div>

        <button
          onClick={logout}
          className="mt-6 w-full rounded bg-red-600 text-white px-3 py-2 text-sm"
        >
          ออกจากระบบ
        </button>
      </aside>

      {/* เนื้อหาแต่ละหน้า */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
