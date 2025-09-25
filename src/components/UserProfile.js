// src/components/UserProfile.js
import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import { User, Upload, Camera, Save, Eye, EyeOff, Phone, Sparkles, CheckCircle, Calendar, Lock } from "lucide-react";

import { uploadToCloudinary, createPreviewUrl } from "../utils/cloudinary";

export default function UserProfile() {
  const { user, loading } = useAuth();
  const db = getFirestore();

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    name: "", // เพิ่ม field name จาก collection users
    username: "", // เพิ่ม field username
    program: "", // เพิ่ม field program
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    skills: "", // กรอกคอมม่า: JS, React, PS
    photoURL: "",
    role: "user",
    visibility: "private",
  });
  
  const [userDocId, setUserDocId] = useState(null); // เก็บ document ID ของผู้ใช้
  
  // State สำหรับเปลี่ยนรหัสผ่าน
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // โหลดหรือสร้างเอกสารโปรไฟล์
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    (async () => {
      setFetching(true);
      try {
        // ค้นหาข้อมูลผู้ใช้จาก collection "users" โดยใช้ uid
        const usersQuery = query(
          collection(db, "users"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(usersQuery);
        
        if (!querySnapshot.empty) {
          // ถ้าเจอข้อมูลใน collection users
          const userDoc = querySnapshot.docs[0];
          const data = userDoc.data();
          setUserDocId(userDoc.id); // เก็บ document ID
          
          console.log("ข้อมูลผู้ใช้จาก collection users:", data);
          
          setForm((f) => ({
            ...f,
            displayName: data.name || data.displayName || user.displayName || "",
            name: data.name || "",
            username: data.username || "",
            program: data.program || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            dateOfBirth: data.dateOfBirth || data.dob || "",
            address: data.address || data.bio || "",
            skills: Array.isArray(data.skills) ? data.skills.join(", ") : (data.skills || ""),
            photoURL: data.photoURL || user.photoURL || "",
            role: data.access_level || data.role || "user",
            visibility: data.visibility || "private",
          }));
        } else {
          // ถ้าไม่เจอ ให้ลองหาใน collection users เดิม (fallback)
          console.log("ไม่พบข้อมูลใน collection users, ลองหา users collection เดิม");
          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);
          
          if (snap.exists()) {
            const data = snap.data();
            setUserDocId(user.uid); // ใช้ uid เป็น document ID
            setForm((f) => ({
              ...f,
              displayName: data.displayName || user.displayName || "",
              name: data.name || "",
              username: data.username || "",
              program: data.program || "",
              email: data.email || user.email || "",
              phone: data.phone || "",
              dateOfBirth: data.dateOfBirth || data.dob || "",
              address: data.address || data.bio || "",
              skills: Array.isArray(data.skills) ? data.skills.join(", ") : (data.skills || ""),
              photoURL: data.photoURL || user.photoURL || "",
              role: data.role || "user",
              visibility: data.visibility || "private",
            }));
          } else {
            // สร้างเอกสารใหม่
            console.log("สร้างเอกสารผู้ใช้ใหม่");
            const ref = doc(db, "users", user.uid);
            const seed = {
              displayName: user.displayName || "",
              email: user.email || "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              role: "user",
              visibility: "private",
            };
            await setDoc(ref, seed, { merge: true });
            setForm((f) => ({ ...f, ...seed }));
            setUserDocId(user.uid);
          }
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
      setFetching(false);
    })();
  }, [user, loading, db]);

  if (loading || fetching) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">กรุณาเข้าสู่ระบบก่อนใช้งาน</p>
      </div>
    </div>
  );

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ฟังก์ชันจัดการ form เปลี่ยนรหัสผ่าน
  const onPasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    // Clear error when user types
    if (passwordError) setPasswordError('');
  };

  // ฟังก์ชันเปลี่ยนรหัสผ่าน
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    
    setChangingPassword(true);
    setPasswordError('');
    
    try {
      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwordForm.newPassword);
      
      // Clear form and show success
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        setPasswordError('รหัสผ่านปัจจุบันไม่ถูกต้อง');
      } else if (error.code === 'auth/weak-password') {
        setPasswordError('รหัสผ่านใหม่ไม่แข็งแรงพอ');
      } else {
        setPasswordError('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณาลองใหม่');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const onPickPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // ลอง Cloudinary ก่อน
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, photoURL: url }));
    } catch (err) {
      console.warn("Cloudinary upload failed, using preview:", err.message);
      // ใช้ fallback preview
      const previewUrl = createPreviewUrl(file);
      setForm((f) => ({ ...f, photoURL: previewUrl }));
      
      alert("⚠️ อัปโหลดไม่สำเร็จ\nใช้โหมดตัวอย่าง (รูปไม่ได้บันทึกจริง)\n\nกรุณาแก้ไข Cloudinary preset ในการตั้งค่า");
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      if (!userDocId) {
        console.error("ไม่พบ document ID ของผู้ใช้");
        return;
      }

      const ref = doc(db, "users", userDocId);
      const payload = {
        ...form,
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        updatedAt: serverTimestamp(),
      };
      
      console.log("บันทึกข้อมูลผู้ใช้:", payload);
      await updateDoc(ref, payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      // ถ้าเอกสารยังไม่มี (กรณีพิเศษ) ใช้ setDoc
      try {
        const ref = doc(db, "users", userDocId || user.uid);
        await setDoc(ref, {
          ...form,
          uid: user.uid, // เพิ่ม uid field
          skills: form.skills
            ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (setErr) {
        console.error("Error creating profile:", setErr);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">จัดการโปรไฟล์</h1>
            <p className="mt-2 text-xl text-blue-100">อัปเดตข้อมูลส่วนตัวและรูปโปรไฟล์ของคุณ</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
          
          {/* Profile Picture Section */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/50 p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white shadow-xl">
                    {form.photoURL ? (
                      <img src={form.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-20 w-20 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload overlay */}
                  <label className="absolute inset-0 w-48 h-48 mx-auto rounded-2xl bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center group">
                    <div className="text-white text-center">
                      <Camera className="h-8 w-8 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">เปลี่ยนรูป</span>
                    </div>
                    <input type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />
                  </label>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">{form.name || form.displayName || 'ชื่อของคุณ'}</h3>
                  <p className="text-gray-500">{form.email}</p>
                  {form.program && (
                    <p className="text-sm text-gray-500 mt-1">แผนการเรียน: {form.program}</p>
                  )}
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {form.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักเรียน'}
                  </div>
                </div>
              </div>
              
              {/* Change Password Section */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4 text-yellow-600" />
                  <label className="text-sm font-medium text-gray-700">เปลี่ยนรหัสผ่าน</label>
                </div>
                
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="รหัสผ่านปัจจุบัน"
                      value={passwordForm.currentPassword}
                      onChange={onPasswordChange}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                      value={passwordForm.newPassword}
                      onChange={onPasswordChange}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="ยืนยันรหัสผ่านใหม่"
                      value={passwordForm.confirmPassword}
                      onChange={onPasswordChange}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    />
                  </div>
                  
                  {passwordError && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{passwordError}</p>
                    </div>
                  )}
                  
                  {passwordSuccess && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        เปลี่ยนรหัสผ่านสำเร็จ
                      </p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                  >
                    {changingPassword ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        กำลังเปลี่ยนรหัสผ่าน...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        เปลี่ยนรหัสผ่าน
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Visibility Settings */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  {form.visibility === 'public' ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                  <label className="text-sm font-medium text-gray-700">การเผยแพร่โปรไฟล์</label>
                </div>
                <select 
                  name="visibility" 
                  value={form.visibility} 
                  onChange={onChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="private">🔒 ส่วนตัว</option>
                  <option value="public">🌍 สาธารณะ</option>
                  <option value="link-only">🔗 เฉพาะลิงก์</option>
                </select>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/50 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-blue-50 p-2">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">ข้อมูลส่วนตัว</h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="กรอกชื่อ-นามสกุลของคุณ"
                  />
                  <p className="mt-1 text-xs text-gray-500">ข้อมูลจาก collection users</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้ใช้</label>
                  <input 
                    name="username" 
                    value={form.username} 
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="ชื่อผู้ใช้"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">แผนการเรียน</label>
                  <select 
                    name="program" 
                    value={form.program} 
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">เลือกแผนการเรียน</option>
                    <option value="วิทย์-คณิต">วิทย์-คณิต</option>
                    <option value="ศิลป์-ภาษา">ศิลป์-ภาษา</option>
                    <option value="ศิลป์-คำนวณ">ศิลป์-คำนวณ</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                  <div className="relative">
                    <input 
                      value={form.email} 
                      disabled 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      name="phone" 
                      value={form.phone} 
                      onChange={onChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="0xx-xxx-xxxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">วันเดือนปีเกิด</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      name="dateOfBirth" 
                      type="date"
                      value={form.dateOfBirth} 
                      onChange={onChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่ปัจจุบัน</label>
                  <textarea 
                    name="address" 
                    rows={4} 
                    value={form.address} 
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="กรอกที่อยู่ปัจจุบันของคุณ..."
                  />
                </div>
              </div>
            </div>


            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/50 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-purple-50 p-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">ทักษะและความสามารถ</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ทักษะ (คั่นด้วยเครื่องหมายจุลภาค)</label>
                <input 
                  name="skills" 
                  value={form.skills} 
                  onChange={onChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="เช่น React, Photoshop, ภาษาอังกฤษ, การออกแบบ"
                />
                <p className="mt-2 text-xs text-gray-500">แยกแต่ละทักษะด้วยเครื่องหมายจุลภาค (,)</p>
                
                {/* Skills Preview */}
                {form.skills && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.skills.split(',').map((skill, index) => {
                      const trimmedSkill = skill.trim();
                      return trimmedSkill ? (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {trimmedSkill}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/50 p-6">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">บันทึกข้อมูลเรียบร้อยแล้ว!</span>
                </div>
              )}
              
              <button 
                onClick={onSave} 
                disabled={saving}
                className="ml-auto inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    บันทึกโปรไฟล์
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
