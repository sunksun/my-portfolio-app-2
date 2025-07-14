import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    setError('');
    try {
      await logout();
      navigate('/login');
    } catch {
      setError('ไม่สามารถออกจากระบบได้');
    }
  }

  return (
    <div className="dashboard-container p-6">
      <div className="dashboard-content max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">แดชบอร์ดผู้ใช้</h2>

        {error && <div className="alert alert-error text-red-500 mb-4">{error}</div>}

        <div className="user-info mb-6">
          <strong>อีเมล:</strong> {currentUser && currentUser.email}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* เมนูสำหรับผู้ใช้ทั่วไป */}
          <div className="p-4 border rounded shadow-sm">
            <h3 className="font-semibold text-lg mb-2">จัดการข้อมูลส่วนตัว</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>
                <Link to="/dashboard/profile" className="text-blue-600 hover:underline">
                  ดู/แก้ไขโปรไฟล์
                </Link>
              </li>
              <li>
                <Link to="/dashboard/education" className="text-blue-600 hover:underline">
                  จัดการประวัติการศึกษา
                </Link>
              </li>
              <li>
                <Link to="/dashboard/works" className="text-blue-600 hover:underline">
                  จัดการผลงาน
                </Link>
              </li>
              <li>
                <Link to="/dashboard/portfolio" className="text-blue-600 hover:underline">
                  สร้าง/ดู Portfolio
                </Link>
              </li>
            </ul>
          </div>

          {/* เมนูอื่น ๆ เพิ่มเติมได้ตามต้องการ */}
          <div className="p-4 border rounded shadow-sm">
            <h3 className="font-semibold text-lg mb-2">เมนูอื่น ๆ</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>ดูประกาศ/ข่าวสาร</li>
              <li>ตั้งค่าบัญชี</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
