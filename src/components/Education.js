import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function Education() {
  const { currentUser } = useAuth();
  const [educations, setEducations] = useState([]);
  const [form, setForm] = useState({ institution: '', degree: '', gpa: '' });

  // โหลดข้อมูลการศึกษาจาก Firestore เมื่อ component โหลด
  useEffect(() => {
    if (!currentUser) return;
    const fetchEducations = async () => {
      const q = query(collection(db, 'educations'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      setEducations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEducations();
  }, [currentUser]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // เพิ่มข้อมูลการศึกษาใหม่ลง Firestore
  const handleAdd = async () => {
    if (!form.institution || !form.degree || !form.gpa || !currentUser) return;
    const newEdu = { ...form, userId: currentUser.uid };
    const docRef = await addDoc(collection(db, 'educations'), newEdu);
    setEducations([...educations, { ...newEdu, id: docRef.id }]);
    setForm({ institution: '', degree: '', gpa: '' });
  };

  // ลบข้อมูลการศึกษาจาก Firestore
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'educations', id));
    setEducations(educations.filter(edu => edu.id !== id));
  };

  return (
    <div>
      <h2>ประวัติการศึกษา</h2>
      <input name="institution" value={form.institution} onChange={handleChange} placeholder="สถาบัน" />
      <input name="degree" value={form.degree} onChange={handleChange} placeholder="วุฒิ" />
      <input name="gpa" value={form.gpa} onChange={handleChange} placeholder="GPA" />
      <button onClick={handleAdd}>เพิ่ม</button>
      <ul>
        {educations.map((edu, idx) => (
          <li key={edu.id || idx}>
            {edu.institution} - {edu.degree} - {edu.gpa}
            <button onClick={() => handleDelete(edu.id)} style={{ marginLeft: 8, color: 'red' }}>ลบ</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
