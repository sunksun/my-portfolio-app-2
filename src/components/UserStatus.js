import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function UserStatus() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchUsers();
    // ตรวจสอบ custom claims ของ user ที่ login อยู่
    const auth = getAuth();
    if (auth.currentUser) {
      auth.currentUser.getIdTokenResult().then(tokenResult => {
        console.log('Custom claims:', tokenResult.claims);
      });
    } else {
      console.log('No user is currently logged in.');
    }
  }, [db]);

  const toggleStatus = async (userId, currentStatus) => {
    setUpdatingId(userId);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status: currentStatus === 'active' ? 'inactive' : 'active' });
      setUsers(users => users.map(u => u.id === userId ? { ...u, status: currentStatus === 'active' ? 'inactive' : 'active' } : u));
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
    setUpdatingId(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* ปุ่มย้อนกลับ */}
      <div className="mb-4 flex justify-start">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm shadow"
        >ย้อนกลับ</button>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-blue-700">จัดการสถานะผู้ใช้งาน</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">ชื่อ</th>
              <th className="py-2 px-4 border">อีเมล</th>
              <th className="py-2 px-4 border">สถานะ</th>
              <th className="py-2 px-4 border">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="text-center">
                <td className="py-2 px-4 border">{user.fullName || '-'}</td>
                <td className="py-2 px-4 border">{user.email || '-'}</td>
                <td className="py-2 px-4 border">
                  <span className={user.status === 'active' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-2 px-4 border">
                  <button
                    className={user.status === 'active' ? 'bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded' : 'bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded'}
                    onClick={() => toggleStatus(user.id, user.status)}
                    disabled={updatingId === user.id}
                  >
                    {updatingId === user.id ? 'กำลังอัปเดต...' : user.status === 'active' ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
