import React, { useState, useEffect } from 'react';
import ownerService from '../services/ownerService';
import { handleError } from '../utils/errorHandler';

const RequestModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('kandang');
  const [formData, setFormData] = useState({
    farmName: '',
    farmLocation: '',
    farmCapacity: '',
    peternakId: '',
    peternakName: '',
    peternakPhone: '',
    peternakEmail: ''
  });
  const [peternaks, setPeternaks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPeternaks, setLoadingPeternaks] = useState(false);

  useEffect(() => {
    fetchPeternaks();
  }, []);

  const fetchPeternaks = async () => {
    setLoadingPeternaks(true);
    try {
      const response = await ownerService.getPeternaks();
      const data = response.data.data || response.data || [];
      setPeternaks(data);
    } catch (error) {
      console.error('Failed to fetch peternaks:', error);
      setPeternaks([]);
    } finally {
      setLoadingPeternaks(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let requestData;

      if (activeTab === 'kandang') {
        // Get selected peternak name for display
        const selectedPeternak = peternaks.find(p => p.user_id === parseInt(formData.peternakId));
        
        requestData = {
          request_type: 'Tambah Kandang',
          request_content: JSON.stringify({
            type: 'tambah_kandang',
            nama_kandang: formData.farmName,
            lokasi_kandang: formData.farmLocation,
            kapasitas_kandang: formData.farmCapacity,
            peternak_id: formData.peternakId || null,
            peternak_name: selectedPeternak?.name || null
          })
        };
      } else {
        requestData = {
          request_type: 'Tambah Peternak',
          request_content: JSON.stringify({
            type: 'tambah_peternak',
            nama_lengkap: formData.peternakName,
            nomor_whatsapp: formData.peternakPhone,
            email: formData.peternakEmail
          })
        };
      }

      await ownerService.submitRequest(requestData);
      alert('Permintaan berhasil dikirim!');
      onClose();
    } catch (error) {
      const errorMessage = handleError('RequestModal submit', error);
      alert('Gagal mengirim permintaan: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      farmName: '',
      farmLocation: '',
      farmCapacity: '',
      peternakId: '',
      peternakName: '',
      peternakPhone: '',
      peternakEmail: ''
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-[420px] max-w-[90vw] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Ajuan Permintaan Owner</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleTabChange('kandang')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'kandang'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tambah Kandang
          </button>
          <button
            onClick={() => handleTabChange('peternak')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'peternak'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tambah Peternak
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'kandang' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kandang</label>
                <input
                  type="text"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  placeholder="Masukkan nama kandang"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi Kandang</label>
                <input
                  type="text"
                  value={formData.farmLocation}
                  onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                  placeholder="Masukkan lokasi kandang"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kapasitas Kandang</label>
                <input
                  type="number"
                  value={formData.farmCapacity}
                  onChange={(e) => setFormData({ ...formData, farmCapacity: e.target.value })}
                  placeholder="Masukkan kapasitas (ekor)"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Peternak yang mengurusi kandang</label>
                <div className="relative">
                  <select
                    value={formData.peternakId}
                    onChange={(e) => setFormData({ ...formData, peternakId: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none appearance-none bg-white"
                    required
                  >
                    <option value="">Pilih peternak</option>
                    {loadingPeternaks ? (
                      <option disabled>Memuat...</option>
                    ) : peternaks.length === 0 ? (
                      <option disabled>Belum ada peternak</option>
                    ) : (
                      peternaks.map((peternak) => (
                        <option key={peternak.user_id} value={peternak.user_id}>
                          {peternak.name}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {peternaks.length === 0 && !loadingPeternaks && (
                  <p className="text-xs text-gray-500 mt-1">
                    Belum ada peternak yang terdaftar. Ajukan permintaan tambah peternak terlebih dahulu.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap Peternak</label>
                <input
                  type="text"
                  value={formData.peternakName}
                  onChange={(e) => setFormData({ ...formData, peternakName: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={formData.peternakPhone}
                  onChange={(e) => setFormData({ ...formData, peternakPhone: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.peternakEmail}
                  onChange={(e) => setFormData({ ...formData, peternakEmail: e.target.value })}
                  placeholder="Contoh: peternak@email.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mengirim...' : 'Kirim Permintaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
