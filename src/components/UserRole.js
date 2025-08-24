import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function UserRole() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState('');
  const db = getFirestore();
  const auth = getAuth();
  const currentUid = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchUsers();
  }, [db]);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUid) {
      setMessage('ไม่สามารถเปลี่ยนบทบาทของตัวเองได้');
      return;
    }
    setUpdatingId(userId);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      setUsers(users => users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMessage('อัปเดตบทบาทสำเร็จ');
    } catch (e) {
      setMessage('เกิดข้อผิดพลาดในการอัปเดตบทบาท');
    }
    setUpdatingId(null);
  };

  return (
    <div className="p-6">
      {/* ปุ่มย้อนกลับ */}
      <div className="mb-4 flex justify-start">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm shadow"
        >ย้อนกลับ</button>
      </div>
      <h2 className="text-xl font-bold mb-4">กำหนดสิทธิ์การเข้าถึงระบบ</h2>
      {message && <div className="mb-4 text-center text-sm text-blue-700">{message}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">ชื่อ</th>
              <th className="py-2 px-4 border">อีเมล</th>
              <th className="py-2 px-4 border">บทบาท</th>
              <th className="py-2 px-4 border">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="text-center">
                <td className="py-2 px-4 border">{user.fullName || '-'}</td>
                <td className="py-2 px-4 border">{user.email || '-'}</td>
                <td className="py-2 px-4 border">{user.role === 'admin' ? 'Admin' : 'User'}</td>
                <td className="py-2 px-4 border">
                  <select
                    value={user.role || 'user'}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    disabled={updatingId === user.id || user.id === currentUid}
                    className="border rounded px-2 py-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
