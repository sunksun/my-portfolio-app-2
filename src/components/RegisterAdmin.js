// src/components/Register.js
import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Register() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();

  async function handleSubmit(e) {
    e.preventDefault();

    // เฉพาะแอดมินเท่านั้นที่สมัครได้
    const allowedAdmins = ['phattharaphong1211@gmail.com'];
    const adminPassword = 'moonlight_07';
    if (!allowedAdmins.includes(emailRef.current.value)) {
      setError('อีเมลนี้ไม่ได้รับอนุญาตให้สมัครเป็นผู้ดูแลระบบ');
      return;
    }
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('รหัสผ่านไม่ตรงกัน');
    }
    if (passwordRef.current.value !== adminPassword) {
      return setError('รหัสผ่านสำหรับแอดมินไม่ถูกต้อง');
    }

    try {
      setError('');
      setLoading(true);
      const userCredential = await signup(emailRef.current.value, passwordRef.current.value);
      const user = userCredential.user;
      await setDoc(doc(db, 'ADMIN', user.uid), {
        admin_id: user.uid,
        username: emailRef.current.value,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      navigate('/admin-dashboard');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('อีเมลนี้ถูกใช้งานแล้ว');
      } else if (error.code === 'auth/weak-password') {
        setError('รหัสผ่านอ่อนแอเกินไป');
      } else {
        setError('ไม่สามารถสร้างบัญชีได้');
      }
    }

    setLoading(false);
  }

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>สมัครสมาชิก</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>อีเมล</label>
            <input 
              type="email" 
              ref={emailRef} 
              required 
              placeholder="กรอกอีเมล"
            />
          </div>
          <div className="form-group">
            <label>รหัสผ่าน</label>
            <input 
              type="password" 
              ref={passwordRef} 
              required 
              placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
            />
          </div>
          <div className="form-group">
            <label>ยืนยันรหัสผ่าน</label>
            <input 
              type="password" 
              ref={passwordConfirmRef} 
              required 
              placeholder="กรอกรหัสผ่านอีกครั้ง"
            />
          </div>
          <button disabled={loading} type="submit" className="btn btn-primary">
            {loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
          </button>
        </form>
        <div className="text-center">
          มีบัญชีแล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
        </div>
      </div>
    </div>
  );
}