// -----------------------------
// ส่วนของ Education Management (จัดการประวัติการศึกษา)
// - React useState
// - Tailwind CSS
// - CRUD: เพิ่ม/แก้ไข/ลบ
// -----------------------------

// -----------------------------
// Education Management (CRUD + Firestore)
// -----------------------------
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';


export default function EducationManagement() {
  // ===== [1] State สำหรับรายการการศึกษาและฟอร์ม =====
  // ===== [1] State สำหรับรายการการศึกษาและฟอร์ม =====
  const [educations, setEducations] = useState([]);
  const [form, setForm] = useState({
    education_id: '', // PK (auto gen)
    user_id: '',      // FK (currentUser.uid)
    degree: '',       // วุฒิการศึกษา
    gpa: '',          // เกรดเฉลี่ย
    period: ''        // ช่วงเวลา (string หรือ date)
  });
  const [editId, setEditId] = useState(null); // Firestore doc id
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const db = getFirestore();
  const { currentUser } = useAuth();

  // ===== [2] ดึงข้อมูล education จาก Firestore =====
  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      setLoading(true);
      // query เฉพาะ user_id ของ user ปัจจุบัน (ใช้ index)
      const q = query(
        collection(db, 'education'),
        where('user_id', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      setEducations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [currentUser]);

  // ===== [3] handleChange สำหรับ input =====
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // ===== [4] Validation =====
  const validate = () => {
    if (!form.degree.trim()) return 'กรุณากรอกวุฒิการศึกษา';
    if (!form.gpa.trim() || isNaN(form.gpa)) return 'กรุณากรอกเกรดเฉลี่ยเป็นตัวเลข';
    if (!form.period.trim()) return 'กรุณากรอกช่วงเวลา';
    return '';
  };

  // ===== [5] handleAddOrEdit สำหรับเพิ่มหรือบันทึกการแก้ไข (Firestore) =====
  const handleAddOrEdit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (editId) {
        // แก้ไข
        const docRef = doc(db, 'education', editId);
        await updateDoc(docRef, { ...form, user_id: currentUser.uid });
      } else {
        // เพิ่มใหม่ (education_id = timestamp)
        const newEducationId = Date.now();
        await addDoc(collection(db, 'education'), {
          ...form,
          education_id: newEducationId,
          user_id: currentUser.uid,
          createdAt: serverTimestamp(),
        });
      }
      // รีเฟรชข้อมูลใหม่ (query เฉพาะ user_id)
      const q = query(
        collection(db, 'education'),
        where('user_id', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      setEducations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setForm({ education_id: '', user_id: '', degree: '', gpa: '', period: '' });
      setEditId(null);
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
    setLoading(false);
  };

  // ===== [6] handleEdit สำหรับเริ่มแก้ไข =====
  const handleEdit = edu => {
    setForm({
      education_id: edu.education_id || '',
      user_id: edu.user_id || '',
      degree: edu.degree || '',
      gpa: edu.gpa || '',
      period: edu.period || ''
    });
    setEditId(edu.id);
  };

  // ===== [7] handleDelete สำหรับลบรายการ (Firestore) =====
  const handleDelete = async id => {
    if (window.confirm('ยืนยันการลบข้อมูลนี้?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'education', id));
        setEducations(educations.filter(e => e.id !== id));
        if (editId === id) {
          setForm({ school: '', degree: '', year: '' });
          setEditId(null);
        }
      } catch (e) {
        setError('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
      setLoading(false);
    }
  };

  // ===== [8] ส่วนแสดงผล UI =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
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
        {/* หัวข้อ Education Management */}
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">การจัดการข้อมูลการศึกษา</h2>
        {/* ฟอร์มเพิ่ม/แก้ไขการศึกษา */}
        <div className="space-y-4 mb-6">
          {/* [A] วุฒิการศึกษา */}
          <input
            name="degree"
            value={form.degree}
            onChange={handleChange}
            placeholder="วุฒิการศึกษา (เช่น ปริญญาตรี, ม.6)"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={loading}
          />
          {/* [B] เกรดเฉลี่ย */}
          <input
            name="gpa"
            value={form.gpa}
            onChange={handleChange}
            placeholder="เกรดเฉลี่ย (เช่น 3.50)"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            type="number"
            step="0.01"
            disabled={loading}
          />
          {/* [C] ช่วงเวลา */}
          <input
            name="period"
            value={form.period}
            onChange={handleChange}
            placeholder="ช่วงเวลา (เช่น 2562-2565)"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={loading}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            onClick={handleAddOrEdit}
            className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
            disabled={loading}
          >
            {editId ? 'บันทึกการแก้ไข' : 'เพิ่ม'}
          </button>
        </div>
        {/* รายการประวัติการศึกษา */}
        {loading ? (
          <div className="text-center text-green-500">Loading...</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {educations.map((edu) => (
              <li key={edu.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-bold text-green-800">{edu.degree}</div>
                  <div className="text-gray-700 text-sm">เกรดเฉลี่ย: {edu.gpa}</div>
                  <div className="text-gray-500 text-xs">ช่วงเวลา: {edu.period}</div>
                  <div className="text-gray-400 text-xs">education_id: {edu.education_id}</div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => handleEdit(edu)}
                    className="px-4 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition"
                  >แก้ไข</button>
                  <button
                    onClick={() => handleDelete(edu.id)}
                    className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >ลบ</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
