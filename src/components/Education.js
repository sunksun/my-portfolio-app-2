// src/components/Education.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { GraduationCap, School, Award, Plus, Trash2, Edit3, Calendar, Star, BookOpen, ChevronRight, Save, X } from 'lucide-react';

export default function Education() {
  const { user } = useAuth();
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    institution: '', 
    degree: '', 
    gpa: '',
    period: '',
    major: '',
    activities: '',
    achievements: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) return;
    const fetchEducations = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'education'), 
          where('user_id', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        setEducations(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error fetching educations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEducations();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.institution.trim()) newErrors.institution = 'กรุณากรอกชื่อสถาบัน';
    if (!form.degree.trim()) newErrors.degree = 'กรุณากรอกวุฒิการศึกษา';
    if (!form.gpa.trim()) newErrors.gpa = 'กรุณากรอก GPA';
    else if (isNaN(form.gpa) || parseFloat(form.gpa) < 0 || parseFloat(form.gpa) > 4) {
      newErrors.gpa = 'GPA ต้องเป็นตัวเลข 0-4';
    }
    if (!form.period.trim()) newErrors.period = 'กรุณากรอกช่วงเวลาศึกษา';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    setSaving(true);
    try {
      const eduData = { 
        ...form, 
        user_id: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        // Update existing education
        const updateData = { ...form, updatedAt: serverTimestamp() };
        await updateDoc(doc(db, 'education', editingId), updateData);
        setEducations(educations.map(edu => 
          edu.id === editingId ? { ...edu, ...updateData } : edu
        ));
      } else {
        // Add new education
        const docRef = await addDoc(collection(db, 'education'), eduData);
        setEducations([{ ...eduData, id: docRef.id }, ...educations]);
      }

      // Reset form
      setForm({ 
        institution: '', 
        degree: '', 
        gpa: '',
        period: '',
        major: '',
        activities: '',
        achievements: ''
      });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving education:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (education) => {
    setForm({
      institution: education.institution || '',
      degree: education.degree || '',
      gpa: education.gpa || '',
      period: education.period || '',
      major: education.major || '',
      activities: education.activities || '',
      achievements: education.achievements || ''
    });
    setEditingId(education.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลการศึกษานี้?')) return;
    
    try {
      await deleteDoc(doc(db, 'education', id));
      setEducations(educations.filter(edu => edu.id !== id));
    } catch (error) {
      console.error('Error deleting education:', error);
    }
  };

  const cancelForm = () => {
    setForm({ 
      institution: '', 
      degree: '', 
      gpa: '',
      period: '',
      major: '',
      activities: '',
      achievements: ''
    });
    setShowForm(false);
    setEditingId(null);
    setErrors({});
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">กรุณาเข้าสู่ระบบก่อนใช้งาน</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">ประวัติการศึกษา</h1>
            <p className="mt-2 text-xl text-blue-100">จัดการข้อมูลการศึกษาและผลการเรียนของคุณ</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Add New Education Button */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            เพิ่มข้อมูลการศึกษา
          </button>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-emerald-600" />
                    {editingId ? 'แก้ไขข้อมูลการศึกษา' : 'เพิ่มข้อมูลการศึกษา'}
                  </h2>
                  <button
                    onClick={cancelForm}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Institution */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อสถาบันการศึกษา *
                    </label>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="institution"
                        value={form.institution}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                          errors.institution ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'
                        }`}
                        placeholder="เช่น มหาวิทยาลัยเชียงใหม่, โรงเรียนสาธิตจุฬา"
                      />
                    </div>
                    {errors.institution && <p className="mt-1 text-sm text-red-600">{errors.institution}</p>}
                  </div>

                  {/* Degree */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วุฒิการศึกษา *
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="degree"
                        value={form.degree}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                          errors.degree ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'
                        }`}
                        placeholder="เช่น ปริญญาตรี, มัธยมศึกษาตอนปลาย"
                      />
                    </div>
                    {errors.degree && <p className="mt-1 text-sm text-red-600">{errors.degree}</p>}
                  </div>

                  {/* GPA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เกรดเฉลี่ย (GPA) *
                    </label>
                    <div className="relative">
                      <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        name="gpa"
                        value={form.gpa}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        max="4"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                          errors.gpa ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'
                        }`}
                        placeholder="เช่น 3.75"
                      />
                    </div>
                    {errors.gpa && <p className="mt-1 text-sm text-red-600">{errors.gpa}</p>}
                  </div>

                  {/* Period */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ช่วงเวลาศึกษา *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="period"
                        value={form.period}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                          errors.period ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'
                        }`}
                        placeholder="เช่น 2018-2022, 2020-ปัจจุบัน"
                      />
                    </div>
                    {errors.period && <p className="mt-1 text-sm text-red-600">{errors.period}</p>}
                  </div>

                  {/* Major */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      สาขาวิชา/แผนการเรียน
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="major"
                        value={form.major}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="เช่น วิศวกรรมคอมพิวเตอร์, วิทย์-คณิต"
                      />
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      กิจกรรมและงานที่เข้าร่วม
                    </label>
                    <textarea
                      name="activities"
                      value={form.activities}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                      placeholder="เช่น ประธานนักเรียน, สมาชิกชมรมคอมพิวเตอร์, เข้าร่วมการแข่งขันโอลิมปิก"
                    />
                  </div>

                  {/* Achievements */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รางวัลและความสำเร็จ
                    </label>
                    <textarea
                      name="achievements"
                      value={form.achievements}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                      placeholder="เช่น เกียรตินิยมอันดับ 1, รางวัลชนะเลิศการแข่งขันเทคโนโลยี"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        บันทึกข้อมูล...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editingId ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Education List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : educations.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto h-20 w-20 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีข้อมูลการศึกษา</h3>
              <p className="text-gray-500 mb-6">เริ่มต้นโดยการเพิ่มข้อมูลการศึกษาของคุณ</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                เพิ่มข้อมูลการศึกษาแรก
              </button>
            </div>
          ) : (
            educations.map((education) => (
              <div key={education.id} className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-emerald-50 p-3 flex-shrink-0">
                      <GraduationCap className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{education.institution}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {education.degree}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          GPA: {education.gpa}
                        </span>
                        {education.period && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {education.period}
                          </span>
                        )}
                      </div>
                      
                      {education.major && (
                        <div className="mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {education.major}
                          </span>
                        </div>
                      )}

                      {education.activities && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">กิจกรรมที่เข้าร่วม:</h4>
                          <p className="text-sm text-gray-600">{education.activities}</p>
                        </div>
                      )}

                      {education.achievements && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">รางวัลและความสำเร็จ:</h4>
                          <p className="text-sm text-gray-600">{education.achievements}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(education)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="แก้ไข"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(education.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Education Timeline Indicator */}
                <div className="mt-4 flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full w-full"></div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
