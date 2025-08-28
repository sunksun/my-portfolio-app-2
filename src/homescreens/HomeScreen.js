import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, User, FileText, Briefcase, Star } from 'lucide-react';

export default function HomeScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Portfolio Builder</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                เริ่มต้นใช้งาน
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              สร้าง
              <span className="text-blue-600 mx-2">Portfolio</span>
              ที่โดดเด่น
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              เครื่องมือสำหรับสร้างและจัดการ Portfolio ออนไลน์ที่ช่วยให้คุณแสดงผลงานและประสบการณ์ได้อย่างมืออาชีพ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                เริ่มสร้าง Portfolio
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                ดูตัวอย่าง
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ฟีเจอร์ที่จะทำให้ Portfolio ของคุณโดดเด่น
            </h2>
            <p className="text-lg text-gray-600">
              เครื่องมือครบครันสำหรับการสร้าง Portfolio ที่มืออาชีพ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">จัดการโปรไฟล์</h3>
              <p className="text-gray-600">
                สร้างและแก้ไขข้อมูลส่วนตัว ประสบการณ์การทำงาน และการศึกษา
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Template ที่สวยงาม</h3>
              <p className="text-gray-600">
                เลือกจากเทมเพลตที่ออกแบบมาอย่างมืออาชีพ หรือปรับแต่งตามต้องการ
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">แสดงผลงาน</h3>
              <p className="text-gray-600">
                อัปโหลดและจัดระเบียบผลงานของคุณให้ดูเป็นระบบและน่าสนใจ
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">แชร์ง่าย</h3>
              <p className="text-gray-600">
                แชร์ Portfolio ของคุณผ่าน URL เดียว เข้าถึงได้จากทุกอุปกรณ์
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            พร้อมที่จะสร้าง Portfolio ที่โดดเด่นแล้วหรือยัง?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            เริ่มต้นสร้าง Portfolio ของคุณวันนี้ และแสดงให้โลกเห็นถึงความสามารถของคุณ
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            เริ่มต้นฟรี
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Builder</h3>
            <p className="text-gray-600">
              เครื่องมือสำหรับสร้าง Portfolio ที่มืออาชีพและโดดเด่น
            </p>
            <div className="mt-4 text-sm text-gray-500">
              © 2024 Portfolio Builder. สงวนลิขสิทธิ์.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}