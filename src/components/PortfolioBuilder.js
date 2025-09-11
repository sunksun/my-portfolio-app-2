import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Palette, Eye, Download, Plus, X, Settings, Sparkles, User, Award, GraduationCap, Briefcase, CheckSquare, Square, ArrowLeft, ArrowRight } from 'lucide-react';

export default function PortfolioBuilder() {
  const [profile, setProfile] = useState(null);
  const [educations, setEducations] = useState([]);
  const [works, setWorks] = useState([]);
  const [template, setTemplate] = useState('default');
  const [previewMode, setPreviewMode] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState('Portfolio ของฉัน');
  const [portfolioDesc, setPortfolioDesc] = useState('รวมผลงานและประวัติการศึกษาของฉัน');
  const [colorTheme, setColorTheme] = useState('#2563eb');
  const [skills, setSkills] = useState([]);
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
          
          // ดึงทักษะจาก profile data (ส่วนทักษะและความสามารถจากหน้า UserProfile)
          if (profileData.skills && Array.isArray(profileData.skills)) {
            setSkills(profileData.skills);
          } else if (profileData.portfolioSkills && Array.isArray(profileData.portfolioSkills)) {
            // fallback กรณีที่มีการเก็บทักษะแยกสำหรับ portfolio
            setSkills(profileData.portfolioSkills);
          }
          
          // awards จะดึงมาจาก works collection แทน
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


  // Save customization data to Firebase
  const saveCustomizationData = async () => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        portfolioTitle,
        portfolioDesc,
        colorTheme,
        portfolioSkills: skills, // เก็บทักษะ portfolio แยกจากทักษะหลัก
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

  const displayWorks = works;

  const renderPortfolio = () => (
    <div id="portfolio-preview" className="bg-white">
      {/* Header Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: colorTheme }}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                {profile?.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt="profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" 
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white flex items-center justify-center">
                    <User className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>
              
              {/* Personal Info */}
              <div className="text-center md:text-left text-white">
                <h1 className="text-4xl font-bold mb-2">{profile?.name || profile?.fullName || 'ชื่อ-นามสกุล'}</h1>
                <p className="text-xl mb-4 text-white/90">{portfolioTitle}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/80">
                  <div>📧 {profile?.email}</div>
                  {profile?.phone && <div>📞 {profile.phone}</div>}
                  {profile?.address && <div>📍 {profile.address}</div>}
                  {profile?.dateOfBirth && <div>🎂 {profile.dateOfBirth}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* About Section */}
        {portfolioDesc && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: colorTheme }}>
              <User className="h-6 w-6" />
              เกี่ยวกับฉัน
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{portfolioDesc}</p>
            </div>
          </section>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: colorTheme }}>
              <Sparkles className="h-6 w-6" />
              ทักษะและความสามารถ
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {skills.map((skill, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg px-4 py-3 text-center border-l-4" style={{ borderColor: colorTheme }}>
                  <span className="font-medium text-gray-800">{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {educations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: colorTheme }}>
              <GraduationCap className="h-6 w-6" />
              ประวัติการศึกษา
            </h2>
            <div className="space-y-4">
              {educations.map(edu => (
                <div key={edu.id} className="bg-gray-50 rounded-lg p-6 border-l-4" style={{ borderColor: colorTheme }}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                      <p className="text-gray-600 mt-1">เกรดเฉลี่ย: {edu.gpa}</p>
                      <p className="text-gray-500 text-sm mt-1">ระยะเวลา: {edu.period}</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className="inline-block px-3 py-1 bg-white rounded-full text-xs text-gray-500">
                        ID: {edu.education_id}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Awards Section */}
        {works.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: colorTheme }}>
              <Award className="h-6 w-6" />
              รางวัลและความสำเร็จ
            </h2>
            <div className="space-y-4">
              {works.map((work, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-6 border-l-4" style={{ borderColor: colorTheme }}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{work.title}</h3>
                  {work.description && (
                    <p className="text-gray-600 mb-2">{work.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span className="bg-white px-2 py-1 rounded">หมวดหมู่: {work.category}</span>
                    {work.uploaded_at && (
                      <span className="bg-white px-2 py-1 rounded">
                        วันที่: {work.uploaded_at?.toDate?.().toLocaleDateString?.('th-TH') || ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Works Portfolio Section */}
        {displayWorks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: colorTheme }}>
              <Briefcase className="h-6 w-6" />
              ผลงานและโครงการ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayWorks.map(work => (
                <div key={work.id} className="bg-gray-50 rounded-lg overflow-hidden border-l-4" style={{ borderColor: colorTheme }}>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{work.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{work.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-white px-3 py-1 rounded-full text-xs font-medium" style={{ color: colorTheme }}>
                        {work.category}
                      </span>
                    </div>
                    
                    {work.file_path && (
                      <a 
                        href={work.file_path} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: colorTheme }}
                      >
                        <Eye className="h-4 w-4" />
                        ดูผลงาน
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 px-8 py-6">
        <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
          <p>Portfolio สร้างเมื่อ {new Date().toLocaleDateString('th-TH')}</p>
        </div>
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
    { id: 3, name: 'ดูตัวอย่าง', icon: Eye, desc: 'ตรวจสอบและดาวน์โหลด' }
  ];

  const nextStep = async () => {
    if (currentStep === 2) {
      // Save customization data before moving to next step
      await saveCustomizationData();
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
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
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[80px]">
                      {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">ไม่มีข้อมูลทักษะ</p>
                          <p className="text-xs">กรุณาเพิ่มทักษะในหน้าโปรไฟล์ก่อน</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">รางวัล/ความสำเร็จ</label>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 min-h-[80px]">
                      {works.length > 0 ? (
                        <div className="space-y-3">
                          {works.map((work, idx) => (
                            <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200">
                              <h4 className="font-medium text-gray-900 text-sm">{work.title}</h4>
                              {work.description && (
                                <p className="text-xs text-gray-600 mt-1">{work.description}</p>
                              )}
                              <div className="text-xs text-gray-400 mt-2">
                                หมวดหมู่: {work.category}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">ไม่มีข้อมูลผลงาน</p>
                          <p className="text-xs">กรุณาเพิ่มผลงานก่อน</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {currentStep === 3 && (
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
                  onClick={saveCustomizationData}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  บันทึกการตั้งค่า
                </button>
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
                    <div>รางวัล: {works.length} รายการ</div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium text-gray-900">ผลงาน</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>ผลงานทั้งหมด: {works.length} รายการ</div>
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

            {currentStep < 3 ? (
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
