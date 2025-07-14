import React, { useState } from 'react';

export default function Account() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    // TODO: เชื่อมต่อ backend เพื่อบันทึกข้อมูล
    alert('บันทึกข้อมูลสำเร็จ!');
  };

  return (
    <div>
      <h2>ข้อมูลบัญชีผู้ใช้</h2>
      <input name="username" value={form.username} onChange={handleChange} placeholder="ชื่อผู้ใช้" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="อีเมล" />
      <input name="password" value={form.password} onChange={handleChange} placeholder="รหัสผ่านใหม่" type="password" />
      <button onClick={handleSave}>บันทึก</button>
    </div>
  );
}
