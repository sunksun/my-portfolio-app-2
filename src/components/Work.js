import React, { useState } from 'react';

export default function Work() {
  const [works, setWorks] = useState([]);
  const [form, setForm] = useState({ title: '', category: '', description: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = () => {
    if (!form.title || !form.category || !form.description) return;
    setWorks([...works, { ...form }]);
    setForm({ title: '', category: '', description: '' });
  };

  return (
    <div className="p-6">
      {/* ปุ่มย้อนกลับ */}
      <div className="mb-6 flex items-center">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          style={{ fontSize: '1rem' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          ย้อนกลับ
        </button>
      </div>
      <h2 className="text-xl font-bold mb-4">ผลงาน</h2>
      <input name="title" value={form.title} onChange={handleChange} placeholder="ชื่อผลงาน" />
      <input name="category" value={form.category} onChange={handleChange} placeholder="หมวดหมู่" />
      <input name="description" value={form.description} onChange={handleChange} placeholder="รายละเอียด" />
      <button onClick={handleAdd}>เพิ่ม</button>
      <ul>
        {works.map((work, idx) => (
          <li key={idx}>{work.title} - {work.category} - {work.description}</li>
        ))}
      </ul>
    </div>
  );
}
