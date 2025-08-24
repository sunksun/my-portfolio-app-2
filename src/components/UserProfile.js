// src/components/UserProfile.js
import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

const CLOUD = process.env.REACT_APP_CLOUDINARY_CLOUD || (import.meta?.env?.VITE_CLOUDINARY_CLOUD ?? "");
const PRESET = process.env.REACT_APP_CLOUDINARY_PRESET || (import.meta?.env?.VITE_CLOUDINARY_PRESET ?? "");

async function uploadToCloudinary(file) {
  if (!file) throw new Error("No file");
  console.log("CLOUD", CLOUD, "PRESET", PRESET, "file", file);
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/eportfolio_signed/auto/upload`, { method: "POST", body: form });
  const text = await res.clone().text();
  console.log("Cloudinary response", text);
  if (!res.ok) throw new Error("อัปโหลดรูปไม่สำเร็จ");
  const data = JSON.parse(text);
  return data.secure_url;
}

export default function UserProfile() {
  const { user, loading } = useAuth();
  const db = getFirestore();

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
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

  if (loading || fetching) return <div className="p-4">กำลังโหลด...</div>;
  if (!user) return <div className="p-4">ยังไม่ได้เข้าสู่ระบบ</div>;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onPickPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let url = "";
      if (CLOUD && PRESET) {
        url = await uploadToCloudinary(file);
      } else {
        // fallback preview (ถ้าไม่ได้ตั้งค่า Cloudinary)
        url = URL.createObjectURL(file);
      }
      setForm((f) => ({ ...f, photoURL: url }));
    } catch (err) {
      alert(err.message || "อัปโหลดรูปไม่สำเร็จ");
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
      alert("บันทึกโปรไฟล์แล้ว");
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
      alert("บันทึกโปรไฟล์แล้ว");
    } finally {
      setSaving(false);
    }
  };

  return (
  <div className="stack">
    <div>
      <h2>โปรไฟล์</h2>
      <p className="text-sm text-slate-500">อัปเดตข้อมูลส่วนตัวและรูปโปรไฟล์</p>
    </div>

    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      {/* รูปโปรไฟล์ */}
      <div className="card">
        <div className="aspect-square w-full overflow-hidden rounded-lg border bg-slate-50">
          {form.photoURL ? (
            <img src={form.photoURL} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-slate-400">ไม่มีรูป</div>
          )}
        </div>
        <label className="btn-primary w-full mt-3 cursor-pointer">
          เลือกรูป
          <input type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />
        </label>
      </div>

      {/* ฟอร์ม */}
      <div className="card">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label>ชื่อ–นามสกุล</label>
            <input name="displayName" value={form.displayName} onChange={onChange} />
          </div>

          <div>
            <label>อีเมล (อ่านอย่างเดียว)</label>
            <input value={form.email} disabled className="bg-gray-50" />
          </div>
          <div>
            <label>โรงเรียน/สถาบัน</label>
            <input name="school" value={form.school} onChange={onChange} />
          </div>

          <div>
            <label>คณะที่ต้องการ</label>
            <input name="facultyTarget" value={form.facultyTarget} onChange={onChange} />
          </div>
          <div>
            <label>ปีการศึกษา</label>
            <input name="year" value={form.year} onChange={onChange} />
          </div>

          <div>
            <label>เบอร์โทร</label>
            <input name="phone" value={form.phone} onChange={onChange} />
          </div>
          <div>
            <label>ทักษะ (คั่นด้วย ,)</label>
            <input name="skills" value={form.skills} onChange={onChange} placeholder="React, Tailwind, PS" />
          </div>

          <div className="md:col-span-2">
            <label>คำอธิบายสั้น ๆ</label>
            <textarea name="bio" rows={3} value={form.bio} onChange={onChange} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <label>การเผยแพร่</label>
          <select name="visibility" value={form.visibility} onChange={onChange}>
            <option value="private">ส่วนตัว</option>
            <option value="public">สาธารณะ</option>
            <option value="link-only">เฉพาะลิงก์</option>
          </select>
          <div className="ml-auto text-sm text-slate-500">สิทธิ์: {form.role}</div>
        </div>

        <button onClick={onSave} disabled={saving} className="btn-primary mt-5">
          {saving ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
        </button>
      </div>
    </div>
  </div>
  );
}
