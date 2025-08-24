// src/components/WorkManagement.js
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['image/jpeg','image/png','image/webp','video/mp4','video/webm'];

const uploadToCloudinary = async (file) => {
  if (!file) return '';
  if (file.size > MAX_FILE_SIZE) throw new Error('ไฟล์เกิน 20MB');
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('ชนิดไฟล์ไม่อนุญาต');

  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD;
  const preset = import.meta.env.VITE_CLOUDINARY_PRESET;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = await res.json();
  return data.secure_url;
};

export default function WorkManagement() {
  const { currentUser } = useAuth();
  const db = getFirestore();

  const [works, setWorks] = useState([]);
  const [form, setForm] = useState({ title: '', category: '', description: '', file: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const fetchWorks = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'work'), where('user_id', '==', currentUser.uid), orderBy('uploaded_at', 'desc'));
        const snap = await getDocs(q);
        setWorks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      }
      setLoading(false);
    };
    fetchWorks();
  }, [currentUser, db]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true); setError('');

    try {
      const fileUrl = await uploadToCloudinary(form.file);
      await addDoc(collection(db, 'work'), {
        user_id: currentUser.uid,
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        file_path: fileUrl,
        uploaded_at: serverTimestamp()
      });

      setForm({ title: '', category: '', description: '', file: null });
      const q = query(collection(db, 'work'), where('user_id', '==', currentUser.uid), orderBy('uploaded_at', 'desc'));
      const snap = await getDocs(q);
      setWorks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setError(e.message || 'เกิดข้อผิดพลาดในการเพิ่มผลงาน');
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Work Management</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-6">
        <input className="border p-2 mb-2 w-full" placeholder="ชื่อผลงาน" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <input className="border p-2 mb-2 w-full" placeholder="หมวดหมู่" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
        <textarea className="border p-2 mb-2 w-full" placeholder="คำอธิบาย" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input type="file" accept="image/*,video/*" onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })} className="mb-2" />
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded" disabled={loading}>
          {loading ? 'กำลังบันทึก...' : 'เพิ่มผลงาน'}
        </button>
      </form>

      {loading ? <div>Loading...</div> : (
        <ul>
          {works.map(work => (
            <li key={work.id} className="mb-4 border-b pb-2">
              <span className="font-semibold">{work.title}</span> - {work.category}
              <div>{work.description}</div>
              {work.file_path && (/\.(mp4|webm|ogg)$/i.test(work.file_path)
                ? <video src={work.file_path} controls className="mt-2 mb-2 max-w-xs rounded" />
                : <img src={work.file_path} alt={work.title} className="mt-2 mb-2 max-w-xs rounded" />)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
