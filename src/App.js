// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomeScreen from "./homescreens/HomeScreen";
import Login from "./components/Login";
import Signup from "./components/Signup";
import RegisterAdmin from "./components/RegisterAdmin";
import Dashboard from "./components/Dashboard";
import UserProfile from "./components/UserProfile";
import Education from "./components/Education";
import WorkManagement from "./components/WorkManagement";
import PortfolioBuilder from "./components/PortfolioBuilder";
import AdminDashboard from "./components/AdminDashboard";
import TemplateEdit from "./components/TemplateEdit";
import TemplateStyle from "./components/TemplateStyle";
import InitializeTemplates from "./components/InitializeTemplates";
import RequireAuth, { RequireAdmin } from "./components/PrivateRoute";
import UserLayout from "./components/UserLayout";

export default function App() {
  return (
    <Routes>
      {/* หน้าแรก */}
      <Route path="/" element={<HomeScreen />} />
      <Route path="/home" element={<HomeScreen />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/register-admin" element={<RegisterAdmin />} />

      {/* ต้องล็อกอินก่อน */}
      <Route element={<RequireAuth />}>
        {/* กลุ่ม /dashboard ทั้งหมดอยู่ภายใต้ UserLayout */}
        <Route path="/dashboard" element={<UserLayout />}>
          <Route index element={<Dashboard />} />                 {/* /dashboard */}
          <Route path="announcements" element={<Dashboard />} />  {/* /dashboard/announcements (เปลี่ยนเป็นหน้าจริงได้) */}
          <Route path="profile" element={<UserProfile />} />      {/* /dashboard/profile */}
          <Route path="education" element={<Education />} />      {/* /dashboard/education */}
          <Route path="works" element={<WorkManagement />} />     {/* /dashboard/works */}
          <Route path="builder" element={<PortfolioBuilder />} /> {/* /dashboard/builder */}
        </Route>

        {/* เฉพาะแอดมิน */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-dashboard/templates" element={<TemplateEdit />} />
          <Route path="/admin-dashboard/styles" element={<TemplateStyle />} />
          <Route path="/admin-dashboard/initialize-templates" element={<InitializeTemplates />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<div className="p-6">ไม่พบหน้า</div>} />
    </Routes>
  );
}
