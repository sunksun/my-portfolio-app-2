// src/components/FacultyTemplates.js
import React from "react";

/* ---------- โครง A4 + blocks ใช้ร่วมกัน ---------- */
const A4 = ({ children }) => (
  <div className="relative w-[900px] h-[1273px] bg-white overflow-hidden shadow-2xl rounded-[8px] print:shadow-none print:rounded-none">
    {children}
  </div>
);

const Info = ({ name, program, faculty, school, year, tagline }) => (
  <div className="space-y-1">
    <div className="text-4xl font-extrabold tracking-tight leading-tight">{name || "ชื่อ–นามสกุล"}</div>
    <div className="text-lg font-medium">{program || "โปรแกรม/แผนการเรียน"}</div>
    <div className="text-base opacity-80">{faculty || "คณะ/สาขาที่ต้องการ"}</div>
    <div className="text-base opacity-70">{school || "โรงเรียน / สถาบัน"}</div>
    <div className="text-sm opacity-60">{year || "ปีการศึกษา 2568"}</div>
    {tagline ? <div className="text-base mt-2 italic opacity-80">“{tagline}”</div> : null}
  </div>
);

const Photo = ({ src, className = "" }) => (
  <div className={`overflow-hidden rounded-xl border-4 border-white shadow-xl ${className}`}>
    <img
      src={src || "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=900&auto=format&fit=crop"}
      alt="cover"
      className="w-full h-full object-cover"
    />
  </div>
);

/* ===== 1) Engineering ===== */
export function TEng({ data }) {
  const { name, program, faculty, school, year, tagline, photoURL } = data || {};
  return (
    <A4>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
      <div className="absolute -left-24 -top-24 w-[520px] h-[520px] rounded-full border-8 border-slate-300/70" />
      <div className="absolute -left-10 -top-10 w-[420px] h-[420px] rounded-full border-[14px] border-dashed border-sky-500/50" />
      <div className="absolute right-[-120px] bottom-[-80px] w-[680px] h-[420px] bg-sky-600/90 rounded-[120px] rotate-[-8deg]" />
      <div className="absolute right-[-80px] bottom-[10px] w-[700px] h-[360px] bg-white/80 rounded-[120px] rotate-[-8deg]" />
      <div className="relative z-10 p-14 grid grid-cols-[1.05fr_.95fr] gap-10 h-full">
        <div className="flex flex-col justify-center">
          <div className="text-5xl font-black tracking-tight text-sky-700">ENGINEERING<br/>PORTFOLIO</div>
          <div className="mt-6"><Info {...{ name, program, faculty, school, year, tagline }} /></div>
        </div>
        <div className="flex items-center justify-end">
          <Photo src={photoURL} className="w-[360px] h-[480px]" />
        </div>
      </div>
    </A4>
  );
}

/* ===== 2) Medicine ===== */
export function TMed({ data }) {
  const { name, program, faculty, school, year, tagline, photoURL } = data || {};
  return (
    <A4>
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white" />
      <div className="absolute inset-x-0 top-0 h-24 bg-emerald-600" />
      <div className="absolute inset-x-0 top-24 h-3 bg-emerald-300/70" />
      <div className="relative z-10 p-14 grid grid-cols-[.95fr_1.05fr] gap-10 h-full">
        <div className="flex items-center justify-center">
          <div className="bg-white/90 rounded-2xl p-4 shadow-xl">
            <Photo src={photoURL} className="w-[360px] h-[470px]" />
          </div>
        </div>
        <div className="self-center">
          <div className="text-4xl font-black text-emerald-700 mb-4">MEDICINE PORTFOLIO</div>
          <Info {...{ name, program, faculty, school, year, tagline }} />
        </div>
      </div>
    </A4>
  );
}

/* ===== 3) Business ===== */
export function TBiz({ data }) {
  const { name, program, faculty, school, year, tagline, photoURL } = data || {};
  return (
    <A4>
      <div className="absolute inset-0 bg-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/10 to-transparent" />
      <div className="absolute -left-40 top-0 bottom-0 w-[420px] bg-amber-500 rotate-[-12deg]" />
      <div className="absolute -left-56 top-0 bottom-0 w-[420px] bg-amber-300 rotate-[-12deg]" />
      <div className="relative z-10 p-14 grid grid-cols-[1.05fr_.95fr] gap-10 h-full text-white">
        <div className="self-center">
          <div className="text-[60px] leading-[0.95] font-black">BUSINESS<br/>PORTFOLIO</div>
          <div className="mt-6"><Info {...{ name, program, faculty, school, year, tagline }} /></div>
        </div>
        <div className="flex items-end justify-end">
          <Photo src={photoURL} className="w-[360px] h-[480px] border-2 border-amber-200/80" />
        </div>
      </div>
    </A4>
  );
}

