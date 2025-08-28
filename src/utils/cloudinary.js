// src/utils/cloudinary.js
const CLOUD = process.env.REACT_APP_CLOUDINARY_CLOUD || (import.meta?.env?.VITE_CLOUDINARY_CLOUD ?? "");
const PRESET = process.env.REACT_APP_CLOUDINARY_PRESET || (import.meta?.env?.VITE_CLOUDINARY_PRESET ?? "");

export async function uploadToCloudinary(file) {
  if (!file) throw new Error("No file");
  console.log("CLOUD", CLOUD, "PRESET", PRESET, "file", file);
  
  // ลองใช้ preset ต่างๆ
  const presets = [PRESET, "eportfolio_signed", "ml_default"];
  
  for (const preset of presets) {
    if (!preset) continue;
    
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", preset);
      
      console.log(`Trying preset: ${preset}`);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, { 
        method: "POST", 
        body: form 
      });
      
      const text = await res.clone().text();
      console.log(`Cloudinary response for ${preset}:`, text);
      
      if (res.ok) {
        const data = JSON.parse(text);
        return data.secure_url;
      }
    } catch (err) {
      console.log(`Failed with preset ${preset}:`, err.message);
    }
  }
  
  throw new Error("ไม่สามารถอัปโหลดรูปได้ กรุณาตรวจสอบการตั้งค่า Cloudinary");
}

export function createPreviewUrl(file) {
  return URL.createObjectURL(file);
}