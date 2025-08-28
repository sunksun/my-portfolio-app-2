// src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/invalid-credential':
        return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      case 'auth/user-not-found':
        return 'ไม่พบผู้ใช้งานนี้ในระบบ';
      case 'auth/wrong-password':
        return 'รหัสผ่านไม่ถูกต้อง';
      case 'auth/invalid-email':
        return 'รูปแบบอีเมลไม่ถูกต้อง';
      case 'auth/user-disabled':
        return 'บัญชีผู้ใช้ถูกปิดใช้งาน';
      case 'auth/too-many-requests':
        return 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ในภายหลัง';
      default:
        return error.message || 'เข้าสู่ระบบไม่สำเร็จ';
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    
    if (!email || !password) {
      setErr("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    
    try {
      console.log("Attempting to sign in...");
      await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log("Sign in successful");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErr(getErrorMessage(error));
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">เข้าสู่ระบบ</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="border w-full px-3 py-2 rounded"
          placeholder="อีเมล"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border w-full px-3 py-2 rounded"
          placeholder="รหัสผ่าน"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="w-full bg-black text-white rounded px-3 py-2">
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
}
