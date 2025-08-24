import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function Announcement() {
  const [announcements, setAnnouncements] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setAnnouncements(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchAnnouncements();
  }, [db]);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">ประกาศ/ข่าวสาร</h2>
      {announcements.length === 0 ? (
        <div className="text-gray-400">ไม่มีประกาศ</div>
      ) : (
        <ul className="space-y-4">
          {announcements.map(a => (
            <li key={a.id} className="bg-white rounded shadow p-4">
              <div className="font-semibold text-lg text-blue-800">{a.title}</div>
              <div className="text-gray-600 mt-1">{a.content}</div>
              <div className="text-gray-400 text-xs mt-2">{a.createdAt?.toDate?.().toLocaleString?.() || ''}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
