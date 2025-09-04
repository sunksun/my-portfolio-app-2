import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid, Users, FileCheck2, Palette, Bell, Search, Check, X,
  MoreHorizontal, Shield, Settings, BookOpen, GraduationCap, Briefcase,
  BadgeCheck, FolderTree, UserPlus, Trash2, Pencil, KeyRound, Download,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

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
    { template_id: "default", name: "Default", layout: "A4 Clean", category: "ทั่วไป", is_active: true, accent: "#4f46e5", preview: "D" },
    { template_id: "classic", name: "Classic", layout: "A4 Classic", category: "ทั่วไป", is_active: true, accent: "#0ea5e9", preview: "C" },
    { template_id: "modern", name: "Modern", layout: "A4 Modern", category: "ทั่วไป", is_active: true, accent: "#16a34a", preview: "M" },
    { template_id: "timeline", name: "Timeline", layout: "A4 Timeline", category: "กิจกรรม/ผลงาน", is_active: true, accent: "#f59e0b", preview: "T" },
    { template_id: "minimal", name: "Minimal", layout: "A4 Minimal", category: "ทั่วไป", is_active: false, accent: "#64748b", preview: "Min" },
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
  const [subs, setSubs] = useState(DEMO.submissions);
  const [users, setUsers] = useState(DEMO.users);
  const [educations] = useState(DEMO.educations);
  const [works] = useState(DEMO.works);
  const [templates, setTemplates] = useState(DEMO.templates);
  const [categories, setCategories] = useState(DEMO.categories);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchStats();
    fetchUsers(); // เรียกข้อมูลผู้ใช้เมื่อโหลดหน้า
  }, []);

  const filteredUsers = useMemo(()=>{
    if(!q.trim()) return users;
    const t = q.toLowerCase();
    return users.filter(s => [s.name,s.email,s.username,s.user_id,s.access_level,s[SECONDARY_FIELD.key]].join(" ").toLowerCase().includes(t));
  },[q,users]);

  const approve = (id)=>{ setSubs(a=>a.map(x=>x.id===id?{...x,status:"approved"}:x)); setToast({type:"success", msg:`อนุมัติพอร์ต #${id}`}); };
  const reject = (id)=>{ setSubs(a=>a.map(x=>x.id===id?{...x,status:"rejected"}:x)); setToast({type:"error", msg:`ส่งคำขอแก้ไข #${id}`}); };
  const setDefaultTemplate = (template_id)=> setToast({type:"success", msg:`ตั้งค่าเทมเพลตเริ่มต้น: ${template_id}`});
  const toggleTemplateActive = (template_id)=> setTemplates(arr=>arr.map(t=>t.template_id===template_id?{...t,is_active:!t.is_active}:t));
  const addCategory = ()=> setCategories(prev=>[...prev, { id:`C${String(prev.length+1).padStart(2,"0")}`, name:`หมวดหมู่ใหม่ ${prev.length+1}`} ]);

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
                  { header: "รหัสผู้ใช้", accessor: "user_id", className: "w-[110px]" },
                  { header: "ชื่อ", accessor: "name" },
                  { header: "ชื่อผู้ใช้", accessor: "username", className: "w-[130px]" },
                  { header: SECONDARY_FIELD.label, className: "w-[160px]", cell: (r)=>r[SECONDARY_FIELD.key] || "-" },
                  { header: "อีเมล", accessor: "email", className: "min-w-[200px]" },
                  { header: "สถานะ", accessor: "status", className: "w-[120px]", cell: (r)=> <StatusBadge status={r.status}/> },
                  { header: "สิทธิ์เข้าถึง", accessor: "access_level", className: "w-[160px]", cell: (r) => (
                    <select value={r.access_level} onChange={(e)=>{/* TODO: update role */}} className="rounded-lg border border-slate-300 px-2 py-1 text-xs">
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                  ) },
                  { header: "การจัดการ", className: "w-[220px]", cell: (r)=> (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="px-3 py-1.5"><Pencil className="h-4 w-4"/> แก้ไข</Button>
                      <Button variant="outline" className="px-3 py-1.5">
                        {r.status === "active" ? <><KeyRound className="h-4 w-4"/> ระงับ</> : <><BadgeCheck className="h-4 w-4"/> ปลดระงับ</>}
                      </Button>
                      <Button variant="danger" className="px-3 py-1.5"><Trash2 className="h-4 w-4"/> ลบ</Button>
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
                <Button variant="outline">+ สร้างเทมเพลตใหม่</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {templates.map(t => (
                  <div key={t.template_id} className="rounded-2xl bg-white ring-1 ring-slate-200/60 overflow-hidden">
                    <div className="h-28 bg-slate-100 grid place-items-center">
                      <div className="h-16 w-24 rounded-md grid place-items-center text-sm font-semibold" style={{ background: t.accent, color: "white" }}>{t.preview}</div>
                    </div>
                    <div className="p-3 space-y-1.5">
                      <div className="font-medium text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500">ID: {t.template_id} • Layout: {t.layout}</div>
                      <div className="text-xs text-slate-500">หมวดหมู่: {t.category}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button className="px-3 py-1.5" onClick={()=>setDefaultTemplate(t.template_id)}>ตั้งค่าเริ่มต้น</Button>
                        <Button variant="outline" className="px-3 py-1.5">แก้ไข</Button>
                        <label className="inline-flex items-center gap-1 text-xs">
                          <input type="checkbox" checked={t.is_active} onChange={()=>toggleTemplateActive(t.template_id)} /> ใช้งาน
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
