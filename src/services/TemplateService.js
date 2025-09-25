import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const db = getFirestore();

// ดึง templates ที่เปิดใช้งานอยู่
export const fetchActiveTemplates = async () => {
  try {
    // ใช้ query แบบง่าย ไม่ใช้ orderBy เพื่อหลีกเลี่ยงปัญหา index
    const templatesQuery = query(
      collection(db, 'TEMPLATES'),
      where('is_active', '==', true)
    );
    
    const snapshot = await getDocs(templatesQuery);
    const templates = [];
    
    snapshot.forEach(doc => {
      templates.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('Fetched templates from Firebase:', templates);
    
    // ถ้ามีข้อมูลใน Firebase ให้ใช้ข้อมูลนั้น ไม่ใช้ default
    if (templates.length > 0) {
      return templates;
    }
    
    // ไม่ใช้ default templates - แสดงเฉพาะข้อมูลจาก Firebase
    console.log('No templates found in Firebase');
    return [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    // Return empty array if Firebase fails
    return [];
  }
};

// ดึง template styles ที่เปิดใช้งานอยู่
export const fetchActiveTemplateStyles = async () => {
  try {
    const stylesQuery = query(
      collection(db, 'TEMPLATE_STYLES'),
      where('isPublished', '==', true),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(stylesQuery);
    const styles = [];
    
    snapshot.forEach(doc => {
      styles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return styles;
  } catch (error) {
    console.error('Error fetching template styles:', error);
    return getDefaultStyles();
  }
};


// Styles เริ่มต้น
const getDefaultStyles = () => [
  {
    id: 'default',
    name: 'ธีมเริ่มต้น',
    primary: '#2563eb',
    font: 'inherit',
    radius: 'rounded-lg',
    chip: 'soft',
    isPublished: true
  }
];

// Helper function สำหรับแปลง template data
export const prepareTemplateData = (profile, educations, works, skills) => {
  return {
    profile: {
      ...profile,
      portfolioTitle: profile?.portfolioTitle || 'Portfolio ของฉัน',
      portfolioDesc: profile?.portfolioDesc || 'รวมผลงานและประวัติการศึกษาของฉัน'
    },
    educations: educations || [],
    works: works || [],
    skills: skills || []
  };
};