import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const BroilinkLogo = () => (
  <div className="flex items-center gap-2">
    <div className="grid grid-cols-2 gap-1">
      <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
      <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
      <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
      <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
    </div>
    <span className="text-xl font-bold text-gray-800">Broilink</span>
  </div>
);

const AccountIssues = () => {
  const navigate = useNavigate();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [problemType, setProblemType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedWhatsappNumber = whatsappNumber.trim();
    const trimmedEmail = email.trim();
    const trimmedProblemType = problemType.trim();

    // Validation
    if (!trimmedWhatsappNumber) {
      setError('Nomor WhatsApp harus diisi');
      return;
    }

    // Validate WhatsApp number format: must start with 08, 10-13 digits
    const phoneRegex = /^08[0-9]{8,11}$/;
    if (!phoneRegex.test(trimmedWhatsappNumber)) {
      setError('Nomor WhatsApp tidak valid. Format: 08xxxxxxxxxx (10-13 digit)');
      return;
    }

    if (!trimmedEmail) {
      setError('Email harus diisi');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Email tidak valid');
      return;
    }

    if (!trimmedProblemType) {
      setError('Jenis masalah harus dipilih');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.public.guestReport({
        whatsapp: trimmedWhatsappNumber,
        email: trimmedEmail,
        problem_type: trimmedProblemType
      });

      if (response.success) {
        setSuccess(response.message || 'Laporan berhasil terkirim. Admin akan menghubungi Anda segera.');

        // Reset form
        setWhatsappNumber('');
        setEmail('');
        setProblemType('');

        // Redirect back to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Gagal mengirim laporan. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('Guest report error:', err);
      setError('Masalah koneksi. Pastikan backend berjalan dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tindak Lanjut Permintaan Akun</h1>
          <p className="text-gray-500 mb-8">Masuk ke akun Broilink Anda</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* WhatsApp Number Field */}
            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                id="whatsappNumber"
                name="whatsappNumber"
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                autoComplete="tel"
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                autoComplete="email"
                placeholder="nama@example.com"
                required
              />
            </div>

            {/* Problem Type Dropdown */}
            <div>
              <label htmlFor="problemType" className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Masalah <span className="text-red-500">*</span>
              </label>
              <select
                id="problemType"
                name="problemType"
                value={problemType}
                onChange={(e) => setProblemType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              >
                <option value="">-- Pilih Jenis Masalah --</option>
                <option value="Menunggu Detail Login">Menunggu Detail Login</option>
                <option value="Masalah Data">Masalah Data</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Mengirim...' : 'Kirim'}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-sm text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700"
            >
              Kembali ke <span className="font-medium">Halaman Login</span>
            </button>
          </div>
        </div>

        {/* Right Side - Info */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-green-500 p-10 flex-col justify-between text-white">
          <div className="flex justify-end">
            <BroilinkLogo />
          </div>

          <div className="space-y-6">
            <p className="text-sm opacity-90 mb-8">
              Teknologi pintar untuk peternakan ayam broiler yang lebih efisien dan produktif
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm">Masalah Baru Diisi</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                <span className="text-sm">Antrian Users Dealer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm">Barang Katalog</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountIssues;
