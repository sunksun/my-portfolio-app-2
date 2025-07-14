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
    <div>
      <h2>ผลงาน</h2>
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
