// src/components/WorkManagement.js
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { uploadToCloudinary, createPreviewUrl } from '../utils/cloudinary';
import { 
  Briefcase, 
  Plus, 
  Upload, 
  Image, 
  Video, 
  File, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Calendar, 
  FolderOpen,
  ExternalLink,
  Grid,
  List,
  Search,
  Filter
} from 'lucide-react';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['image/jpeg','image/png','image/webp','video/mp4','video/webm','application/pdf'];

const CATEGORIES = [
  'การออกแบบ',
  'การพัฒนาเว็บไซต์', 
  'การพัฒนาแอปพลิเคชัน',
  'การถ่ายภาพ',
  'การทำวิดีโอ',
  'งานศิลปะ',
  'งานเขียน',
  'โครงการวิจัย',
  'การนำเสนอ',
  'อื่นๆ'
];

export default function WorkManagement() {
  const { user } = useAuth();
  const db = getFirestore();

  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [form, setForm] = useState({ 
    title: '', 
    category: '', 
    year: '',
    description: '', 
    tags: '',
    file: null,
    link: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchWorks();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Filter works based on search and category
    let filtered = works;
    
    if (searchTerm) {
      filtered = filtered.filter(work => 
        work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (work.tags && work.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    if (selectedCategory && selectedCategory !== '') {
      filtered = filtered.filter(work => work.category === selectedCategory);
    }
    
    setFilteredWorks(filtered);
  }, [works, searchTerm, selectedCategory]);

  const fetchWorks = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Try to get works with orderBy first
      let q = query(
        collection(db, 'work'), 
        where('user_id', '==', user.uid), 
        orderBy('uploaded_at', 'desc')
      );
      
      try {
        const snap = await getDocs(q);
        const worksData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setWorks(worksData);
        setError('');
      } catch (orderByError) {
        console.warn('OrderBy failed, trying without:', orderByError);
        
        // Fallback: query without orderBy if index doesn't exist
        q = query(
          collection(db, 'work'), 
          where('user_id', '==', user.uid)
        );
        
        const snap = await getDocs(q);
        const worksData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Sort client-side
        worksData.sort((a, b) => {
          const aTime = a.uploaded_at?.toDate?.() || new Date(0);
          const bTime = b.uploaded_at?.toDate?.() || new Date(0);
          return bTime - aTime;
        });
        
        setWorks(worksData);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching works:', err);
      setError(`เกิดข้อผิดพลาด: ${err.message || 'ไม่สามารถดึงข้อมูลได้'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setForm({ ...form, file: null });
      setPreviewFile(null);
      return;
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      setError('ไฟล์เกิน 20MB กรุณาเลือกไฟล์ที่เล็กกว่า');
      return;
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('ชนิดไฟล์ไม่ได้รับการรองรับ กรุณาเลือก JPG, PNG, WebP, MP4, WebM หรือ PDF');
      return;
    }

    setForm({ ...form, file });
    setError('');
    
    // Create preview for images and videos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      setPreviewFile(createPreviewUrl(file));
    } else {
      setPreviewFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล');
      return;
    }
    
    if (!form.title.trim()) {
      setError('กรุณากรอกชื่อผลงาน');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      let fileUrl = '';
      
      if (form.file) {
        try {
          fileUrl = await uploadToCloudinary(form.file);
        } catch (uploadErr) {
          console.warn('Cloudinary upload failed:', uploadErr);
          fileUrl = previewFile || '';
        }
      }

      const workData = {
        user_id: user.uid,
        title: form.title.trim(),
        category: form.category || 'อื่นๆ',
        year: form.year.trim(),
        description: form.description.trim(),
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        file_path: fileUrl,
        file_type: form.file?.type || '',
        file_size: form.file?.size || 0,
        link: form.link.trim(),
        uploaded_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, 'work', editingId), {
          ...workData,
          updated_at: serverTimestamp()
        });
        setSuccess('อัปเดตผลงานเรียบร้อยแล้ว!');
      } else {
        await addDoc(collection(db, 'work'), workData);
        setSuccess('เพิ่มผลงานเรียบร้อยแล้ว!');
      }

      // Reset form
      resetForm();
      fetchWorks();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving work:', err);
      setError(`เกิดข้อผิดพลาด: ${err.message} (${err.code || 'Unknown'})`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (work) => {
    setForm({
      title: work.title || '',
      category: work.category || '',
      year: work.year || '',
      description: work.description || '',
      tags: work.tags ? work.tags.join(', ') : '',
      file: null,
      link: work.link || ''
    });
    setEditingId(work.id);
    setPreviewFile(work.file_path || null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบผลงานนี้?')) return;
    
    try {
      await deleteDoc(doc(db, 'work', id));
      setWorks(works.filter(work => work.id !== id));
      setSuccess('ลบผลงานเรียบร้อยแล้ว!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting work:', err);
      setError('เกิดข้อผิดพลาดในการลบผลงาน');
    }
  };

  const resetForm = () => {
    setForm({ 
      title: '', 
      category: '', 
      year: '',
      description: '', 
      tags: '',
      file: null,
      link: ''
    });
    setShowForm(false);
    setEditingId(null);
    setPreviewFile(null);
    setError('');
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType?.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">กรุณาเข้าสู่ระบบก่อนใช้งาน</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">จัดการผลงาน</h1>
            <p className="mt-2 text-xl text-indigo-100">แสดงผลงานและโครงการของคุณ</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาผลงาน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none"
              >
                <option value="">ทุกหมวดหมู่</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-xl border border-gray-300 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Add Work Button */}
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            เพิ่มผลงานใหม่
          </button>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-indigo-600" />
                    {editingId ? 'แก้ไขผลงาน' : 'เพิ่มผลงานใหม่'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อผลงาน *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="ระบุชื่อผลงานของคุณ"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หมวดหมู่
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="">เลือกหมวดหมู่</option>
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ปี พ.ศ.
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="เช่น 2567"
                        maxLength="4"
                        pattern="[0-9]{4}"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      แท็ก
                    </label>
                    <input
                      type="text"
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="เช่น React, Design, JavaScript (คั่นด้วยจุลภาค)"
                    />
                  </div>

                  {/* Link */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ลิงก์ (GitHub, Demo, etc.)
                    </label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="url"
                        value={form.link}
                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="https://github.com/username/project"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      คำอธิบาย
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                      placeholder="อธิบายผลงานของคุณ..."
                    />
                  </div>

                  {/* File Upload */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ไฟล์ผลงาน
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,video/*,.pdf"
                        className="hidden"
                        id="work-file"
                      />
                      <label
                        htmlFor="work-file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          JPG, PNG, WebP, MP4, WebM, PDF (สูงสุด 20MB)
                        </span>
                      </label>
                    </div>

                    {/* File Preview */}
                    {previewFile && (
                      <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-3 mb-2">
                          {getFileIcon(form.file?.type)}
                          <span className="text-sm font-medium">
                            {form.file?.name || 'ไฟล์ที่มีอยู่'}
                          </span>
                          {form.file?.size && (
                            <span className="text-xs text-gray-500">
                              ({formatFileSize(form.file.size)})
                            </span>
                          )}
                        </div>
                        {form.file?.type?.startsWith('image/') && (
                          <img 
                            src={previewFile} 
                            alt="Preview" 
                            className="max-w-full h-32 object-cover rounded-lg" 
                          />
                        )}
                        {form.file?.type?.startsWith('video/') && (
                          <video 
                            src={previewFile} 
                            controls 
                            className="max-w-full h-32 rounded-lg" 
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        บันทึกข้อมูล...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editingId ? 'อัปเดตผลงาน' : 'บันทึกผลงาน'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Works List/Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredWorks.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-20 w-20 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {works.length === 0 ? 'ยังไม่มีผลงาน' : 'ไม่พบผลงานที่ค้นหา'}
              </h3>
              <p className="text-gray-500 mb-6">
                {works.length === 0 
                  ? 'เริ่มต้นโดยการเพิ่มผลงานแรกของคุณ' 
                  : 'ลองใช้คำค้นหาอื่น หรือเปลี่ยนหมวดหมู่'
                }
              </p>
              {works.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  เพิ่มผลงานแรก
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWorks.map((work) => (
                <div key={work.id} className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/50 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  {/* Work Image/Video */}
                  {work.file_path && (
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {work.file_type?.startsWith('image/') ? (
                        <img 
                          src={work.file_path} 
                          alt={work.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : work.file_type?.startsWith('video/') ? (
                        <video 
                          src={work.file_path} 
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <File className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Work Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {work.title}
                      </h3>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleEdit(work)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(work.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {work.category && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {work.category}
                        </span>
                      )}
                      {work.year && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          {work.year}
                        </span>
                      )}
                    </div>

                    {work.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {work.description}
                      </p>
                    )}

                    {work.tags && work.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {work.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {tag}
                          </span>
                        ))}
                        {work.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{work.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {work.uploaded_at?.toDate ? work.uploaded_at.toDate().toLocaleDateString('th-TH') : 'ไม่ทราบวันที่'}
                      </span>
                      {work.link && (
                        <a 
                          href={work.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          ดูลิงก์
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorks.map((work) => (
                <div key={work.id} className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-start gap-6">
                    {/* Thumbnail */}
                    {work.file_path && (
                      <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {work.file_type?.startsWith('image/') ? (
                          <img 
                            src={work.file_path} 
                            alt={work.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : work.file_type?.startsWith('video/') ? (
                          <video 
                            src={work.file_path} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <File className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {work.title}
                        </h3>
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            onClick={() => handleEdit(work)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="แก้ไข"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(work.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {work.category && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                            {work.category}
                          </span>
                        )}
                        {work.year && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            {work.year}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {work.uploaded_at?.toDate ? work.uploaded_at.toDate().toLocaleDateString('th-TH') : 'ไม่ทราบวันที่'}
                        </span>
                        {work.link && (
                          <a 
                            href={work.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            ดูลิงก์
                          </a>
                        )}
                      </div>

                      {work.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {work.description}
                        </p>
                      )}

                      {work.tags && work.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {work.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}