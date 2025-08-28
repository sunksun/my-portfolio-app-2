// src/components/Dashboard.js
import React from "react";
import { Link } from "react-router-dom";
import { User, GraduationCap, Briefcase, FileText, Settings, Sparkles, Target, Award } from "lucide-react";

export default function Dashboard() {
  const items = [
    { 
      to: "profile", 
      label: "จัดการโปรไฟล์", 
      description: "แก้ไขข้อมูลส่วนตัวและรูปโปรไฟล์",
      icon: User,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    { 
      to: "education", 
      label: "ประวัติการศึกษา", 
      description: "เพิ่มข้อมูลการศึกษาและผลการเรียน",
      icon: GraduationCap,
      color: "from-emerald-500 to-emerald-600", 
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    { 
      to: "works", 
      label: "ผลงาน/โครงงาน", 
      description: "จัดการและแสดงผลงานของคุณ",
      icon: Briefcase,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50", 
      textColor: "text-purple-600"
    },
    { 
      to: "builder", 
      label: "สร้างหน้าปกพอร์ต", 
      description: "ออกแบบและสร้าง Portfolio ของคุณ",
      icon: FileText,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    { 
      to: "/admin-dashboard", 
      label: "หน้าผู้ดูแลระบบ", 
      description: "จัดการระบบและผู้ใช้งาน",
      icon: Settings,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-12 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              ยินดีต้อนรับสู่ e-Portfolio
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-blue-100">
              จัดการข้อมูลส่วนตัว ผลงาน และสร้าง Portfolio ที่น่าประทับใจ
            </p>
            <div className="mt-8 flex justify-center gap-4 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>บริหารจัดการง่าย</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>ออกแบบสวยงาม</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>แชร์ได้ทันที</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
          <div className="h-64 w-64 rounded-full bg-white/5"></div>
        </div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3">
          <div className="h-48 w-48 rounded-full bg-white/5"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Quick Stats */}
          <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50">
              <div className="flex items-center">
                <div className="rounded-lg bg-blue-50 p-3">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">โปรไฟล์</p>
                  <p className="text-2xl font-semibold text-gray-900">พร้อมใช้</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50">
              <div className="flex items-center">
                <div className="rounded-lg bg-emerald-50 p-3">
                  <GraduationCap className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">การศึกษา</p>
                  <p className="text-2xl font-semibold text-gray-900">ครบถ้วน</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50">
              <div className="flex items-center">
                <div className="rounded-lg bg-purple-50 p-3">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">ผลงาน</p>
                  <p className="text-2xl font-semibold text-gray-900">3 ชิ้น</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200/50">
              <div className="flex items-center">
                <div className="rounded-lg bg-orange-50 p-3">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Portfolio</p>
                  <p className="text-2xl font-semibold text-gray-900">พร้อมใช้</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mb-12">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">เริ่มต้นใช้งาน</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                  >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}></div>
                    
                    {/* Icon */}
                    <div className={`mb-4 inline-flex rounded-xl ${item.bgColor} p-4`}>
                      <IconComponent className={`h-8 w-8 ${item.textColor}`} />
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-gray-800">
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700">
                      {item.description}
                    </p>

                    {/* Arrow icon */}
                    <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                      <span>เริ่มต้น</span>
                      <svg
                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 opacity-10 transition-opacity group-hover:opacity-20">
                      <IconComponent className="h-16 w-16 text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mb-12 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">พร้อมสร้าง Portfolio แล้วใช่มั้ย?</h2>
              <p className="mt-4 text-lg text-indigo-100">
                รวบรวมข้อมูลและผลงานของคุณให้เป็นรูปแบบที่สวยงาม
              </p>
              <Link
                to="builder"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-indigo-600 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
              >
                <FileText className="h-5 w-5" />
                สร้าง Portfolio เดี๋ยวนี้
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
