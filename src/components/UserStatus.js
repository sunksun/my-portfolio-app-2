import React from 'react';

export default function UserStatus() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">จัดการสถานะผู้ใช้งาน</h2>
      <p>ตัวอย่าง: แสดงตารางผู้ใช้ พร้อมปุ่มเปิด/ปิดสถานะ (active/inactive) ในแต่ละแถว</p>
      {/* TODO: ดึงข้อมูลผู้ใช้จากฐานข้อมูลและแสดงตาราง */}
    </div>
  );
}
