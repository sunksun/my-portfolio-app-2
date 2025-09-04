import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Palette, Eye, Download, Plus, X, Settings, Sparkles, User, Award, GraduationCap, Briefcase, CheckSquare, Square, ArrowLeft, ArrowRight } from 'lucide-react';

export default function PortfolioBuilder() {
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
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const { user: currentUser } = useAuth();
  const db = getFirestore();

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const profileRef = doc(db, 'users', currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          setProfile(profileData);
          
          // Populate form fields with existing data
          if (profileData.portfolioTitle) setPortfolioTitle(profileData.portfolioTitle);
          if (profileData.portfolioDesc) setPortfolioDesc(profileData.portfolioDesc);
          if (profileData.colorTheme) setColorTheme(profileData.colorTheme);
          if (profileData.skills && Array.isArray(profileData.skills)) setSkills(profileData.skills);
          if (profileData.awards && Array.isArray(profileData.awards)) setAwards(profileData.awards);
        }

        // Fetch education
        const eduQuery = query(
          collection(db, 'education'),
          where('user_id', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const eduSnapshot = await getDocs(eduQuery);
        setEducations(eduSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch works
        const workQuery = query(
          collection(db, 'work'),
          where('user_id', '==', currentUser.uid),
          orderBy('uploaded_at', 'desc')
        );
        const workSnapshot = await getDocs(workQuery);
        setWorks(workSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser, db]);

  const toggleSelect = (id) => {
    setSelectedWorks(selectedWorks.includes(id)
      ? selectedWorks.filter(wid => wid !== id)
      : [...selectedWorks, id]);
  };

  // Save customization data to Firebase
  const saveCustomizationData = async () => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        portfolioTitle,
        portfolioDesc,
        colorTheme,
        skills,
        awards,
        updatedAt: new Date()
      };
      
      // Update existing document or create new one
      await setDoc(userRef, updateData, { merge: true });
      console.log('Portfolio customization saved successfully');
    } catch (error) {
      console.error('Error saving portfolio customization:', error);
    }
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


  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">กรุณาเข้าสู่ระบบก่อนใช้งาน</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Preview Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  ย้อนกลับ
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">ตัวอย่าง Portfolio</h1>
                  <p className="text-sm text-gray-500">{portfolioTitle}</p>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Download className="h-4 w-4" />
                ดาวน์โหลด Portfolio
              </button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {renderPortfolio()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, name: 'เลือกเทมเพลต', icon: Palette, desc: 'เลือกรูปแบบ Portfolio' },
    { id: 2, name: 'ปรับแต่งข้อมูล', icon: Settings, desc: 'กำหนดชื่อ สี และข้อมูลเพิ่มเติม' },
    { id: 3, name: 'เลือกผลงาน', icon: Briefcase, desc: 'เลือกผลงานที่จะแสดง' },
    { id: 4, name: 'ดูตัวอย่าง', icon: Eye, desc: 'ตรวจสอบและดาวน์โหลด' }
  ];

  const nextStep = async () => {
    if (currentStep === 2) {
      // Save customization data before moving to next step
      await saveCustomizationData();
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">สร้าง Portfolio</h1>
            <p className="mt-2 text-xl text-blue-100">ออกแบบและสร้าง Portfolio ที่สวยงาม</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.name}
                      </div>
                      <div className="text-xs text-gray-400 max-w-24">{step.desc}</div>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-colors ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/50 overflow-hidden">
          
          {/* Step 1: Template Selection */}
          {currentStep === 1 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Palette className="h-6 w-6 text-purple-600" />
                  เลือกเทมเพลต
                </h2>
                <p className="text-gray-600">เลือกรูปแบบ Portfolio ที่คุณชื่นชอบ</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: 'default', name: 'Classic', desc: 'เรียบง่าย เหมาะสำหรับทุกสาขา', preview: 'bg-white border-2' },
                  { id: 'modern', name: 'Modern', desc: 'ทันสมัย มีสีสัน เหมาะสำหรับครีเอทีฟ', preview: 'bg-gradient-to-br from-pink-100 to-blue-100' },
                  { id: 'professional', name: 'Professional', desc: 'เป็นทางการ เหมาะสำหรับบิซิเนส', preview: 'bg-gray-50 border-2 border-gray-300' }
                ].map((temp) => (
                  <div
                    key={temp.id}
                    onClick={() => setTemplate(temp.id)}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-lg ${
                      template === temp.id
                        ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-32 rounded-lg mb-4 ${temp.preview} flex items-center justify-center`}>
                      <div className="text-xs text-gray-500">{temp.name} Preview</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{temp.name}</h3>
                    <p className="text-sm text-gray-600">{temp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Customization */}
          {currentStep === 2 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Settings className="h-6 w-6 text-purple-600" />
                  ปรับแต่งข้อมูล
                </h2>
                <p className="text-gray-600">กำหนดชื่อ สี และข้อมูลเพิ่มเติมของ Portfolio</p>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* Portfolio Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ Portfolio</label>
                    <input
                      type="text"
                      value={portfolioTitle}
                      onChange={e => setPortfolioTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Portfolio ของฉัน"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                    <input
                      type="text"
                      value={portfolioDesc}
                      onChange={e => setPortfolioDesc(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="รวมผลงานและประวัติการศึกษาของฉัน"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">สีหลัก</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={colorTheme}
                        onChange={e => setColorTheme(e.target.value)}
                        className="w-16 h-16 rounded-xl border border-gray-300 cursor-pointer"
                      />
                      <div>
                        <div className="text-sm text-gray-600">เลือกสีหลักสำหรับ Portfolio</div>
                        <div className="text-xs text-gray-500 font-mono">{colorTheme}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills and Awards */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ทักษะ</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="เพิ่มทักษะ..."
                        onKeyDown={e => {
                          if (e.key === 'Enter' && skillInput.trim()) {
                            setSkills([...skills, skillInput.trim()]);
                            setSkillInput('');
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (skillInput.trim()) {
                            setSkills([...skills, skillInput.trim()]);
                            setSkillInput('');
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        เพิ่ม
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">รางวัล/ความสำเร็จ</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={awardInput}
                        onChange={e => setAwardInput(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="เพิ่มรางวัล..."
                        onKeyDown={e => {
                          if (e.key === 'Enter' && awardInput.trim()) {
                            setAwards([...awards, awardInput.trim()]);
                            setAwardInput('');
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (awardInput.trim()) {
                            setAwards([...awards, awardInput.trim()]);
                            setAwardInput('');
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        เพิ่ม
                      </button>
                    </div>
                    <div className="space-y-2">
                      {awards.map((award, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm">{award}</span>
                          <button
                            type="button"
                            onClick={() => setAwards(awards.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={saveCustomizationData}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  บันทึกการตั้งค่า
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Work Selection */}
          {currentStep === 3 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                  เลือกผลงาน
                </h2>
                <p className="text-gray-600">เลือกผลงานที่คุณต้องการแสดงใน Portfolio</p>
              </div>

              {works.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีผลงาน</h3>
                  <p className="text-gray-500 mb-4">กรุณาเพิ่มผลงานก่อนสร้าง Portfolio</p>
                  <button
                    onClick={() => window.location.href = '/dashboard/works'}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    เพิ่มผลงาน
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      เลือก {selectedWorks.length} จาก {works.length} ผลงาน
                    </div>
                    <button
                      onClick={() => setSelectedWorks(selectedWorks.length === works.length ? [] : works.map(w => w.id))}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {selectedWorks.length === works.length ? 'ยกเลิกการเลือกทั้งหมด' : 'เลือกทั้งหมด'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {works.map(work => (
                      <div
                        key={work.id}
                        onClick={() => toggleSelect(work.id)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                          selectedWorks.includes(work.id)
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {selectedWorks.includes(work.id) ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 mb-1">{work.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{work.category}</p>
                            {work.description && (
                              <p className="text-xs text-gray-500 line-clamp-2">{work.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 4 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Eye className="h-6 w-6 text-purple-600" />
                  ดูตัวอย่าง
                </h2>
                <p className="text-gray-600">ตรวจสอบ Portfolio ก่อนดาวน์โหลด</p>
              </div>

              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={handlePreview}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Eye className="h-5 w-5" />
                  ดูตัวอย่าง Portfolio
                </button>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">ข้อมูลพื้นฐาน</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>ชื่อ: {portfolioTitle}</div>
                    <div>เทมเพลต: {template}</div>
                    <div>สี: {colorTheme}</div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-medium text-gray-900">ทักษะและรางวัล</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>ทักษะ: {skills.length} รายการ</div>
                    <div>รางวัล: {awards.length} รายการ</div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium text-gray-900">ผลงาน</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>เลือก: {selectedWorks.length} ผลงาน</div>
                    <div>ทั้งหมด: {works.length} ผลงาน</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              ก่อนหน้า
            </button>

            <div className="flex items-center gap-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentStep >= step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                ถัดไป
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handlePreview}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700"
              >
                <Eye className="h-4 w-4" />
                ดูตัวอย่าง
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
