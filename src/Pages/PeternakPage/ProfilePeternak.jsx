import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import peternakService from '../../services/peternakService';

export default function ProfilePeternak() {
  const [profileData, setProfileData] = useState({ name: '', phone: '', email: '', profileImage: null });
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await peternakService.getProfile();
        const data = response.data?.data || response.data || {};
        setProfileData({
          name: data.user?.name || 'Peternak',
          phone: data.user?.phone_number || '',
          email: data.user?.email || '',
          profileImage: data.user?.profile_pic || null
        });
      } catch (error) {
        alert('Gagal memuat profil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showSuccessPopup = (msg) => {
    setSuccessMsg(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await peternakService.uploadPhoto(file);
        const photoUrl = response.data?.data?.profile_pic || null;
        setProfileData({ ...profileData, profileImage: photoUrl });
        showSuccessPopup('Foto profil berhasil diperbarui');
      } catch (error) {
        alert('Gagal mengunggah foto');
      }
    }
  };

  const handleSave = async () => {
    try {
      await peternakService.updateProfile({
        email: profileData.email,
        phone_number: profileData.phone
      });
      showSuccessPopup('Profil berhasil diperbarui');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menyimpan profil');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <span className="text-gray-800 font-medium">{successMsg}</span>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
      </div>
      
      <div className="flex justify-center">
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 w-full max-w-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 flex items-center justify-center overflow-hidden">
              {profileData.profileImage ? (
                <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
              Ubah Foto Profil
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
              <input type="text" value={profileData.name} disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nomor WhatsApp</label>
              <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan nomor WhatsApp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan email" />
            </div>
            <div className="flex justify-center pt-6">
              <button onClick={handleSave} className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">Simpan</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
