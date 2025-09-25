// Script สำหรับเพิ่มข้อมูล Templates ตัวอย่างลง Firestore
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const db = getFirestore();

// ข้อมูล templates ตัวอย่าง (3 templates หลัก)
const sampleTemplates = [
  {
    id: 'classic',
    name: 'Classic CV',
    type: 'classic',
    desc: 'เรียบง่าย เหมาะสำหรับทุกสาขา',
    color: '#2563eb',
    sections: {
      profile: true,
      education: true,
      works: true,
      awards: true,
      skills: true
    },
    layout_settings: {
      columns: 2,
      header_style: 'centered',
      card_style: 'minimal'
    },
    category: 'ทั่วไป',
    layout: 'A4 Classic',
    accent: '#2563eb',
    preview: 'C',
    is_active: true,
    isPublished: true
  },
  {
    id: 'modern',
    name: 'Modern Gradient',
    type: 'modern',
    desc: 'ทันสมัย มีสีสัน เหมาะสำหรับครีเอทีฟ',
    color: '#16a34a',
    sections: {
      profile: true,
      education: true,
      works: true,
      awards: true,
      skills: true
    },
    layout_settings: {
      columns: 1,
      header_style: 'gradient',
      card_style: 'modern'
    },
    category: 'ทั่วไป',
    layout: 'A4 Modern',
    accent: '#16a34a',
    preview: 'M',
    is_active: true,
    isPublished: true
  },
  {
    id: 'timeline',
    name: 'Timeline',
    type: 'timeline',
    desc: 'แสดงเป็นไทม์ไลน์ เหมาะสำหรับแสดงประสบการณ์',
    color: '#059669',
    sections: {
      profile: true,
      education: true,
      works: true,
      awards: true,
      skills: true
    },
    layout_settings: {
      columns: 1,
      header_style: 'timeline',
      card_style: 'timeline'
    },
    category: 'กิจกรรม/ผลงาน',
    layout: 'A4 Timeline',
    accent: '#f59e0b',
    preview: 'T',
    is_active: true,
    isPublished: true
  }
];

// ฟังก์ชันสำหรับเพิ่มข้อมูลลง Firestore
export const seedTemplates = async () => {
  try {
    console.log('เริ่มเพิ่มข้อมูล Templates ลง Firestore...');
    
    for (const template of sampleTemplates) {
      const templateData = {
        ...template,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system',
        updatedBy: 'system'
      };
      
      await setDoc(doc(collection(db, 'TEMPLATES'), template.id), templateData);
      console.log(`✅ เพิ่ม template "${template.name}" สำเร็จ`);
    }
    
    console.log('🎉 เพิ่มข้อมูล Templates ทั้งหมดสำเร็จ!');
    return true;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการเพิ่มข้อมูล:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับเรียกใช้งาน
export const initializeTemplates = async () => {
  // ตรวจสอบว่ามี templates ใน Firestore แล้วหรือยัง
  const { collection: firestoreCollection, getDocs } = await import('firebase/firestore');
  
  try {
    const templatesSnapshot = await getDocs(firestoreCollection(db, 'TEMPLATES'));
    
    if (templatesSnapshot.empty) {
      console.log('ไม่พบ Templates ใน Firestore, กำลังเพิ่มข้อมูลตัวอย่าง...');
      return await seedTemplates();
    } else {
      console.log(`พบ Templates อยู่แล้ว ${templatesSnapshot.size} รายการ`);
      return true;
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการตรวจสอบ Templates:', error);
    return false;
  }
};