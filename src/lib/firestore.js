// รองรับทั้ง CRA (REACT_APP_*) และ Vite (VITE_*)
const getCloudinaryEnv = () => {
  const cloud =
    process.env.REACT_APP_CLOUDINARY_CLOUD ||
    import.meta?.env?.VITE_CLOUDINARY_CLOUD;
  const preset =
    process.env.REACT_APP_CLOUDINARY_PRESET ||
    import.meta?.env?.VITE_CLOUDINARY_PRESET;
  return { cloud, preset };
};

export async function uploadToCloudinary(file) {
  if (!file) throw new Error("No file selected");
  const { cloud, preset } = getCloudinaryEnv();
  if (!cloud || !preset)
    throw new Error("Cloudinary env ไม่ครบ (CLOUD/PRESET)");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/auto/upload`,
    {
      method: "POST",
      body: form,
    }
  );
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data; // { secure_url, public_id, ... }
}
import { db } from "../firebase"; // ไฟล์ config ของคุณ
import { doc, updateDoc, setDoc, addDoc, collection } from "firebase/firestore";

// ตัวอย่าง: บันทึกรูปโปรไฟล์ลงเอกสาร USER/{userId}
export async function saveAvatar(userId, { url, public_id }) {
  const ref = doc(db, "USER", userId);
  // ใช้ updateDoc ถ้ามีเอกสารอยู่แล้ว, หรือ setDoc ถ้ายังไม่มี
  await setDoc(ref, {
    photoURL: url,
    photoPublicId: public_id,
    updatedAt: Date.now(),
  }, { merge: true });
}

// ตัวอย่าง: เพิ่มผลงานใหม่ในคอลเลกชัน WORK
export async function addWork(userId, { url, public_id, title }) {
  await addDoc(collection(db, "WORK"), {
    userId,
    title: title || "Untitled",
    fileURL: url,
    filePublicId: public_id,
    createdAt: Date.now(),
  });
}
