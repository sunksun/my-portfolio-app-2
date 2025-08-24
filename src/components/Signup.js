// components/Signup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setError('');
      await signup(email, password);
      navigate('/login');
    } catch (e) {
      setError('สมัครไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-4">สมัครสมาชิก</h1>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <input className="w-full border rounded-lg px-3 py-2 mb-3" type="email" placeholder="อีเมล" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded-lg px-3 py-2 mb-4" type="password" placeholder="รหัสผ่าน" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg px-3 py-2">{loading? 'กำลังสมัคร…':'สมัคร'}</button>
        <div className="text-sm mt-3">มีบัญชีแล้ว? <Link className="text-indigo-600" to="/login">เข้าสู่ระบบ</Link></div>
      </form>
    </div>
  );
}
