import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid, Users, FileCheck2, Palette, Bell, Search, Check, X,
  MoreHorizontal, Shield, Settings, BookOpen, GraduationCap, Briefcase,
  BadgeCheck, FolderTree, UserPlus, Trash2, Pencil, KeyRound, Download,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, where, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// เปลี่ยน 'ชั้น/ห้อง' เป็นฟิลด์กำหนดเองได้ที่นี่
const SECONDARY_FIELD = { key: "program", label: "แผนการเรียน" };

const cx = (...a) => a.filter(Boolean).join(" ");

function StatusBadge({ status }) {
  const map = {
    approved: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200",
    pending: "text-amber-700 bg-amber-50 ring-1 ring-amber-200",
    rejected: "text-rose-700 bg-rose-50 ring-rose-200 ring-1",
    draft: "text-slate-700 bg-slate-50 ring-1 ring-slate-200",
    active: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200",
    suspended: "text-slate-700 bg-slate-100 ring-1 ring-slate-200",
  };
  const label = {
    approved: "อนุมัติแล้ว", pending: "รออนุมัติ", rejected: "ขอแก้ไข",
    draft: "ร่าง", active: "ใช้งานอยู่", suspended: "ถูกระงับ",
  }[status] || status;
  return <span className={cx("inline-flex items-center px-2 py-1 text-xs font-medium rounded-full", map[status])}>{label}</span>;
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 p-4 md:p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="text-2xl font-semibold text-slate-900">{value}</div>
          {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function Button({ children, variant="primary", className="", ...props }) {
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    ghost: "hover:bg-slate-100 text-slate-700",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return <button className={cx("inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition", styles[variant], className)} {...props}>{children}</button>;
}

function SearchInput({ value, onChange, placeholder="ค้นหา..." }) {
  return (
    <div className="relative">
      <input value={value} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"/>
      <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
    </div>
  );
}

function SimpleTable({ columns, rows, empty="ไม่มีข้อมูล" }) {
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/60 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>{columns.map((c,i)=>(<th key={i} className={cx("text-left font-medium px-4 py-3", c.className)}>{c.header}</th>))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.length===0 && (<tr><td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">{empty}</td></tr>)}
            {rows.map((r,i)=>(
              <tr key={i} className="hover:bg-slate-50/70">
                {columns.map((c,j)=>(<td key={j} className={cx("px-4 py-3", c.className)}>{typeof c.cell==="function"? c.cell(r) : r[c.accessor]}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Demo Data
const DEMO = {
  stats: { students: 248, portfolios: 219, pending: 7, templates: 5 },
  submissions: [
    { id: "P-2025-001", name: "ศิริกานต์ วัฒนชัย", [SECONDARY_FIELD.key]: "วิทย์-คณิต", updatedAt: "21 ส.ค. 2568", status: "pending" },
    { id: "P-2025-002", name: "พชรดนย์ พิมพ์พา", [SECONDARY_FIELD.key]: "ศิลป์-ภาษา", updatedAt: "21 ส.ค. 2568", status: "approved" },
    { id: "P-2025-003", name: "ปาริชาติ ชื่นสุข", [SECONDARY_FIELD.key]: "ศิลป์-คำนวณ", updatedAt: "20 ส.ค. 2568", status: "rejected" },
  ],
  users: [
    { user_id: "U001", username: "kittichai", name: "กิตติชัย จันทร์ทอง", email: "kittichai@example.com", status: "active", access_level: "student", program: "วิทย์-คณิต", created_at: "2025-08-15" },
    { user_id: "U002", username: "warisa", name: "วริษา พรหมดี", email: "warisa@example.com", status: "active", access_level: "student", program: "ศิลป์-คำนวณ", created_at: "2025-08-14" },
    { user_id: "U003", username: "natthaphon", name: "ณัฐพล รัตนชัย", email: "nat@example.com", status: "suspended", access_level: "student", program: "ศิลป์-ภาษา", created_at: "2025-08-10" },
  ],
  educations: [
    { education_id: "E001", user_id: "U001", degree: "ม.ปลาย", gpa: 3.75 },
    { education_id: "E002", user_id: "U002", degree: "ม.ปลาย", gpa: 3.52 },
  ],
  works: [
    { work_id: "W001", user_id: "U001", title: "ชนะเลิศวิทย์เขียว", category: "รางวัล/แข่งขัน", year: 2024, award: "ถ้วยรางวัล", status: "approved" },
    { work_id: "W002", user_id: "U002", title: "เว็บไซต์โรงเรียน", category: "โครงการ/ชิ้นงาน", year: 2025, award: "-", status: "pending" },
  ],
  templates: [
    { template_id: "classic", name: "Classic CV", layout: "A4 Classic", category: "ทั่วไป", is_active: true, accent: "#2563eb", preview: "C" },
    { template_id: "modern", name: "Modern Gradient", layout: "A4 Modern", category: "ทั่วไป", is_active: true, accent: "#16a34a", preview: "M" },
    { template_id: "timeline", name: "Timeline", layout: "A4 Timeline", category: "กิจกรรม/ผลงาน", is_active: true, accent: "#f59e0b", preview: "T" },
  ],
  categories: [
    { id: "C01", name: "รางวัล/แข่งขัน" },
    { id: "C02", name: "ผลงาน/โครงการ" },
    { id: "C03", name: "เกียรติบัตร" },
  ],
};

export default function AdminDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [q, setQ] = useState("");
  const [stats, setStats] = useState({ students: 0, portfolios: 0, pending: 0, templates: 0 });
  const [subs, setSubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [educations] = useState(DEMO.educations);
  const [works] = useState(DEMO.works);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState(DEMO.categories);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplateType, setSelectedTemplateType] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  // ฟังก์ชันดึงข้อมูลสถิติจาก Firestore
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // ดึงจำนวนผู้ใช้ทั้งหมด (students)
      const usersSnapshot = await getDocs(collection(db, "users"));
      const studentsCount = usersSnapshot.size;

      // ดึงจำนวน portfolio ที่มีสถานะ approved
      const portfoliosQuery = query(
        collection(db, "PROFILE"),
        where("status", "==", "approved")
      );
      const portfoliosSnapshot = await getDocs(portfoliosQuery);
      const portfoliosCount = portfoliosSnapshot.size;

      // ดึงจำนวน portfolio ที่รออนุมัติ
      const pendingQuery = query(
        collection(db, "PROFILE"),
        where("status", "==", "pending")
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingCount = pendingSnapshot.size;

      // ดึงจำนวนเทมเพลตที่ใช้งานอยู่
      const templatesQuery = query(
        collection(db, "TEMPLATE"),
        where("is_active", "==", true)
      );
      const templatesSnapshot = await getDocs(templatesQuery);
      const templatesCount = templatesSnapshot.size;

      // อัปเดตสถิติ
      setStats({
        students: studentsCount,
        portfolios: portfoliosCount,
        pending: pendingCount,
        templates: templatesCount
      });

    } catch (error) {
      console.error("Error fetching stats:", error);
      // ใช้ข้อมูล demo หากเกิดข้อผิดพลาด
      setStats(DEMO.stats);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันดึงข้อมูลผู้ใช้จาก Firestore
  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = [];
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          user_id: doc.id,
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          status: data.status || "active",
          access_level: data.access_level || "student",
          program: data.program || "",
          created_at: data.created_at?.toDate ? data.created_at.toDate().toLocaleDateString('th-TH') : "",
        });
      });

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      // ใช้ข้อมูล demo หากเกิดข้อผิดพลาด
      setUsers(DEMO.users);
    }
  };

  // ฟังก์ชันดึงข้อมูล templates จาก Firestore
  const fetchTemplates = async () => {
    try {
      const templatesSnapshot = await getDocs(collection(db, "TEMPLATES"));
      const templatesData = [];
      
      templatesSnapshot.forEach((doc) => {
        const data = doc.data();
        templatesData.push({
          template_id: doc.id,
          id: doc.id, // เพิ่ม id สำหรับ compatibility
          name: data.name || "",
          type: data.type || "classic",
          desc: data.desc || "",
          color: data.color || "#2563eb",
          accent: data.accent || data.color || "#2563eb",
          category: data.category || "ทั่วไป",
          layout: data.layout || "A4",
          preview: data.preview || data.name?.charAt(0) || "?",
          is_active: data.is_active !== undefined ? data.is_active : true,
          isPublished: data.isPublished !== undefined ? data.isPublished : true,
          sections: data.sections || {},
          layout_settings: data.layout_settings || {},
          created_at: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('th-TH') : "",
          updated_at: data.updatedAt?.toDate ? data.updatedAt.toDate().toLocaleDateString('th-TH') : "",
        });
      });

      console.log('Fetched templates from Firebase:', templatesData);
      setTemplates(templatesData);
    } catch (error) {
      console.error("Error fetching templates:", error);
      // ใช้ข้อมูล demo หากเกิดข้อผิดพลาด
      setTemplates(DEMO.templates);
    }
  };

  // ฟังก์ชันดึงข้อมูลคำขออนุมัติ (submissions)
  const fetchSubmissions = async () => {
    try {
      // ดึงข้อมูล users ที่มี profile submissions
      const usersSnapshot = await getDocs(collection(db, "users"));
      const submissions = [];
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        // ค้นหา profile status ของผู้ใช้แต่ละคน
        // สมมติว่ามี field submission_status หรือ portfolio_status ในข้อมูล user
        if (userData.visibility && userData.visibility !== 'private') {
          const submissionData = {
            id: `P-${userDoc.id.slice(-3).toUpperCase()}`, // สร้าง ID จาก user document
            name: userData.name || userData.displayName || 'ไม่ระบุชื่อ',
            [SECONDARY_FIELD.key]: userData.program || userData[SECONDARY_FIELD.key] || '-',
            updatedAt: userData.updatedAt ? 
              new Date(userData.updatedAt.seconds * 1000).toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) : 'ไม่ทราบ',
            status: userData.profile_status || (userData.visibility === 'public' ? 'approved' : 'pending'),
            userId: userDoc.id,
            email: userData.email
          };
          submissions.push(submissionData);
        }
      }
      
      console.log('Fetched submissions:', submissions);
      setSubs(submissions);
      
    } catch (error) {
      console.error("Error fetching submissions:", error);
      // ใช้ข้อมูล demo หากเกิดข้อผิดพลาด
      setSubs(DEMO.submissions);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers(); // เรียกข้อมูลผู้ใช้เมื่อโหลดหน้า
    fetchTemplates(); // เรียกข้อมูล templates เมื่อโหลดหน้า
    fetchSubmissions(); // เรียกข้อมูลคำขออนุมัติเมื่อโหลดหน้า
  }, []);

  const filteredUsers = useMemo(()=>{
    if(!q.trim()) return users;
    const t = q.toLowerCase();
    return users.filter(s => [s.name,s.email,s.username,s.user_id,s.access_level,s[SECONDARY_FIELD.key]].join(" ").toLowerCase().includes(t));
  },[q,users]);

  // ฟังก์ชันอนุมัติคำขอ
  const approve = async (id) => {
    try {
      // หา submission ที่ตรงกับ id
      const submission = subs.find(s => s.id === id);
      if (!submission) return;
      
      // อัปเดตใน Firestore
      const userRef = doc(db, 'users', submission.userId);
      await updateDoc(userRef, {
        profile_status: 'approved',
        updatedAt: serverTimestamp()
      });
      
      // อัปเดต state
      setSubs(a => a.map(x => x.id === id ? {...x, status: "approved"} : x));
      setToast({type: "success", msg: `อนุมัติพอร์ต #${id} สำเร็จ`});
      
      // รีเฟรชข้อมูลสถิติ
      fetchStats();
      
    } catch (error) {
      console.error('Error approving submission:', error);
      setToast({type: "error", msg: `เกิดข้อผิดพลาดในการอนุมัติพอร์ต #${id}`});
    }
  };
  
  // ฟังก์ชันปฏิเสธคำขอ
  const reject = async (id) => {
    try {
      // หา submission ที่ตรงกับ id
      const submission = subs.find(s => s.id === id);
      if (!submission) return;
      
      // อัปเดตใน Firestore
      const userRef = doc(db, 'users', submission.userId);
      await updateDoc(userRef, {
        profile_status: 'rejected',
        updatedAt: serverTimestamp()
      });
      
      // อัปเดต state
      setSubs(a => a.map(x => x.id === id ? {...x, status: "rejected"} : x));
      setToast({type: "error", msg: `ส่งคำขอแก้ไข #${id}`});
      
      // รีเฟรชข้อมูลสถิติ
      fetchStats();
      
    } catch (error) {
      console.error('Error rejecting submission:', error);
      setToast({type: "error", msg: `เกิดข้อผิดพลาดในการปฏิเสธพอร์ต #${id}`});
    }
  };

  // ฟังก์ชันจัดการผู้ใช้
  const updateUserRole = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        access_level: newRole,
        updatedAt: serverTimestamp()
      });
      
      // อัปเดต state
      setUsers(users.map(user => 
        user.user_id === userId ? {...user, access_level: newRole} : user
      ));
      
      setToast({type: "success", msg: `เปลี่ยนสิทธิ์ผู้ใช้เป็น ${newRole} สำเร็จ`});
      
    } catch (error) {
      console.error('Error updating user role:', error);
      setToast({type: "error", msg: "เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์ผู้ใช้"});
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      // อัปเดต state
      setUsers(users.map(user => 
        user.user_id === userId ? {...user, status: newStatus} : user
      ));
      
      const actionText = newStatus === 'suspended' ? 'ระงับ' : 'ปลดระงับ';
      setToast({type: "success", msg: `${actionText}ผู้ใช้สำเร็จ`});
      
    } catch (error) {
      console.error('Error toggling user status:', error);
      setToast({type: "error", msg: "เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ใช้"});
    }
  };

  // ฟังก์ชันเปิด modal แก้ไขข้อมูลผู้ใช้
  const openEditModal = (user) => {
    setEditingUser({
      user_id: user.user_id,
      name: user.name,
      username: user.username,
      email: user.email,
      program: user.program || '',
      access_level: user.access_level
    });
    setShowEditModal(true);
  };

  // ฟังก์ชันบันทึกการแก้ไขข้อมูลผู้ใช้
  const saveUserEdit = async () => {
    try {
      const userRef = doc(db, 'users', editingUser.user_id);
      await updateDoc(userRef, {
        name: editingUser.name,
        username: editingUser.username,
        email: editingUser.email,
        program: editingUser.program,
        access_level: editingUser.access_level,
        updatedAt: serverTimestamp()
      });
      
      // อัพเดท state
      setUsers(users.map(user => 
        user.user_id === editingUser.user_id ? {
          ...user,
          name: editingUser.name,
          username: editingUser.username,
          email: editingUser.email,
          program: editingUser.program,
          access_level: editingUser.access_level
        } : user
      ));
      
      setToast({type: "success", msg: "แก้ไขข้อมูลผู้ใช้สำเร็จ"});
      setShowEditModal(false);
      setEditingUser(null);
      
    } catch (error) {
      console.error('Error updating user:', error);
      setToast({type: "error", msg: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้"});
    }
  };

  // ฟังก์ชันเปิด confirmation dialog สำหรับการลบ
  const openDeleteConfirm = (userId) => {
    setDeletingUserId(userId);
    setShowDeleteConfirm(true);
  };

  // ฟังก์ชันลบผู้ใช้
  const deleteUser = async () => {
    try {
      // ในกรณีจริงอาจต้องลบข้อมูลที่เกี่ยวข้องก่อน (profile, education, works)
      // แต่ในที่นี้จะเปลี่ยนเป็น soft delete (เปลี่ยนสถานะเป็น deleted)
      const userRef = doc(db, 'users', deletingUserId);
      await updateDoc(userRef, {
        status: 'deleted',
        deletedAt: serverTimestamp()
      });
      
      // ลบออกจาก state
      setUsers(users.filter(user => user.user_id !== deletingUserId));
      
      setToast({type: "success", msg: "ลบผู้ใช้สำเร็จ"});
      setShowDeleteConfirm(false);
      setDeletingUserId(null);
      
      // รีเฟรชสถิติ
      fetchStats();
      
    } catch (error) {
      console.error('Error deleting user:', error);
      setToast({type: "error", msg: "เกิดข้อผิดพลาดในการลบผู้ใช้"});
    }
  };

  const setDefaultTemplate = (template_id)=> setToast({type:"success", msg:`ตั้งค่าเทมเพลตเริ่มต้น: ${template_id}`});
  const toggleTemplateActive = (template_id)=> setTemplates(arr=>arr.map(t=>t.template_id===template_id?{...t,is_active:!t.is_active}:t));
  const addCategory = ()=> setCategories(prev=>[...prev, { id:`C${String(prev.length+1).padStart(2,"0")}`, name:`หมวดหมู่ใหม่ ${prev.length+1}`} ]);

  // เทมเพลตตัวเลือก 3 แบบ
  const templateOptions = [
    {
      id: 'classic',
      name: 'Classic CV',
      type: 'classic',
      desc: 'เรียบง่าย เหมาะสำหรับทุกสาขา',
      color: '#2563eb',
      preview: 'C',
      category: 'ทั่วไป',
      layout: 'A4 Classic'
    },
    {
      id: 'modern',
      name: 'Modern Gradient',
      type: 'modern',
      desc: 'ทันสมัย มีสีสัน เหมาะสำหรับครีเอทีฟ',
      color: '#16a34a',
      preview: 'M',
      category: 'ทั่วไป',
      layout: 'A4 Modern'
    },
    {
      id: 'timeline',
      name: 'Timeline',
      type: 'timeline',
      desc: 'แสดงเป็นไทม์ไลน์ เหมาะสำหรับแสดงประสบการณ์',
      color: '#059669',
      preview: 'T',
      category: 'กิจกรรม/ผลงาน',
      layout: 'A4 Timeline'
    }
  ];

  // ฟังก์ชันสร้างเทมเพลตใหม่
  const createNewTemplate = async () => {
    if (!selectedTemplateType) {
      setToast({type: "error", msg: "กรุณาเลือกประเภทเทมเพลต"});
      return;
    }

    try {
      const selectedOption = templateOptions.find(t => t.id === selectedTemplateType);
      if (!selectedOption) return;

      // สร้าง unique template ID โดยเพิ่ม timestamp
      const timestamp = Date.now();
      const customId = `${selectedOption.id}_${timestamp}`;
      
      const templateData = {
        ...selectedOption,
        id: customId,
        name: selectedOption.name, // ใช้ชื่อจาก templateOptions
        template_id: customId,
        sections: {
          profile: true,
          education: true,
          works: true,
          awards: true,
          skills: true
        },
        layout_settings: {
          columns: selectedOption.type === 'modern' || selectedOption.type === 'timeline' ? 1 : 2,
          header_style: selectedOption.type === 'classic' ? 'centered' : selectedOption.type === 'modern' ? 'gradient' : 'timeline',
          card_style: selectedOption.type === 'classic' ? 'minimal' : selectedOption.type
        },
        accent: selectedOption.color,
        is_active: true,
        isPublished: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'admin',
        updatedBy: 'admin'
      };

      // บันทึกลง Firestore
      await setDoc(doc(collection(db, 'TEMPLATES'), customId), templateData);
      
      setToast({type: "success", msg: `สร้างเทมเพลต "${selectedOption.name}" สำเร็จ`});
      
      // รีเซ็ต modal
      setShowTemplateModal(false);
      setSelectedTemplateType('');
      
      // รีเฟรชรายการเทมเพลต
      await fetchTemplates();
      
    } catch (error) {
      console.error('Error creating template:', error);
      setToast({type: "error", msg: "เกิดข้อผิดพลาดในการสร้างเทมเพลต"});
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
     {/* ปุ่มกลับแดชบอร์ด */}
      <Link
       to="/dashboard"
       className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
       title="กลับแดชบอร์ด">
      <ArrowLeft className="h-4 w-4" />
      กลับแดชบอร์ด
      </Link>
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white grid place-items-center font-semibold">HS</div>
            <div><div className="text-sm text-slate-500">E‑Portfolio Admin</div><div className="font-semibold text-slate-900"></div></div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="hidden md:inline-flex"><Shield className="h-4 w-4"/> สิทธิ์แอดมิน</Button>
            <Button variant="ghost" aria-label="notifications"><Bell className="h-5 w-5"/></Button>
            <div className="h-9 w-9 rounded-full bg-slate-200" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 md:px-6 grid grid-cols-12 gap-4 md:gap-6 mt-4 md:mt-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="rounded-2xl bg-white ring-1 ring-slate-200/60 p-2 md:p-3">
            <SidebarItem icon={LayoutGrid} label="ภาพรวม" active tab={tab} onClick={()=>setTab("dashboard")} />
            <SidebarItem icon={Users} label="ผู้ใช้งาน" active={tab==="users"} onClick={()=>setTab("users")} />
            <SidebarItem icon={GraduationCap} label="การศึกษา" active={tab==="education"} onClick={()=>setTab("education")} />
            <SidebarItem icon={Briefcase} label="ผลงาน (WORK)" active={tab==="works"} onClick={()=>setTab("works")} />
            <SidebarItem icon={FileCheck2} label="คำขออนุมัติ" active={tab==="submissions"} onClick={()=>setTab("submissions")} />
            <SidebarItem icon={Palette} label="เทมเพลต" active={tab==="templates"} onClick={()=>setTab("templates")} />
            <SidebarItem icon={FolderTree} label="หมวดหมู่ผลงาน" active={tab==="categories"} onClick={()=>setTab("categories")} />
            <SidebarItem icon={Settings} label="ตั้งค่า" active={tab==="settings"} onClick={()=>setTab("settings")} />
          </nav>
        </aside>

        <main className="col-span-12 md:col-span-9 lg:col-span-10 space-y-6">
          {tab==="dashboard" && (
            <section className="space-y-6">
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900 flex items-center gap-2"><LayoutGrid className="h-5 w-5"/> ภาพรวมระบบ</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                  // Loading state
                  <>
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 p-4 md:p-5 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
                        <div>
                          <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                          <div className="h-8 bg-slate-200 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 p-4 md:p-5 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
                        <div>
                          <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                          <div className="h-8 bg-slate-200 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 p-4 md:p-5 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
                        <div>
                          <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                          <div className="h-8 bg-slate-200 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 p-4 md:p-5 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
                        <div>
                          <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                          <div className="h-8 bg-slate-200 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Data loaded
                  <>
                    <StatCard icon={Users} label="นักเรียนทั้งหมด" value={stats.students} sub={`อัปเดตแล้ว ${new Date().toLocaleDateString('th-TH')}`} />
                    <StatCard icon={BookOpen} label="พอร์ตโฟลิโอที่อนุมัติแล้ว" value={stats.portfolios} sub="พร้อมเผยแพร่สู่สาธารณะ" />
                    <StatCard icon={FileCheck2} label="รออนุมัติ" value={stats.pending} sub="ตรวจสอบก่อนเผยแพร่" />
                    <StatCard icon={Palette} label="เทมเพลตที่ใช้งาน" value={stats.templates} sub="เทมเพลตที่เปิดใช้งาน" />
                  </>
                )}
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-sky-50 ring-1 ring-slate-200/70 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div><div className="text-lg font-semibold text-slate-900">งานที่ควรทำตอนนี้</div><div className="text-slate-600 text-sm">ตรวจพอร์ต • ตั้งค่าเทมเพลตเริ่มต้น • ส่งประกาศ</div></div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={()=>setTab("submissions")}><FileCheck2 className="h-4 w-4"/> ตรวจพอร์ต</Button>
                    <Button variant="outline" onClick={()=>setTab("templates")}><Palette className="h-4 w-4"/> จัดการเทมเพลต</Button>
                    <Button variant="ghost" onClick={()=>setTab("users")}><Users className="h-4 w-4"/> จัดการผู้ใช้</Button>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">พอร์ตโฟลิโอล่าสุด</h2>
                  <Button variant="ghost" onClick={()=>setTab("submissions")}>ดูทั้งหมด</Button>
                </div>
                <SimpleTable
                  columns={[
                    { header: "รหัส", accessor: "id", className: "w-[120px]" },
                    { header: "ชื่อนักเรียน", accessor: "name" },
                    { header: SECONDARY_FIELD.label, className: "w-[140px]", cell: (r)=>r[SECONDARY_FIELD.key] || "-" },
                    { header: "อัปเดต", accessor: "updatedAt", className: "w-[140px]" },
                    { header: "สถานะ", accessor: "status", className: "w-[120px]", cell: (r)=> <StatusBadge status={r.status}/> },
                    { header: "การจัดการ", className: "w-[200px]", cell: (r)=> (
                      <div className="flex items-center gap-2">
                        <Button className="px-3 py-1.5" onClick={()=>approve(r.id)}><Check className="h-4 w-4"/> อนุมัติ</Button>
                        <Button variant="outline" className="px-3 py-1.5" onClick={()=>reject(r.id)}><X className="h-4 w-4"/> ขอแก้ไข</Button>
                      </div>
                    ) },
                  ]}
                  rows={subs}
                />
              </div>
            </section>
          )}

          {tab==="users" && (
            <section className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><Users className="h-5 w-5"/> ผู้ใช้งาน (USER)</h1>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="w-full md:w-96"><SearchInput value={q} onChange={setQ} placeholder={`ค้นหา ชื่อ/${SECONDARY_FIELD.label}/อีเมล/สิทธิ์`} /></div>
                  <Button variant="outline"><UserPlus className="h-4 w-4"/> เพิ่มผู้ใช้</Button>
                  <Button variant="outline"><Download className="h-4 w-4"/> นำเข้ารายชื่อ (CSV)</Button>
                </div>
              </div>
              <SimpleTable
                columns={[
                  { header: "ชื่อ", accessor: "name" },
                  { header: "ชื่อผู้ใช้", accessor: "username", className: "w-[130px]" },
                  { header: SECONDARY_FIELD.label, className: "w-[160px]", cell: (r)=>r[SECONDARY_FIELD.key] || "-" },
                  { header: "อีเมล", accessor: "email", className: "min-w-[200px]" },
                  { header: "สถานะ", accessor: "status", className: "w-[120px]", cell: (r)=> <StatusBadge status={r.status}/> },
                  { header: "สิทธิ์เข้าถึง", accessor: "access_level", className: "w-[160px]", cell: (r) => (
                    <select 
                      value={r.access_level} 
                      onChange={(e) => updateUserRole(r.user_id, e.target.value)} 
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                  ) },
                  { header: "การจัดการ", className: "w-[220px]", cell: (r)=> (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        className="px-3 py-1.5 text-xs"
                        onClick={() => openEditModal(r)}
                      >
                        <Pencil className="h-4 w-4"/> แก้ไข
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`px-3 py-1.5 text-xs ${r.status === "active" ? "text-orange-600 border-orange-300" : "text-green-600 border-green-300"}`}
                        onClick={() => toggleUserStatus(r.user_id, r.status)}
                      >
                        {r.status === "active" ? 
                          <><KeyRound className="h-4 w-4"/> ระงับ</> : 
                          <><BadgeCheck className="h-4 w-4"/> ปลดระงับ</>
                        }
                      </Button>
                      <Button 
                        variant="danger" 
                        className="px-3 py-1.5 text-xs"
                        onClick={() => openDeleteConfirm(r.user_id)}
                      >
                        <Trash2 className="h-4 w-4"/> ลบ
                      </Button>
                    </div>
                  ) },
                ]}
                rows={filteredUsers}
              />
            </section>
          )}

          {tab==="education" && (
            <section className="space-y-4">
              <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><GraduationCap className="h-5 w-5"/> การศึกษา (EDUCATION)</h1>
              <SimpleTable columns={[
                { header: "รหัสการศึกษา", accessor: "education_id", className: "w-[140px]" },
                { header: "ผู้ใช้ (user_id)", accessor: "user_id", className: "w-[120px]" },
                { header: "ระดับ/วุฒิ", accessor: "degree" },
                { header: "GPA", accessor: "gpa", className: "w-[100px]" },
              ]} rows={DEMO.educations} />
            </section>
          )}

          {tab==="works" && (
            <section className="space-y-4">
              <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><Briefcase className="h-5 w-5"/> ผลงาน (WORK)</h1>
              <SimpleTable columns={[
                { header: "รหัสงาน", accessor: "work_id", className: "w-[120px]" },
                { header: "ผู้ใช้ (user_id)", accessor: "user_id", className: "w-[120px]" },
                { header: "ชื่อผลงาน", accessor: "title" },
                { header: "หมวดหมู่", accessor: "category", className: "w-[180px]" },
                { header: "ปี", accessor: "year", className: "w-[90px]" },
                { header: "รางวัล", accessor: "award", className: "w-[150px]" },
                { header: "สถานะ", accessor: "status", className: "w-[120px]", cell: (r)=> <StatusBadge status={r.status}/> },
              ]} rows={DEMO.works} />
            </section>
          )}

          {tab==="submissions" && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><FileCheck2 className="h-5 w-5"/> คำขออนุมัติ (PROFILE)</h1>
                <div className="text-sm text-slate-500">กำหนดให้อนุมัติก่อนเผยแพร่สู่สาธารณะ</div>
              </div>
              <SimpleTable
                columns={[
                  { header: "รหัสพอร์ต", accessor: "id", className: "w-[120px]" },
                  { header: "ชื่อนักเรียน", accessor: "name" },
                  { header: SECONDARY_FIELD.label, className: "w-[160px]", cell: (r)=>r[SECONDARY_FIELD.key] || "-" },
                  { header: "อัปเดตล่าสุด", accessor: "updatedAt", className: "w-[140px]" },
                  { header: "สถานะ", accessor: "status", className: "w-[120px]", cell: (r)=> <StatusBadge status={r.status}/> },
                  { header: "การจัดการ", className: "w-[240px]", cell: (r)=> (
                    <div className="flex items-center gap-2">
                      <Button className="px-3 py-1.5" onClick={()=>approve(r.id)}><Check className="h-4 w-4"/> อนุมัติ</Button>
                      <Button variant="outline" className="px-3 py-1.5" onClick={()=>reject(r.id)}><X className="h-4 w-4"/> ขอแก้ไข</Button>
                      <Button variant="ghost" className="px-3 py-1.5"><MoreHorizontal className="h-4 w-4"/> เพิ่มเติม</Button>
                    </div>
                  ) },
                ]}
                rows={subs}
              />
            </section>
          )}

          {tab==="templates" && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><Palette className="h-5 w-5"/> เทมเพลต (TEMPLATE)</h1>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.open('/admin-dashboard/initialize-templates', '_blank')}>
                    🔧 Initialize Templates
                  </Button>
                  <Button variant="outline" onClick={() => setShowTemplateModal(true)}>+ สร้างเทมเพลตใหม่</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(t => (
                  <div key={t.template_id} className="rounded-2xl bg-white ring-1 ring-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-40 bg-slate-100 grid place-items-center relative">
                      <div className="h-24 w-32 rounded-lg grid place-items-center text-lg font-semibold shadow-md" style={{ background: t.accent, color: "white" }}>
                        {t.preview}
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {t.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="font-semibold text-slate-900 text-lg mb-1">{t.name}</div>
                        <div className="text-sm text-slate-600 mb-2">{t.description || 'เทมเพลตสำหรับสร้าง Portfolio'}</div>
                        <div className="text-xs text-slate-500 space-y-1">
                          <div>ID: <span className="font-mono">{t.template_id}</span></div>
                          <div>Layout: {t.layout}</div>
                          <div>หมวดหมู่: {t.category}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <Button className="px-4 py-2 text-sm" onClick={()=>setDefaultTemplate(t.template_id)}>
                          ตั้งค่าเริ่มต้น
                        </Button>
                        <Button variant="outline" className="px-4 py-2 text-sm">
                          แก้ไข
                        </Button>
                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={t.is_active} 
                            onChange={()=>toggleTemplateActive(t.template_id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          /> 
                          ใช้งาน
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab==="categories" && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><FolderTree className="h-5 w-5"/> หมวดหมู่ผลงาน</h1>
                <Button variant="outline" onClick={addCategory}>+ เพิ่มหมวดหมู่</Button>
              </div>
              <SimpleTable columns={[
                { header: "ID", accessor: "id", className: "w-[120px]" },
                { header: "ชื่อหมวดหมู่", accessor: "name" },
              ]} rows={categories} />
            </section>
          )}

          {tab==="settings" && (
            <section className="space-y-4">
              <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2"><Settings className="h-5 w-5"/> ตั้งค่าระบบ</h1>
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/60 p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="block text-sm text-slate-600 mb-1">ชื่อโรงเรียน</label><input className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="โรงเรียนตัวอย่าง" /></div>
                  <div><label className="block text-sm text-slate-600 mb-1">เทมเพลตค่าเริ่มต้น</label>
                    <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">{templates.map(t=> <option key={t.template_id} value={t.template_id}>{t.name}</option>)}</select>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <ToggleField label="ต้องอนุมัติก่อนเผยแพร่" desc="นักเรียนจะต้องส่งคำขอและได้รับการอนุมัติ" defaultChecked />
                  <ToggleField label="เปิดคอมเมนต์จากครู" desc="ให้นักเรียนเห็นข้อเสนอแนะ" defaultChecked />
                  <ToggleField label="อนุญาตการค้นหาสาธารณะ" desc="ให้ผู้อื่นค้นหาพอร์ตได้" />
                </div>
                <div className="flex items-center justify-end"><Button>บันทึกการตั้งค่า</Button></div>
              </div>
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/60 p-4">
                <div className="font-medium text-slate-900 mb-2">สำรองข้อมูล</div>
                <div className="text-sm text-slate-600 mb-3">ดาวน์โหลดผู้ใช้/การศึกษา/ผลงาน/พอร์ต เป็น CSV</div>
                <Button variant="outline">ดาวน์โหลด CSV</Button>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Create Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">สร้างเทมเพลตใหม่</h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  เลือกประเภทเทมเพลต
                </label>
                <div className="space-y-3">
                  {templateOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedTemplateType === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="templateType"
                        value={option.id}
                        checked={selectedTemplateType === option.id}
                        onChange={(e) => setSelectedTemplateType(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center w-full gap-3">
                        <div
                          className="w-12 h-8 rounded-md flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: option.color }}
                        >
                          {option.preview}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{option.name}</div>
                          <div className="text-sm text-slate-600">{option.desc}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            หมวดหมู่: {option.category} • Layout: {option.layout}
                          </div>
                        </div>
                        {selectedTemplateType === option.id && (
                          <div className="text-blue-500">
                            <Check className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplateType('');
                }}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={createNewTemplate}
                disabled={!selectedTemplateType}
                className={`${
                  !selectedTemplateType
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                สร้างเทมเพลต
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal แก้ไขข้อมูลผู้ใช้ */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">แก้ไขข้อมูลผู้ใช้</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{SECONDARY_FIELD.label}</label>
                <input
                  type="text"
                  value={editingUser.program}
                  onChange={(e) => setEditingUser({...editingUser, program: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สิทธิ์</label>
                <select
                  value={editingUser.access_level}
                  onChange={(e) => setEditingUser({...editingUser, access_level: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">student</option>
                  <option value="teacher">teacher</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={saveUserEdit}
                className="flex-1"
              >
                บันทึก
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog สำหรับการลบ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">ยืนยันการลบผู้ใช้</h3>
                <p className="text-sm text-gray-500">การกระทำนี้ไม่สามารถยกเลิกได้</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้? ข้อมูลทั้งหมดจะถูกเปลี่ยนสถานะเป็น "ถูกลบ"
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingUserId(null);
                }}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                variant="danger"
                onClick={deleteUser}
                className="flex-1"
              >
                ลบผู้ใช้
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className={cx("rounded-xl px-4 py-2 shadow-lg text-sm", toast.type==="success" && "bg-emerald-600 text-white", toast.type==="error" && "bg-rose-600 text-white")}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }) {
  const klass = active ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100";
  return <button onClick={onClick} className={cx("w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium", klass)}><Icon className="h-4 w-4"/><span>{label}</span></button>;
}

function ToggleField({ label, desc, defaultChecked=false }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div><div className="text-sm font-medium text-slate-900">{label}</div>{desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}</div>
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={on} onChange={()=>setOn(!on)} className="sr-only" />
          <div className={cx("w-10 h-6 rounded-full transition", on ? "bg-indigo-600" : "bg-slate-300")}>
            <div className={cx("h-5 w-5 bg-white rounded-full mt-0.5 transition", on ? "translate-x-5" : "translate-x-0.5")} />
          </div>
        </label>
      </div>
    </div>
  );
}
