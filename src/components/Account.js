// src/components/Account.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Account() {
  const user = auth.currentUser;
  const [form, setForm] = useState({
    username: '',
    email: '',
    currentPassword: '',
    password: '',
    photoURL: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);
  // โหลดข้อมูล user จาก Firestore (ถ้ามี) หรือจาก Auth (fallback)
  useEffect(() => {
    if (!user) return;
    setFetching(true);
    import('firebase/firestore').then(({ doc, getDoc }) => {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setForm(f => ({
            ...f,
            username: data.displayName ?? user.displayName ?? '',
            email: data.email ?? user.email ?? '',
            photoURL: data.photoURL ?? user.photoURL ?? '',
          }));
        } else {
          setForm(f => ({
            ...f,
            username: user.displayName ?? '',
            email: user.email ?? '',
            photoURL: user.photoURL ?? '',
          }));
        }
        setFetching(false);
      });
    });
  }, [user]);

  // Universal env for Cloudinary
  const CLOUD = process.env.REACT_APP_CLOUDINARY_CLOUD || (import.meta?.env?.VITE_CLOUDINARY_CLOUD ?? "");
  const PRESET = process.env.REACT_APP_CLOUDINARY_PRESET || (import.meta?.env?.VITE_CLOUDINARY_PRESET ?? "");

  async function uploadToCloudinary(file) {
    if (!file) throw new Error("No file");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("อัปโหลดรูปไม่สำเร็จ");
    const data = await res.json();
    return data.secure_url;
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      let url = "";
      if (CLOUD && PRESET) {
        url = await uploadToCloudinary(file);
      } else {
        url = URL.createObjectURL(file);
      }
      setForm(f => ({ ...f, photoURL: url }));
    } catch (err) {
      setMsg(err.message || "อัปโหลดรูปไม่สำเร็จ");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true); setMsg("");
    try {
      // re-authenticate ถ้าจะเปลี่ยนอีเมลหรือรหัสผ่าน
      if ((form.email && form.email !== user.email) || form.password) {
        if (!form.currentPassword) throw new Error('กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยัน');
        const cred = EmailAuthProvider.credential(user.email || '', form.currentPassword);
        await reauthenticateWithCredential(user, cred);
      }
      if (form.username && form.username !== user.displayName) {
        await updateProfile(user, { displayName: form.username });
      }
      if (form.email && form.email !== user.email) {
        await updateEmail(user, form.email);
      }
      if (form.password) {
        await updatePassword(user, form.password);
      }
      // อัปเดตรูปโปรไฟล์ใน Firebase Auth
      if (form.photoURL && form.photoURL !== user.photoURL) {
        await updateProfile(user, { photoURL: form.photoURL });
      }
      await setDoc(doc(db, 'users', user.uid), {
        displayName: form.username || user.displayName || '',
        email: form.email || user.email || '',
        photoURL: form.photoURL || user.photoURL || '',
        updatedAt: serverTimestamp()
      }, { merge: true });

      setMsg('บันทึกข้อมูลสำเร็จ!');
      setForm(f => ({ ...f, currentPassword: '', password: '' }));
    } catch (e) {
      setMsg(e.message || 'เกิดข้อผิดพลาดในการบันทึก');
    }
    setLoading(false);
  };

  if (fetching) return <div className="p-4">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-md space-y-3 p-6">
      <h2 className="text-xl font-semibold">ข้อมูลบัญชีผู้ใช้</h2>
      <div className="flex items-center space-x-4">
        {form.photoURL && (
          <img src={form.photoURL} alt="avatar" className="w-16 h-16 rounded-full object-cover border" />
        )}
        <input type="file" accept="image/*" onChange={handlePhoto} disabled={uploading} />
        {uploading && <span className="text-sm">กำลังอัปโหลด…</span>}
      </div>
      <input name="username" value={form.username} onChange={handleChange} placeholder="ชื่อที่แสดง" className="w-full border p-2 rounded" />
      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="อีเมล" className="w-full border p-2 rounded" />

      <div className="space-y-2 border p-3 rounded">
        <label className="block text-sm">เปลี่ยนรหัสผ่าน</label>
        <input name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} placeholder="รหัสผ่านปัจจุบัน (จำเป็นถ้าจะเปลี่ยน)" className="w-full border p-2 rounded" />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="รหัสผ่านใหม่" className="w-full border p-2 rounded" />
      </div>

      <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
        {loading ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
      {msg && <div className="text-sm">{msg}</div>}
    </div>
  );
}
