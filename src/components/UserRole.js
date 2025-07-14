import React from 'react';

export default function UserRole() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">กำหนดสิทธิ์การเข้าถึงระบบ</h2>
      <p>ตัวอย่าง: แสดงตารางผู้ใช้ พร้อม dropdown หรือปุ่มเลือก role (user, admin) ในแต่ละแถว</p>
      {/* TODO: ดึงข้อมูลผู้ใช้จากฐานข้อมูลและแสดงตาราง */}
    </div>
  );
}
