import React, { useState } from 'react';

const ProfileOwner = () => {
  const [profileData, setProfileData] = useState({
    nama: 'Ahmad Dhani',
    whatsapp: '+62 812-1234-9876',
    email: 'ahmadhani@gmail.com'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = () => {
    console.log('Upload photo');
    alert('Fitur upload foto akan diimplementasikan');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile updated:', profileData);
    alert('Profil berhasil disimpan!');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-3xl">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200">
          <div className="w-32 h-32 mb-4">
            <svg width="128" height="128" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="60" fill="#333"/>
              <circle cx="60" cy="45" r="20" fill="#fff"/>
              <path d="M25 95c0-19.33 15.67-35 35-35s35 15.67 35 35" fill="#fff"/>
            </svg>
          </div>
          <button
            onClick={handlePhotoUpload}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Ubah Foto Profile
          </button>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Lengkap */}
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap
            </label>
            <div className="relative">
              <input
                type="text"
                id="nama"
                name="nama"
                value={profileData.nama}
                onChange={handleChange}
                disabled
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 7h-1V5c0-2.76-2.24-5-5-5S4 2.24 4 5v2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM6 5c0-1.65 1.35-3 3-3s3 1.35 3 3v2H6V5zm4 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
              </span>
            </div>
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
              Nomor WhatsApp
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              value={profileData.whatsapp}
              onChange={handleChange}
              placeholder="+62 812-xxxx-xxxx"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileOwner;
