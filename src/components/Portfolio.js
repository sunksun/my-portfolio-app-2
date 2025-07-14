import React, { useState } from 'react';

export default function Portfolio() {
  const [portfolios, setPortfolios] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = () => {
    if (!form.title || !form.description) return;
    setPortfolios([...portfolios, { ...form }]);
    setForm({ title: '', description: '' });
  };

  return (
    <div>
      <h2>Portfolio</h2>
      <input name="title" value={form.title} onChange={handleChange} placeholder="ชื่อ Portfolio" />
      <input name="description" value={form.description} onChange={handleChange} placeholder="รายละเอียด" />
      <button onClick={handleAdd}>เพิ่ม</button>
      <ul>
        {portfolios.map((p, idx) => (
          <li key={idx}>{p.title} - {p.description}</li>
        ))}
      </ul>
    </div>
  );
}
