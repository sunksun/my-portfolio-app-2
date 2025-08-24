// src/components/Dashboard.js
import React from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const items = [
    { to: "profile",   label: "จัดการโปรไฟล์" },     // => /dashboard/profile
    { to: "education", label: "ประวัติการศึกษา" },   // => /dashboard/education
    { to: "works",     label: "ผลงาน/โครงงาน" },     // => /dashboard/works
    { to: "builder",   label: "สร้างหน้าปกพอร์ต" }, // => /dashboard/builder
    { to: "/admin-dashboard", label: "หน้าผู้ดูแลระบบ" }, // absolute สำหรับแอดมิน
  ];

  return (
    <div className="stack">
      <header>
        <h1>แดชบอร์ด</h1>
        <p className="text-sm text-slate-500">จัดการข้อมูลพอร์ตโฟลิโอของคุณ</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Link key={i.label} to={i.to} className="link-card">
            {i.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
