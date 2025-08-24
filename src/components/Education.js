// src/components/Education.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function Education() {
  const { currentUser } = useAuth();
  const [educations, setEducations] = useState([]);
  const [form, setForm] = useState({ institution: '', degree: '', gpa: '' });

  useEffect(() => {
    if (!currentUser) return;
    const fetchEducations = async () => {
      const q = query(collection(db, 'education'), where('user_id', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      setEducations(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchEducations();
  }, [currentUser]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    if (!form.institution || !form.degree || !form.gpa || !currentUser) return;
    const newEdu = { ...form, user_id: currentUser.uid };
    const docRef = await addDoc(collection(db, 'education'), newEdu);
    setEducations([...educations, { ...newEdu, id: docRef.id }]);
    setForm({ institution: '', degree: '', gpa: '' });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'education', id));
    setEducations(educations.filter(edu => edu.id !== id));
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center">
        <button type="button" onClick={() => window.history.back()} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700">ย้อนกลับ</button>
      </div>
      <h2>ประวัติการศึกษา</h2>
      <input name="institution" value={form.institution} onChange={handleChange} placeholder="สถาบัน" />
      <input name="degree" value={form.degree} onChange={handleChange} placeholder="วุฒิ" />
      <input name="gpa" value={form.gpa} onChange={handleChange} placeholder="GPA" />
      <button onClick={handleAdd}>เพิ่ม</button>
      <ul>
        {educations.map((edu) => (
          <li key={edu.id}>
            {edu.institution} - {edu.degree} - {edu.gpa}
            <button onClick={() => handleDelete(edu.id)} style={{ marginLeft: 8, color: 'red' }}>ลบ</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
