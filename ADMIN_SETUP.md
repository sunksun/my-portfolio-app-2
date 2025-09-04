# การตั้งค่า Admin ในระบบ

## วิธีการกำหนดสิทธิ์ Admin

### วิธีที่ 1: ใช้ RegisterAdmin Component
1. เข้าไปที่หน้า RegisterAdmin (/register-admin)
2. อีเมลที่อนุญาต: `phattharaphong1211@gmail.com`
3. รหัสผ่านพิเศษ: `moonlight_07`

### วิธีที่ 2: เพิ่มใน Firestore Database ด้วยตนเอง
1. เปิด Firebase Console
2. ไปที่ Firestore Database
3. สร้าง collection ชื่อ `ADMIN`
4. เพิ่ม document ใหม่โดยใช้ User UID เป็น Document ID
5. เพิ่มข้อมูลดังนี้:
   ```json
   {
     "admin_id": "USER_UID_HERE",
     "username": "admin@example.com",
     "created_at": "Timestamp",
     "updated_at": "Timestamp"
   }
   ```

### วิธีที่ 3: ใช้ Firebase Custom Claims (แนะนำ)
ใช้ Firebase Admin SDK สร้าง custom claims:
```javascript
admin.auth().setCustomUserClaims(uid, { admin: true })
```

## การทำงานของระบบ Admin Login

1. **Login Process**: เมื่อผู้ใช้ login สำเร็จ ระบบจะตรวจสอบสิทธิ์ admin
2. **Permission Check**: ตรวจสอบ 2 วิธี
   - Custom Claims จาก Firebase Auth Token
   - Firestore document ใน collection "ADMIN"
3. **Redirect**: 
   - Admin → `/admin-dashboard`
   - User ทั่วไป → `/dashboard`

## อีเมลที่มีสิทธิ์ Admin
- `phattharaphong1211@gmail.com`

หากต้องการเพิ่มอีเมล admin อื่นๆ ให้แก้ไขไฟล์ `RegisterAdmin.js` ในตัวแปร `allowedAdmins`