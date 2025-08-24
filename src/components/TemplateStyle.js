// src/components/TemplateStyle.js
import React from "react";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc,
  doc, getDocs, serverTimestamp, orderBy, query
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const init = { name:"ธีมเริ่มต้น", primary:"#2563eb", font:"inherit", radius:"rounded-lg", chip:"soft", isPublished:true };

export default function TemplateStyle() {
  const db = getFirestore();
  const uid = getAuth().currentUser?.uid;
  const [items, setItems] = React.useState([]);
  const [form, setForm] = React.useState(init);
  const [editingId, setEditingId] = React.useState("");

  const load = React.useCallback(async ()=>{
    const q = query(collection(db,"TEMPLATE_STYLES"), orderBy("updatedAt","desc"));
    const snap = await getDocs(q);
    setItems(snap.docs.map(d=>({id:d.id, ...d.data()})));
  },[db]);

  React.useEffect(()=>{ load(); },[load]);

  const on = (k,v)=> setForm(f=>({ ...f, [k]: v }));
  const startNew = ()=>{ setForm(init); setEditingId(""); };
  const edit = (it)=>{ setForm({ ...init, ...it }); setEditingId(it.id); };

  const save = async (e)=>{
    e.preventDefault();
    const payload = { ...form, updatedAt: serverTimestamp(), updatedBy: uid };
    if (editingId) await updateDoc(doc(db,"TEMPLATE_STYLES",editingId), payload);
    else await addDoc(collection(db,"TEMPLATE_STYLES"), { ...payload, createdAt:serverTimestamp(), createdBy:uid });
    await load(); startNew();
  };
  const remove = async(id)=>{ if(window.confirm("ลบธีมนี้?")){ await deleteDoc(doc(db,"TEMPLATE_STYLES",id)); await load(); if(editingId===id) startNew(); }};

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">กำหนดรูปแบบการแสดงผล (ธีม)</h2>

      <div className="mb-6 grid md:grid-cols-2 gap-3">
        {items.map(it=>(
          <div key={it.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">{it.name}</div>
              <div className="text-xs text-slate-500">{it.font} · {it.radius} · {it.chip} · {it.isPublished? "เผยแพร่":"ซ่อน"}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border rounded" onClick={()=>edit(it)}>แก้ไข</button>
              <button className="px-3 py-1 text-sm border rounded text-rose-600" onClick={()=>remove(it.id)}>ลบ</button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={save} className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">ชื่อธีม</label>
            <input className="w-full border rounded px-2 py-1" value={form.name} onChange={e=>on("name",e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">สีหลัก</label>
            <input type="color" className="w-12 h-9 p-0 border rounded" value={form.primary} onChange={e=>on("primary",e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">ฟอนต์</label>
            <select className="w-full border rounded px-2 py-1" value={form.font} onChange={e=>on("font",e.target.value)}>
              <option value="inherit">(ค่าเริ่มต้นระบบ)</option>
              <option value="'Sarabun', sans-serif">Sarabun</option>
              <option value="'Prompt', sans-serif">Prompt</option>
              <option value="'Noto Sans Thai', sans-serif">Noto Sans Thai</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">รัศมีมุม</label>
            <select className="w-full border rounded px-2 py-1" value={form.radius} onChange={e=>on("radius",e.target.value)}>
              <option value="rounded">{'rounded'}</option>
              <option value="rounded-lg">{'rounded-lg'}</option>
              <option value="rounded-xl">{'rounded-xl'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">สไตล์ชิป</label>
            <select className="w-full border rounded px-2 py-1" value={form.chip} onChange={e=>on("chip",e.target.value)}>
              <option value="soft">Soft</option>
              <option value="solid">Solid</option>
              <option value="outline">Outline</option>
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isPublished} onChange={e=>on("isPublished", e.target.checked)} />
            <span className="text-sm">เผยแพร่ให้ผู้ใช้เลือก</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded">{editingId ? "บันทึกการแก้ไข" : "สร้างธีม"}</button>
          <button type="button" onClick={()=>{setForm(init); setEditingId("");}} className="px-4 py-2 border rounded">เริ่มใหม่</button>
        </div>
      </form>
    </div>
  );
}
