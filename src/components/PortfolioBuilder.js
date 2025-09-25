import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Palette, Eye, Download, Plus, X, Settings, Sparkles, User, Award, GraduationCap, Briefcase, CheckSquare, Square, ArrowLeft, ArrowRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import TemplateRenderer from './templates/TemplateRenderer';
import { fetchActiveTemplates, prepareTemplateData } from '../services/TemplateService';

export default function PortfolioBuilder() {
  const [profile, setProfile] = useState(null);
  const [educations, setEducations] = useState([]);
  const [works, setWorks] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState('Portfolio ของฉัน');
  const [portfolioDesc, setPortfolioDesc] = useState('รวมผลงานและประวัติการศึกษาของฉัน');
  const [colorTheme, setColorTheme] = useState('#2563eb');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const { user: currentUser } = useAuth();
  const db = getFirestore();

  // ฟังก์ชันโหลด templates จาก Firebase
  const loadTemplates = React.useCallback(async () => {
    try {
      const templates = await fetchActiveTemplates();
      setAvailableTemplates(templates);
      if (templates.length > 0 && !selectedTemplate) {
        setSelectedTemplate(templates[0]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }, [selectedTemplate]);

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
    loadTemplates();
  }, [currentUser, db, loadTemplates]);



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

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    if (template.color) {
      setColorTheme(template.color);
    }
  };
  const handlePreview = () => setPreviewMode(true);
  const handleBack = () => setPreviewMode(false);
  
  // Download as HTML
  const handleDownloadHTML = () => {
    const html = document.getElementById('portfolio-preview').outerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download as PNG
  const handleDownloadPNG = async () => {
    const element = document.getElementById('portfolio-preview');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-${new Date().toISOString().split('T')[0]}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PNG');
    }
  };

  const displayWorks = works;

  // เตรียมข้อมูลสำหรับ template
  const templateData = prepareTemplateData(profile, educations, works, skills);

  const renderPortfolio = () => {
    if (!selectedTemplate) {
      return <div className="p-8 text-center text-gray-500">กรุณาเลือก Template</div>;
    }

    return (
      <TemplateRenderer 
        template={selectedTemplate}
        data={templateData}
        colorTheme={colorTheme}
      />
    );
  };


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
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadHTML}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <Download className="h-4 w-4" />
                  HTML
                </button>
                <button
                  onClick={handleDownloadPNG}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด PNG
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div id="portfolio-preview">
                {renderPortfolio()}
              </div>
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
                {availableTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-lg ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-32 rounded-lg mb-4 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <div className="transform scale-[0.15] origin-top-left w-[400px] h-[300px]">
                        <TemplateRenderer 
                          template={template}
                          data={{
                            profile: { name: 'ตัวอย่าง', portfolioTitle: template.name },
                            educations: [{ degree: 'ปริญญาตรี', gpa: '3.50' }],
                            works: [{ title: 'โครงการตัวอย่าง', category: 'โครงการ' }],
                            skills: ['Skill 1', 'Skill 2']
                          }}
                          colorTheme={template.color}
                        />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.desc || 'Template สำหรับสร้าง Portfolio'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300" 
                        style={{ backgroundColor: template.color }}
                      ></div>
                      <span className="text-xs text-gray-500">{template.type}</span>
                    </div>
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
                    <div>เทมเพลต: {selectedTemplate?.name || 'ไม่ได้เลือก'}</div>
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
              <div className="flex gap-3">
                <button
                  onClick={handlePreview}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  ดูตัวอย่าง
                </button>
                <button
                  onClick={handleDownloadPNG}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700"
                >
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด PNG
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
