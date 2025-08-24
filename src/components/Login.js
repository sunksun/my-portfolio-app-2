// src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await signInWithEmailAndPassword(getAuth(), email.trim(), password);
      navigate("/dashboard"); // แก้ path ตามที่ต้องการ
    } catch (error) {
      setErr(error.message || "เข้าสู่ระบบไม่สำเร็จ");
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
