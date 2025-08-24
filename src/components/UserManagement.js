import React, { useState } from 'react';

const initialUsers = [
  { id: 1, name: 'สมชาย ใจดี', email: 'somchai@example.com' },
  { id: 2, name: 'สมหญิง น่ารัก', email: 'somying@example.com' },
];

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleAddUser = () => {
    if (!name || !email) return;
    setUsers([...users, { id: Date.now(), name, email }]);
    setName('');
    setEmail('');
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleEditUser = (user) => {
    setName(user.name);
    setEmail(user.email);
    setEditingId(user.id);
  };

  const handleUpdateUser = () => {
    setUsers(users.map((user) =>
      user.id === editingId ? { ...user, name, email } : user
    ));
    setName('');
    setEmail('');
    setEditingId(null);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">เพิ่ม / ลบ / แก้ไขผู้ใช้งาน</h2>

      {/* ปุ่มย้อนกลับ */}
      <div className="mb-4 flex justify-start">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm shadow"
        >ย้อนกลับ</button>
      </div>
      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="ชื่อผู้ใช้งาน"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 w-full rounded"
        />
        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 w-full rounded"
        />
        {editingId ? (
          <button
            onClick={handleUpdateUser}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            บันทึกการแก้ไข
          </button>
        ) : (
          <button
            onClick={handleAddUser}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            เพิ่มผู้ใช้งาน
          </button>
        )}
      </div>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ชื่อ</th>
            <th className="border px-4 py-2">อีเมล</th>
            <th className="border px-4 py-2">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="text-yellow-500 hover:underline"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-500 hover:underline"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
