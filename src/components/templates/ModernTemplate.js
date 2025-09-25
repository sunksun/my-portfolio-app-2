import React from 'react';
import { User, GraduationCap, Briefcase, Sparkles } from 'lucide-react';

const ModernTemplate = ({ data, colorTheme, className = '' }) => {
  const { profile, educations = [], works = [], skills = [] } = data || {};

  // Generate gradient colors
  const gradientFrom = colorTheme;
  const gradientTo = adjustColor(colorTheme, 30);

  return (
    <div className={`bg-white ${className}`}>
      {/* Header Section - Modern Gradient */}
      <div 
        className="relative overflow-hidden rounded-t-2xl"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-8 py-12 text-white">
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
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">
                {profile?.name || profile?.fullName || 'ชื่อ-นามสกุล'}
              </h1>
              <p className="text-xl mb-4 text-white/90">
                {profile?.portfolioTitle || 'Portfolio ของฉัน'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/80">
                <div>📧 {profile?.email || 'email@example.com'}</div>
                {profile?.phone && <div>📞 {profile.phone}</div>}
                {profile?.address && <div>📍 {profile.address}</div>}
                {profile?.dateOfBirth && <div>🎂 {profile.dateOfBirth}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 space-y-8">
        {/* About Section */}
        {profile?.portfolioDesc && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: colorTheme }}>
              <User className="h-6 w-6" />
              เกี่ยวกับฉัน
            </h2>
            <p className="text-gray-700 leading-relaxed">{profile.portfolioDesc}</p>
          </div>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4" style={{ borderColor: colorTheme }}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: colorTheme }}>
              <Sparkles className="h-6 w-6" />
              ทักษะและความสามารถ
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {skills.map((skill, idx) => (
                <div 
                  key={idx} 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full px-4 py-2 text-center text-sm font-medium shadow-lg"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {educations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4" style={{ borderColor: colorTheme }}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: colorTheme }}>
              <GraduationCap className="h-6 w-6" />
              ประวัติการศึกษา
            </h2>
            <div className="grid gap-4">
              {educations.map(edu => (
                <div key={edu.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border-l-4" style={{ borderColor: colorTheme }}>
                  <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                  <p className="text-gray-600 mt-1">เกรดเฉลี่ย: {edu.gpa}</p>
                  <p className="text-gray-500 text-sm mt-1">ระยะเวลา: {edu.period}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Works Section */}
        {works.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4" style={{ borderColor: colorTheme }}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: colorTheme }}>
              <Briefcase className="h-6 w-6" />
              ผลงานและโครงการ
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {works.map(work => (
                <div key={work.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-l-4" style={{ borderColor: colorTheme }}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{work.title}</h3>
                  {work.description && (
                    <p className="text-gray-600 text-sm mb-3">{work.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: colorTheme }}
                    >
                      {work.category}
                    </span>
                    {work.uploaded_at && (
                      <span className="inline-block px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                        {work.uploaded_at?.toDate?.().toLocaleDateString?.('th-TH') || ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
function adjustColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

export default ModernTemplate;