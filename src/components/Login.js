import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // redirect ตามสิทธิ์
      if (email === 'phattharaphong1211@gmail.com') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError('เข้าสู่ระบบไม่สำเร็จ');
    }
    setLoading(false);
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>เข้าสู่ระบบ</h2>
        {error && <div className="error">{error}</div>}
        
        <div className="form-group">
          <label>อีเมล</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>รหัสผ่าน</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button disabled={loading} type="submit">
          เข้าสู่ระบบ
        </button>
        <div className="text-center">
          ยังไม่มีบัญชี? <a href="/register">สมัครสมาชิก</a>
        </div>
      </form>
    </div>
  );
}