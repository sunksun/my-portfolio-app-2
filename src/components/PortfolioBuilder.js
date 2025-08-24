import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function PortfolioBuilder() {
  // ...state, useEffect, function อื่น ๆ...
  
  const [profile, setProfile] = useState(null);
  const [educations, setEducations] = useState([]);
  const [works, setWorks] = useState([]);
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [template, setTemplate] = useState('default');
  const [previewMode, setPreviewMode] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState('Portfolio ของฉัน');
  const [portfolioDesc, setPortfolioDesc] = useState('รวมผลงานและประวัติการศึกษาของฉัน');
  const [colorTheme, setColorTheme] = useState('#2563eb');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [awards, setAwards] = useState([]);
  const [awardInput, setAwardInput] = useState('');
  const { currentUser } = useAuth();
  const db = getFirestore();
// ...existing code (ทั้งหมดที่เหลือ)...

  useEffect(() => {
    if (!currentUser) return;
    const fetchProfile = async () => {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    };
    fetchProfile();
  }, [currentUser, db]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchEducation = async () => {
      const q = query(
        collection(db, 'education'),
        where('user_id', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      setEducations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEducation();
  }, [currentUser, db]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchWorks = async () => {
      const q = query(
        collection(db, 'work'),
        where('user_id', '==', currentUser.uid),
        orderBy('uploaded_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      setWorks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // reset form fields if needed (optional)
    };
    fetchWorks();
  }, [currentUser, db]);

  const toggleSelect = (id) => {
    setSelectedWorks(selectedWorks.includes(id)
      ? selectedWorks.filter(wid => wid !== id)
      : [...selectedWorks, id]);
  };

  const handleTemplateChange = (e) => setTemplate(e.target.value);
  const handlePreview = () => setPreviewMode(true);
  const handleBack = () => setPreviewMode(false);
  const handleDownload = () => {
    const html = document.getElementById('portfolio-preview').outerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayWorks = selectedWorks.length > 0
    ? works.filter(w => selectedWorks.includes(w.id))
    : works;

  const renderPortfolio = () => (
    <div id="portfolio-preview" className={template === 'modern' ? 'bg-gradient-to-br from-pink-100 to-blue-100 p-8 rounded-xl' : ''}>
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold" style={{ color: colorTheme }}>{portfolioTitle}</h2>
        <div className="text-gray-600 mt-2">{portfolioDesc}</div>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        {profile?.photoURL && (
          <img src={profile.photoURL} alt="profile" className="w-28 h-28 rounded-full object-cover border-4" style={{ borderColor: colorTheme }} />
        )}
        <div>
          <div className="text-2xl font-bold" style={{ color: colorTheme }}>{profile?.fullName || 'ชื่อ-นามสกุล'}</div>
          <div className="text-gray-600">{profile?.email}</div>
          {profile?.phone && <div className="text-gray-500 text-sm">โทร: {profile.phone}</div>}
          {profile?.dob && <div className="text-gray-500 text-sm">วันเกิด: {profile.dob}</div>}
          {profile?.address && <div className="text-gray-500 text-sm">ที่อยู่: {profile.address}</div>}
          {profile?.goal && <div className="text-gray-500 text-sm mt-2">เป้าหมาย: {profile.goal}</div>}
        </div>
      </div>
      {skills.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold" style={{ color: colorTheme }}>ทักษะ</h3>
          <ul className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill, idx) => (
              <li key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{skill}</li>
            ))}
          </ul>
        </div>
      )}
      {awards.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold" style={{ color: colorTheme }}>รางวัล/ความสำเร็จ</h3>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            {awards.map((award, idx) => (
              <li key={idx} className="text-blue-700">{award}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-xl font-semibold" style={{ color: colorTheme }}>ประวัติการศึกษา</h3>
        {educations.length === 0 ? (
          <div className="text-gray-400">ไม่มีข้อมูลการศึกษา</div>
        ) : (
          <ul className="space-y-2">
            {educations.map(edu => (
              <li key={edu.id} className="bg-white rounded shadow p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold" style={{ color: colorTheme }}>{edu.degree}</div>
                  <div className="text-gray-600 text-sm">เกรดเฉลี่ย: {edu.gpa}</div>
                  <div className="text-gray-500 text-xs">ช่วงเวลา: {edu.period}</div>
                </div>
                <div className="text-gray-400 text-xs mt-2 md:mt-0">ID: {edu.education_id}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="text-xl font-semibold" style={{ color: colorTheme }}>ผลงาน</h3>
        {displayWorks.length === 0 ? (
          <div className="text-gray-400">ไม่มีผลงานที่เลือก</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayWorks.map(work => (
              <div key={work.id} className={template === 'modern' ? 'bg-white rounded-xl shadow p-4 border-l-4' : 'bg-white rounded shadow p-4'} style={template === 'modern' ? { borderColor: colorTheme, borderLeftWidth: 6 } : {}}>
                <div className="font-bold text-lg" style={{ color: colorTheme }}>{work.title}</div>
                <div className="text-gray-600 text-sm mb-2">หมวดหมู่: {work.category}</div>
                <div className="text-gray-500 text-xs mb-2">{work.description}</div>
                {work.file_path && (
                  <a href={work.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">ดูไฟล์/รูป</a>
                )}
                <div className="text-gray-400 text-xs mt-2">วันที่อัปโหลด: {work.uploaded_at?.toDate?.().toLocaleString?.() || ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );


  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
        <button onClick={handleBack} className="mb-4 px-4 py-2 bg-gray-400 text-white rounded">ย้อนกลับ</button>
        <button onClick={handleDownload} className="mb-4 px-4 py-2 bg-green-600 text-white rounded ml-2">ดาวน์โหลด Portfolio</button>
        {renderPortfolio()}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 flex flex-col md:flex-row gap-8">
      {/* ปุ่มย้อนกลับ */}
      <div className="mb-6 flex items-center">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          style={{ fontSize: '1rem' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          ย้อนกลับ
        </button>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-center mb-8">
          <div className="flex gap-2 text-sm">
            <span className="font-semibold text-blue-700">1. เลือกเทมเพลต</span>
            <span>&rarr;</span>
            <span className="font-semibold text-blue-700">2. ปรับแต่ง</span>
            <span>&rarr;</span>
            <span className="font-semibold text-blue-700">3. เลือกผลงาน</span>
            <span>&rarr;</span>
            <span className="font-semibold text-blue-700">4. ดูตัวอย่าง/ดาวน์โหลด</span>
          </div>
        </div>
        {/* ...form builder UI เดิม... */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <label className="font-semibold">ชื่อ Portfolio:</label>
            <input value={portfolioTitle} onChange={e => setPortfolioTitle(e.target.value)} className="border rounded px-2 py-1" />
            <label className="font-semibold">คำอธิบาย:</label>
            <input value={portfolioDesc} onChange={e => setPortfolioDesc(e.target.value)} className="border rounded px-2 py-1" />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <label className="font-semibold">เลือกเทมเพลต:</label>
            <select value={template} onChange={handleTemplateChange} className="border rounded px-2 py-1">
              <option value="default">Default</option>
              <option value="modern">Modern</option>
            </select>
            <label className="font-semibold">เลือกสีหลัก:</label>
            <input type="color" value={colorTheme} onChange={e => setColorTheme(e.target.value)} className="w-10 h-8 p-0 border-none" />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button onClick={handlePreview} className="px-4 py-2 bg-blue-600 text-white rounded mt-2">ดูตัวอย่าง Portfolio</button>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">ทักษะ (Skills):</label>
            <div className="flex gap-2 mt-1">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} className="border rounded px-2 py-1 flex-1" placeholder="เพิ่มทักษะ..." />
              <button type="button" onClick={() => { if(skillInput.trim()){ setSkills([...skills, skillInput.trim()]); setSkillInput(''); }}} className="px-3 py-1 bg-blue-500 text-white rounded">เพิ่ม</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{skill} <button type="button" onClick={() => setSkills(skills.filter((_, i) => i !== idx))} className="ml-1 text-red-500">×</button></span>
              ))}
            </div>
          </div>
          <div>
            <label className="font-semibold">รางวัล/ความสำเร็จ (Awards):</label>
            <div className="flex gap-2 mt-1">
              <input value={awardInput} onChange={e => setAwardInput(e.target.value)} className="border rounded px-2 py-1 flex-1" placeholder="เพิ่มรางวัล..." />
              <button type="button" onClick={() => { if(awardInput.trim()){ setAwards([...awards, awardInput.trim()]); setAwardInput(''); }}} className="px-3 py-1 bg-blue-500 text-white rounded">เพิ่ม</button>
            </div>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              {awards.map((award, idx) => (
                <li key={idx} className="text-blue-700 flex items-center">{award} <button type="button" onClick={() => setAwards(awards.filter((_, i) => i !== idx))} className="ml-2 text-red-500">×</button></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-2">เลือกผลงานที่จะแสดงใน Portfolio:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {works.map(work => (
              <label key={work.id} className="flex items-center gap-2 bg-white rounded shadow p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedWorks.includes(work.id)}
                  onChange={() => toggleSelect(work.id)}
                />
                <span className="font-bold text-blue-800">{work.title}</span>
                <span className="text-gray-500 text-xs">({work.category})</span>
              </label>
            ))}
          </div>
        </div>
        <div className="text-gray-500 text-xs text-center mt-8">
          <span>ขั้นตอน: เลือกเทมเพลต &gt; ปรับแต่ง &gt; เลือกผลงาน &gt; ดูตัวอย่าง &gt; ดาวน์โหลด Portfolio</span>
        </div>
      </div>
    </div>
  );
}
