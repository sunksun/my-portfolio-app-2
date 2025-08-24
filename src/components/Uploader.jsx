import React, { useState } from "react";

/**
 * ใช้แบบ:
 * <Uploader userId={currentUser.uid} onDone={(data) => { ...save to Firestore... }} />
 * server ต้องมี /api/upload (พอร์ต 3001 หรือ proxy แล้ว)
 */
export default function Uploader({ userId, onDone }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ตรวจชนิด/ขนาดเบื้องต้น (แก้ค่าตามที่ตั้งใน Cloudinary Allowed formats/size)
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setError("ไฟล์ไม่รองรับ (ต้องเป็น JPG/PNG/WebP หรือ PDF)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("ไฟล์ใหญ่เกิน 10MB");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      // ถ้า dev มี proxy: fetch('/api/...') ได้เลย
      // ถ้าไม่มี proxy: ตั้ง VITE_API_BASE_URL=http://localhost:3001 แล้วใช้บรรทัดด้านล่าง
      const base = import.meta.env.VITE_API_BASE_URL ?? "";
      const res = await fetch(`${base}/api/upload?userId=${encodeURIComponent(userId)}`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error(`อัปโหลดล้มเหลว (HTTP ${res.status})`);
      const data = await res.json(); // { url, public_id, ... }
      onDone?.(data);
    } catch (err) {
      setError(err.message || "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      e.target.value = ""; // reset input
    }
  };

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*,.pdf" onChange={handleChange} disabled={uploading} />
      {uploading && <div>กำลังอัปโหลด…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
