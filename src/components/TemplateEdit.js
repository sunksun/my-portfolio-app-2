// src/components/TemplateEdit.js
import React from "react";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc,
  doc, getDocs, serverTimestamp, orderBy, query
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const initForm = {
  name: "",              // ชื่อเทมเพลต (สำหรับผู้ใช้เลือก)
  type: "classic",       // classic | modern | timeline | gallery (เรนเดอร์ด้วย TemplateRenderer)
  desc: "",
  color: "#2563eb",
  sections: { profile:true, education:true, works:true, awards:true, skills:true },
  isPublished: true
};

export default function TemplateEdit() {
  const db = getFirestore();
  const uid = getAuth().currentUser?.uid;
  const [items, setItems] = React.useState([]);
  const [form, setForm] = React.useState(initForm);
  const [editingId, setEditingId] = React.useState("");

  const load = React.useCallback(async () => {
    const q = query(collection(db, "TEMPLATES"), orderBy("updatedAt","desc"));
    const snap = await getDocs(q);
    setItems(snap.docs.map(d => ({ id:d.id, ...d.data() })));
  }, [db]);

  React.useEffect(()=>{ load(); }, [load]);

  const onChange = (k,v)=> setForm(f => ({ ...f, [k]: v }));
  const toggleSec = (k)=> setForm(f => ({...f, sections:{...f.sections, [k]: !f.sections[k]}}));

  const startNew = ()=> { setForm(initForm); setEditingId(""); };
  const edit = (it)=> { setForm({ ...initForm, ...it }); setEditingId(it.id); };

  const save = async (e)=>{
    e.preventDefault();
    if (!form.name.trim()) return alert("กรอกชื่อเทมเพลต");
    const payload = { ...form, updatedAt: serverTimestamp(), updatedBy: uid };
    if (editingId) {
      await updateDoc(doc(db,"TEMPLATES",editingId), payload);
    } else {
      await addDoc(collection(db,"TEMPLATES"), { ...payload, createdAt: serverTimestamp(), createdBy: uid });
    }
    await load(); startNew();
  };

  const remove = async(id)=>{
    if (!window.confirm("ลบเทมเพลตนี้?")) return;
    await deleteDoc(doc(db,"TEMPLATES",id));
    await load(); if (editingId===id) startNew();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">สร้างและแก้ไขเทมเพลตมาตรฐาน</h2>

      {/* รายการเทมเพลต */}
      <div className="mb-6">
        <div className="text-sm text-slate-500 mb-2">เทมเพลตที่มี</div>
        <div className="grid md:grid-cols-2 gap-3">
          {items.map(it=>(
            <div key={it.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{it.name} <span className="text-xs text-slate-500">({it.type})</span></div>
                <div className="text-xs text-slate-500">{it.desc}</div>
                {!it.isPublished && <span className="text-xs text-amber-600">ไม่เผยแพร่</span>}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm border rounded" onClick={()=>edit(it)}>แก้ไข</button>
                <button className="px-3 py-1 text-sm border rounded text-rose-600" onClick={()=>remove(it.id)}>ลบ</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ฟอร์ม */}
      <form onSubmit={save} className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">ชื่อเทมเพลต</label>
            <input className="w-full border rounded px-2 py-1"
                   value={form.name} onChange={e=>onChange("name",e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">ประเภทเรนเดอร์</label>
            <select className="w-full border rounded px-2 py-1"
                    value={form.type} onChange={e=>onChange("type",e.target.value)}>
              <option value="classic">Classic (CV)</option>
              <option value="modern">Modern Gradient</option>
              <option value="timeline">Timeline</option>
              <option value="gallery">Gallery</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">สีหลัก</label>
            <input type="color" className="w-12 h-9 p-0 border rounded"
                   value={form.color} onChange={e=>onChange("color",e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input id="pub" type="checkbox" checked={form.isPublished}
                   onChange={e=>onChange("isPublished", e.target.checked)} />
            <label htmlFor="pub" className="text-sm">เผยแพร่ให้ผู้ใช้เลือก</label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">คำอธิบาย</label>
            <input className="w-full border rounded px-2 py-1"
                   value={form.desc} onChange={e=>onChange("desc",e.target.value)} />
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="text-sm font-medium mb-2">ส่วนที่จะโชว์</div>
          <div className="flex flex-wrap gap-4 text-sm">
            {["profile","education","works","awards","skills"].map(k=>(
              <label key={k} className="flex items-center gap-2">
                <input type="checkbox" checked={form.sections[k]} onChange={()=>toggleSec(k)} />
                <span>{k}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded">{editingId ? "บันทึกการแก้ไข" : "สร้างเทมเพลต"}</button>
          <button type="button" className="px-4 py-2 border rounded" onClick={startNew}>เริ่มใหม่</button>
        </div>
      </form>
    </div>
  );
}
