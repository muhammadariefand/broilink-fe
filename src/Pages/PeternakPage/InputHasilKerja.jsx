import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import peternakService from '../../services/peternakService';

export default function InputHasilKerja() {
  const [formData, setFormData] = useState({ pakan: '', minum: '', bobot: '', kematian: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await peternakService.submitReport({
        report_date: new Date().toISOString().split('T')[0],
        konsumsi_pakan: Math.round(parseFloat(formData.pakan)),
        konsumsi_air: Math.round(parseFloat(formData.minum)),
        rata_rata_bobot: Math.round(parseFloat(formData.bobot)),
        jumlah_kematian: Math.round(parseInt(formData.kematian))
      });

      setShowSuccess(true);
      setFormData({ pakan: '', minum: '', bobot: '', kematian: '' });
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal menyimpan data';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });

  return (
    <div className="space-y-6 p-4">
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <span className="text-gray-800 font-medium">Laporan Berhasil Terkirim</span>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Input Hasil Kerja</h1>
      <p className="text-gray-600 text-sm mt-1 mb-8">Laporkan aktivitas harian Anda</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Pakan Harian</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pakan (kg)</label>
            <input type="number" step="1" value={formData.pakan} onChange={(e) => handleChange('pakan', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Masukkan jumlah pakan" required />
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Minum Harian</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Minum (liter)</label>
            <input type="number" step="1" value={formData.minum} onChange={(e) => handleChange('minum', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Masukkan jumlah minum" required />
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Laporan Sampling Bobot</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bobot Rata-rata (gram/ekor)</label>
            <input type="number" step="1" value={formData.bobot} onChange={(e) => handleChange('bobot', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Masukkan bobot rata-rata" required />
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tingkat Kematian</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah (ekor)</label>
            <input type="number" step="1" value={formData.kematian} onChange={(e) => handleChange('kematian', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Masukkan jumlah kematian" required />
          </div>
        </div>

        <div className="flex justify-center">
          <button type="submit" disabled={isSubmitting}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50">
            {isSubmitting ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </form>
    </div>
  );
}
