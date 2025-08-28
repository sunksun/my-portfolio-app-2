// src/components/UserProfile.js
import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { User, Upload, Camera, Save, Eye, EyeOff, Phone, School, Target, Calendar, Sparkles, CheckCircle } from "lucide-react";

import { uploadToCloudinary, createPreviewUrl } from "../utils/cloudinary";

export default function UserProfile() {
  const { user, loading } = useAuth();
  const db = getFirestore();

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    school: "",
    facultyTarget: "",
    year: "ปีการศึกษา 2568",
    phone: "",
    bio: "",
    skills: "", // กรอกคอมม่า: JS, React, PS
    photoURL: "",
    role: "user",
    visibility: "private",
  });

  // โหลดหรือสร้างเอกสารโปรไฟล์
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    (async () => {
      setFetching(true);
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setForm((f) => ({
          ...f,
          displayName: data.displayName ?? user.displayName ?? "",
          email: data.email ?? user.email ?? "",
          school: data.school ?? "",
          facultyTarget: data.facultyTarget ?? "",
          year: data.year ?? "ปีการศึกษา 2568",
          phone: data.phone ?? "",
          bio: data.bio ?? "",
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : (data.skills ?? ""),
          photoURL: data.photoURL ?? user.photoURL ?? "",
          role: data.role ?? "user",
          visibility: data.visibility ?? "private",
        }));
      } else {
        const seed = {
          displayName: user.displayName ?? "",
          email: user.email ?? "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          role: "user",
          visibility: "private",
        };
        await setDoc(ref, seed, { merge: true });
        setForm((f) => ({ ...f, ...seed }));
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
      const ref = doc(db, "users", user.uid);
      const payload = {
        ...form,
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        updatedAt: serverTimestamp(),
      };
      await updateDoc(ref, payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      // ถ้าเอกสารยังไม่มี (กรณีพิเศษ) ใช้ setDoc
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, {
        ...form,
        skills: form.skills
          ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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
                  <h3 className="text-lg font-semibold text-gray-900">{form.displayName || 'ชื่อของคุณ'}</h3>
                  <p className="text-gray-500">{form.email}</p>
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {form.role === 'admin' ? 'ผู้ดูแลระบบ' : 'นักเรียน'}
                  </div>
                </div>
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
                    name="displayName" 
                    value={form.displayName} 
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="กรอกชื่อ-นามสกุลของคุณ"
                  />
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

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบายตัวเอง</label>
                  <textarea 
                    name="bio" 
                    rows={4} 
                    value={form.bio} 
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="เขียนเกี่ยวกับตัวคุณสั้น ๆ..."
                  />
                </div>
              </div>
            </div>

            {/* Education Information */}
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/50 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <School className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">ข้อมูลการศึกษา</h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">โรงเรียน/สถาบัน</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      name="school" 
                      value={form.school} 
                      onChange={onChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="ชื่อโรงเรียน/มหาวิทยาลัย"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ปีการศึกษา</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      name="year" 
                      value={form.year} 
                      onChange={onChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="ปีการศึกษา 2568"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">คณะ/สาขาที่ต้องการ</label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      name="facultyTarget" 
                      value={form.facultyTarget} 
                      onChange={onChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="คณะหรือสาขาที่สนใจ"
                    />
                  </div>
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