/* ===== 4) Arts ===== */
export function TArts({ data }) {
  const { name, program, faculty, school, year, tagline, photoURL } = data || {};
  return (
    <A4>
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400" />
      <div className="absolute inset-6 bg-white/90 rounded-[24px]" />
      <div className="relative z-10 p-16 grid grid-cols-[.9fr_1.1fr] gap-10 h-full">
        <div className="flex items-center justify-center">
          <Photo src={photoURL} className="w-[360px] h-[460px]" />
        </div>
        <div className="self-center">
          <div className="text-4xl font-black text-rose-600 mb-2">ARTS PORTFOLIO</div>
          <Info {...{ name, program, faculty, school, year, tagline }} />
        </div>
      </div>
    </A4>
  );
}

/* ===== 5) Architecture ===== */
export function TArch({ data }) {
  const { name, program, faculty, school, year, tagline, photoURL } = data || {};
  return (
    <A4>
      <div className="absolute inset-0 bg-white" />
      {[...Array(24)].map((_,i)=>(<div key={i} className="absolute left-0 right-0 h-px bg-neutral-200" style={{ top: `${i*54}px` }} />))}
      {[...Array(16)].map((_,i)=>(<div key={`c${i}`} className="absolute top-0 bottom-0 w-px bg-neutral-200" style={{ left: `${i*56}px` }} />))}
      <div className="absolute inset-8 border-4 border-black/80 rounded-xl" />
      <div className="relative z-10 p-16 grid grid-cols-[1fr_1fr] gap-10 h-full">
        <div className="self-center">
          <div className="text-5xl font-black tracking-tight mb-4">ARCHITECTURE</div>
          <Info {...{ name, program, faculty, school, year, tagline }} />
        </div>
        <div className="flex items-center justify-end">
          <Photo src={photoURL} className="w-[360px] h-[480px] border-4 border-black" />
        </div>
      </div>
    </A4>
  );
}

/* ===== 6) Science ===== */
export function TSci({ data }) {
  const { name, program, faculty, school, year, tagline, photoURL } = data || {};
  return (
    <A4>
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-cyan-50" />
      <div className="relative z-10 p-16 grid grid-cols-[1.05fr_.95fr] gap-10 h-full">
        <div className="self-center">
          <div className="text-4xl font-black text-teal-700 mb-2">SCIENCE PORTFOLIO</div>
          <Info {...{ name, program, faculty, school, year, tagline }} />
        </div>
        <div className="flex items-center justify-end">
          <Photo src={photoURL} className="w-[360px] h-[460px]" />
        </div>
      </div>
    </A4>
  );
}

/* ===== 7) Media & Design ===== */
export function TDesign({ data }) {
  const { name, program, faculty, school, year, tagline, photoURL } = data || {};
  return (
    <A4>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-fuchsia-600 to-pink-500" />
      <div className="absolute inset-6 bg-white/10 rounded-[28px] backdrop-blur-sm border border-white/30" />
      <div className="relative z-10 p-16 grid grid-cols-[.9fr_1.1fr] gap-10 h-full text-white">
        <div className="flex items-center">
          <Photo src={photoURL} className="w-[360px] h-[460px] border-4 border-white/80" />
        </div>
        <div className="self-center">
          <div className="text-5xl font-black">MEDIA / DESIGN</div>
          <div className="mt-4"><Info {...{ name, program, faculty, school, year, tagline }} /></div>
        </div>
      </div>
    </A4>
  );
}

/* ---------- ตัวรวม/สวิตช์เทมเพลต ---------- */
const registry = { eng: TEng, med: TMed, biz: TBiz, arts: TArts, arch: TArch, sci: TSci, design: TDesign };

export default function FacultyCover({ variant = "eng", data = {} }) {
  const Cmp = registry[variant] || TEng;
  return <Cmp data={data} />;
}
