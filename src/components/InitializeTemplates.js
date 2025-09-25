import React, { useState } from 'react';
import { seedTemplates, initializeTemplates } from '../utils/seedTemplates';
import { Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function InitializeTemplates() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('ready');
  const [message, setMessage] = useState('');

  const handleInitialize = async () => {
    setLoading(true);
    setStatus('loading');
    setMessage('กำลังตรวจสอบและเพิ่มข้อมูล Templates...');

    try {
      const success = await initializeTemplates();
      if (success) {
        setStatus('success');
        setMessage('เพิ่มข้อมูล Templates สำเร็จ! ตอนนี้สามารถใช้งานระบบ Template ได้แล้ว');
      } else {
        setStatus('error');
        setMessage('เกิดข้อผิดพลาดในการเพิ่มข้อมูล Templates');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForceReset = async () => {
    if (!window.confirm('คุณต้องการเพิ่มข้อมูล Templates ใหม่หรือไม่?')) return;

    setLoading(true);
    setStatus('loading');
    setMessage('กำลังเพิ่มข้อมูล Templates ใหม่...');

    try {
      const success = await seedTemplates();
      if (success) {
        setStatus('success');
        setMessage('เพิ่มข้อมูล Templates ใหม่สำเร็จ!');
      } else {
        setStatus('error');
        setMessage('เกิดข้อผิดพลาดในการเพิ่มข้อมูล Templates');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Initialize Templates</h1>
          <p className="text-gray-600">เพิ่มข้อมูล Templates ตัวอย่างลง Firestore</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && status === 'loading' ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            ตรวจสอบและเพิ่ม Templates
          </button>

          <button
            onClick={handleForceReset}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Database className="w-4 h-4" />
            เพิ่ม Templates ใหม่ (Force Reset)
          </button>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${
            status === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : status === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {status === 'success' && <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
            {status === 'error' && <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
            {status === 'loading' && <Loader className="w-5 h-5 mt-0.5 flex-shrink-0 animate-spin" />}
            <div className="text-sm">{message}</div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            หลังจากเพิ่ม Templates แล้ว สามารถกลับไปใช้งานระบบ Admin Dashboard ได้
          </p>
        </div>
      </div>
    </div>
  );
}