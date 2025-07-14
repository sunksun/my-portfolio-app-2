// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children, requiredRole }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;

  // ตรวจสอบสิทธิ์ admin
  if (requiredRole === 'admin' && currentUser.email !== 'phattharaphong1211@gmail.com') {
    return <Navigate to="/login" />;
  }
  // ตรวจสอบสิทธิ์ user (ไม่ใช่ admin)
  if (requiredRole === 'user' && currentUser.email === 'phattharaphong1211@gmail.com') {
    return <Navigate to="/dashboard" />; // หรือ redirect ไปหน้า admin
  }
  return children;
}