import React from 'react';
import { User, GraduationCap, Briefcase, Sparkles } from 'lucide-react';

const ClassicTemplate = ({ data, colorTheme, className = '' }) => {
  const { profile, educations = [], works = [], skills = [] } = data || {};

  return (
    <div className={`bg-white ${className}`}>
      {/* Header Section - Classic CV Style */}
      <div className="border-b-4 pb-6 mb-6" style={{ borderColor: colorTheme }}>
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {profile?.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt="profile" 
                className="w-32 h-32 object-cover border-4 border-gray-300 shadow-lg" 
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Personal Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profile?.name || profile?.fullName || 'ชื่อ-นามสกุล'}
            </h1>
            <div className="text-lg mb-4" style={{ color: colorTheme }}>
              {profile?.portfolioTitle || 'Portfolio ของฉัน'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div>📧 {profile?.email || 'email@example.com'}</div>
              {profile?.phone && <div>📞 {profile.phone}</div>}
              {profile?.address && <div>📍 {profile.address}</div>}
              {profile?.dateOfBirth && <div>🎂 {profile.dateOfBirth}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Skills Section */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3 pb-2 border-b-2 flex items-center gap-2" style={{ borderColor: colorTheme, color: colorTheme }}>
                <Sparkles className="h-5 w-5" />
                ทักษะและความสามารถ
              </h2>
              <div className="space-y-2">
                {skills.map((skill, idx) => (
                  <div key={`skill-${idx}-${skill}`} className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: colorTheme }}></div>
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          {profile?.portfolioDesc && (
            <section>
              <h2 className="text-xl font-bold mb-3 pb-2 border-b-2 flex items-center gap-2" style={{ borderColor: colorTheme, color: colorTheme }}>
                <User className="h-5 w-5" />
                เกี่ยวกับฉัน
              </h2>
              <p className="text-gray-700 leading-relaxed">{profile.portfolioDesc}</p>
            </section>
          )}

          {/* Education Section */}
          {educations.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3 pb-2 border-b-2 flex items-center gap-2" style={{ borderColor: colorTheme, color: colorTheme }}>
                <GraduationCap className="h-5 w-5" />
                ประวัติการศึกษา
              </h2>
              <div className="space-y-4">
                {educations.map(edu => (
                  <div key={edu.id} className="border-l-4 pl-4" style={{ borderColor: colorTheme }}>
                    <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                    <p className="text-gray-600">เกรดเฉลี่ย: {edu.gpa}</p>
                    <p className="text-gray-500 text-sm">ระยะเวลา: {edu.period}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Works Section */}
          {works.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3 pb-2 border-b-2 flex items-center gap-2" style={{ borderColor: colorTheme, color: colorTheme }}>
                <Briefcase className="h-5 w-5" />
                ผลงานและโครงการ
              </h2>
              <div className="space-y-4">
                {works.map(work => (
                  <div key={work.id} className="border-l-4 pl-4" style={{ borderColor: colorTheme }}>
                    <h3 className="font-semibold text-gray-800">{work.title}</h3>
                    {work.description && (
                      <p className="text-gray-600 text-sm mt-1">{work.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                      <span>หมวดหมู่: {work.category}</span>
                      {work.uploaded_at && (
                        <span>วันที่: {work.uploaded_at?.toDate?.().toLocaleDateString?.('th-TH') || ''}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassicTemplate;