import React from 'react';
import { User, GraduationCap, Briefcase, Sparkles, Clock } from 'lucide-react';

const TimelineTemplate = ({ data, colorTheme, className = '' }) => {
  const { profile, educations = [], works = [], skills = [] } = data || {};

  // Combine and sort timeline items
  const timelineItems = [
    ...educations.map(item => ({ ...item, type: 'education', date: item.period })),
    ...works.map(item => ({ ...item, type: 'work', date: item.uploaded_at?.toDate?.().getFullYear?.() || new Date().getFullYear() }))
  ].sort((a, b) => {
    // Simple sorting - you might want to improve this based on your date format
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className={`bg-white ${className}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-t-2xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {profile?.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt="profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" 
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white flex items-center justify-center">
                <User className="h-16 w-16 text-white" />
              </div>
            )}
          </div>
          
          {/* Personal Info */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">
              {profile?.name || profile?.fullName || 'ชื่อ-นามสกุล'}
            </h1>
            <p className="text-lg mb-3 text-white/90">
              {profile?.portfolioTitle || 'Portfolio ของฉัน'}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              <div>📧 {profile?.email || 'email@example.com'}</div>
              {profile?.phone && <div>📞 {profile.phone}</div>}
              {profile?.address && <div>📍 {profile.address}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* About Section */}
        {profile?.portfolioDesc && (
          <div className="bg-green-50 rounded-xl p-6 border-l-4" style={{ borderColor: colorTheme }}>
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2" style={{ color: colorTheme }}>
              <User className="h-6 w-6" />
              เกี่ยวกับฉัน
            </h2>
            <p className="text-gray-700 leading-relaxed">{profile.portfolioDesc}</p>
          </div>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: colorTheme }}>
              <Sparkles className="h-6 w-6" />
              ทักษะและความสามารถ
            </h2>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, idx) => (
                <span 
                  key={idx}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border"
                  style={{ borderColor: colorTheme }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Section */}
        {timelineItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colorTheme }}>
              <Clock className="h-6 w-6" />
              เส้นทางการเรียนรู้และผลงาน
            </h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div 
                className="absolute left-8 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: colorTheme }}
              ></div>
              
              {/* Timeline Items */}
              <div className="space-y-8">
                {timelineItems.map((item, index) => (
                  <div key={`${item.type}-${item.id || index}`} className="relative flex items-start">
                    {/* Timeline Dot */}
                    <div 
                      className="flex-shrink-0 w-4 h-4 rounded-full border-4 border-white shadow-lg z-10"
                      style={{ backgroundColor: colorTheme }}
                    ></div>
                    
                    {/* Timeline Icon */}
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ml-4 text-white shadow-lg"
                      style={{ backgroundColor: item.type === 'education' ? '#059669' : '#7c3aed' }}
                    >
                      {item.type === 'education' ? (
                        <GraduationCap className="h-6 w-6" />
                      ) : (
                        <Briefcase className="h-6 w-6" />
                      )}
                    </div>
                    
                    {/* Timeline Content */}
                    <div className="flex-1 ml-6">
                      <div className="bg-gray-50 rounded-lg p-4 shadow-sm border-l-4" style={{ borderColor: colorTheme }}>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item.type === 'education' ? item.degree : item.title}
                          </h3>
                          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                            {item.date}
                          </span>
                        </div>
                        
                        {item.type === 'education' ? (
                          <div className="text-sm text-gray-600">
                            <p>เกรดเฉลี่ย: {item.gpa}</p>
                            <p>ระยะเวลา: {item.period}</p>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            {item.description && <p className="mb-2">{item.description}</p>}
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {item.category}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineTemplate;