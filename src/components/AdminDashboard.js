import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="dashboard-container p-6">
      <div className="dashboard-content max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">แดชบอร์ดผู้ดูแลระบบ</h2>
        <div className="user-info mb-6">
          <strong>ยินดีต้อนรับแอดมิน!</strong> คุณสามารถจัดการผู้ใช้และดูรายงานต่าง ๆ ได้ที่นี่
        </div>
        {/* เมนูหลักสำหรับผู้ดูแลระบบ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 border rounded shadow-sm flex flex-col items-center">
            <Link to="/dashboard/user-management" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-2 w-full text-center">
              ดูผู้ใช้งานทั้งหมด
            </Link>
          </div>
          <div className="p-4 border rounded shadow-sm flex flex-col items-center">
            <Link to="/admin/report" className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded mb-2 w-full text-center">
              ดูรายงานระบบ
            </Link>
          </div>
          <div className="p-4 border rounded shadow-sm flex flex-col items-center">
            <Link to="/admin/template-management" className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded mb-2 w-full text-center">
              จัดการเทมเพลต Portfolio
            </Link>
          </div>
        </div>
        {/* เมนูรายละเอียดอื่น ๆ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* เมนูจัดการผู้ใช้งาน */}
          <div className="p-4 border rounded shadow-sm">
            <h3 className="font-semibold text-lg mb-2">การจัดการผู้ใช้งาน</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>
                <Link to="/dashboard/user-management" className="text-blue-600 hover:underline">
                  เพิ่ม / ลบ / แก้ไขข้อมูลผู้ใช้งาน
                </Link>
              </li>
              <li>
                <Link to="/dashboard/user-status" className="text-blue-600 hover:underline">
                  จัดการสถานะผู้ใช้งาน
                </Link>
              </li>
              <li>
                <Link to="/dashboard/user-role" className="text-blue-600 hover:underline">
                  กำหนดสิทธิ์การเข้าถึงระบบ
                </Link>
              </li>
              <li>
                <Link to="/admin/audit-log" className="text-blue-600 hover:underline">
                  ประวัติการใช้งาน (Audit Log)
                </Link>
              </li>
              <li>
                <Link to="/admin/notification" className="text-blue-600 hover:underline">
                  การแจ้งเตือนระบบ
                </Link>
              </li>
              <li>
                <Link to="/admin/email-management" className="text-blue-600 hover:underline">
                  การจัดการอีเมล (Email Management)
                </Link>
              </li>
              <li>
                <Link to="/admin/export-import" className="text-blue-600 hover:underline">
                  นำเข้า/ส่งออกข้อมูล (Export/Import)
                </Link>
              </li>
            </ul>
          </div>
          {/* เมนูรายงานและจัดการ Portfolio */}
          <div className="p-4 border rounded shadow-sm">
            <h3 className="font-semibold text-lg mb-2">การจัดการเทมเพลต Portfolio</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>
                <Link to="/admin/template-edit" className="text-blue-600 hover:underline">
                  สร้างและแก้ไขเทมเพลตมาตรฐาน
                </Link>
              </li>
              <li>
                <Link to="/admin/template-style" className="text-blue-600 hover:underline">
                  กำหนดรูปแบบการแสดงผล
                </Link>
              </li>
              <li>
                <Link to="/admin/category-management" className="text-blue-600 hover:underline">
                  จัดการหมวดหมู่ผลงาน
                </Link>
              </li>
              <li>
                <Link to="/admin/media-management" className="text-blue-600 hover:underline">
                  จัดการไฟล์/สื่อ (Media Management)
                </Link>
              </li>
              <li>
                <Link to="/admin/backup" className="text-blue-600 hover:underline">
                  สำรองและกู้คืนข้อมูล (Backup & Restore)
                </Link>
              </li>
              <li>
                <Link to="/admin/settings" className="text-blue-600 hover:underline">
                  ตั้งค่าระบบ (General Settings)
                </Link>
              </li>
              <li>
                <Link to="/admin/banner-management" className="text-blue-600 hover:underline">
                  จัดการ Banner/ข่าวประชาสัมพันธ์
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6">
          <Link to="/login" className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
            ออกจากระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
