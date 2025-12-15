import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import NavbarAdmin from '../../components/NavbarAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';
import './ManajemenKandang.css';

const ManajemenKandang = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [farmDetails, setFarmDetails] = useState(null);
  const [peternaks, setPeternaks] = useState([]);
  const [selectedPeternakId, setSelectedPeternakId] = useState('');
  const [farmArea, setFarmArea] = useState('');
  const [population, setPopulation] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchFarms();
  }, []);

  useEffect(() => {
    if (selectedFarmId) {
      fetchFarmDetails(selectedFarmId);
    }
  }, [selectedFarmId]);

  useEffect(() => {
    if (farmDetails?.owner_id) {
      fetchPeternaks(farmDetails.owner_id);
    }
  }, [farmDetails]);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getFarms();
      const farmsList = response.data?.data || response.data || [];
      setFarms(farmsList);
      if (farmsList.length > 0 && !selectedFarmId) {
        setSelectedFarmId(farmsList[0].farm_id);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
      showMessage('error', 'Gagal memuat data kandang');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmDetails = async (farmId) => {
    try {
      setLoading(true);
      const response = await apiService.admin.getFarmDetails(farmId);
      const details = response.data?.data || response.data;
      setFarmDetails(details);
      setFarmArea(details.farm_area || '');
      setPopulation(details.initial_population || '');
      setSelectedPeternakId(details.peternak_id || '');
    } catch (error) {
      console.error('Error fetching farm details:', error);
      showMessage('error', 'Gagal memuat detail kandang');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeternaks = async (ownerId) => {
    try {
      const response = await apiService.admin.getPeternaks(ownerId);
      const peternakList = response.data?.data || response.data || [];
      setPeternaks(peternakList);
    } catch (error) {
      console.error('Error fetching peternaks:', error);
    }
  };

  const handleAssignPeternak = async () => {
    if (!selectedPeternakId) {
      showMessage('error', 'Pilih peternak terlebih dahulu');
      return;
    }

    try {
      setSaving(true);
      await apiService.admin.assignPeternak(selectedFarmId, selectedPeternakId);
      showMessage('success', 'Peternak berhasil ditugaskan');
      fetchFarmDetails(selectedFarmId);
    } catch (error) {
      console.error('Error assigning peternak:', error);
      const errorMsg = error.message || 'Gagal menugaskan peternak';
      showMessage('error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateArea = async () => {
    if (!farmArea || farmArea < 1) {
      showMessage('error', 'Luas kandang minimal 1 m²');
      return;
    }

    try {
      setSaving(true);
      await apiService.admin.updateFarmArea(selectedFarmId, parseFloat(farmArea));
      showMessage('success', 'Luas kandang berhasil diperbarui');
      fetchFarmDetails(selectedFarmId);
    } catch (error) {
      console.error('Error updating area:', error);
      showMessage('error', 'Gagal memperbarui luas kandang');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePopulation = async () => {
    if (!population || population < 1) {
      showMessage('error', 'Jumlah ayam minimal 1 ekor');
      return;
    }

    try {
      setSaving(true);
      await apiService.admin.updateFarmPopulation(selectedFarmId, parseInt(population));
      showMessage('success', 'Jumlah ayam berhasil diperbarui');
      fetchFarmDetails(selectedFarmId);
    } catch (error) {
      console.error('Error updating population:', error);
      showMessage('error', 'Gagal memperbarui jumlah ayam');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (loading && !farmDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarAdmin />
        <SidebarAdmin />
        <main className="ml-48 pt-16 px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarAdmin />
      <SidebarAdmin />
      <main className="ml-48 pt-16">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Manajemen Kandang</h1>
            <p className="text-gray-600 text-sm">Kelola penugasan peternak dan detail kandang</p>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`alert alert-${message.type} p-4 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Kandang Selector */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Kandang
            </label>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">-- Pilih Kandang --</option>
              {farms.map((farm) => (
                <option key={farm.farm_id} value={farm.farm_id}>
                  {farm.farm_name} - Owner: {farm.owner}
                </option>
              ))}
            </select>
          </div>

          {/* Info Kandang (Read-only) */}
          {farmDetails && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kandang</h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Nama Kandang</label>
                  <p className="text-sm font-medium text-gray-900">{farmDetails.farm_name || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Pemilik</label>
                  <p className="text-sm font-medium text-gray-900">{farmDetails.owner_name || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Alamat</label>
                  <p className="text-sm font-medium text-gray-900">{farmDetails.location || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Assign Peternak Section */}
          {farmDetails && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Penugasan Peternak</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peternak
                  </label>
                  <select
                    value={selectedPeternakId}
                    onChange={(e) => setSelectedPeternakId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">-- Pilih Peternak --</option>
                    {peternaks.map((peternak) => (
                      <option 
                        key={peternak.user_id} 
                        value={peternak.user_id}
                        disabled={peternak.is_assigned && peternak.farm_id != selectedFarmId}
                      >
                        {peternak.name}
                        {peternak.is_assigned && peternak.farm_id != selectedFarmId 
                          ? ` (sudah di ${peternak.farm_name})` 
                          : ''}
                      </option>
                    ))}
                  </select>
                  {farmDetails.peternak_name && (
                    <p className="text-xs text-gray-500 mt-2">
                      Peternak saat ini: <span className="font-medium">{farmDetails.peternak_name}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={handleAssignPeternak}
                  disabled={saving || !selectedPeternakId}
                  className="px-6 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Penugasan'}
                </button>
              </div>
            </div>
          )}

          {/* Two Cards: Luas Kandang and Jumlah Ayam */}
          {farmDetails && (
            <div className="grid grid-cols-2 gap-6">
              {/* Card 1: Luas Kandang */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Luas Kandang</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={farmArea}
                      onChange={(e) => setFarmArea(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Masukkan luas kandang"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      m²
                    </span>
                  </div>
                  <button
                    onClick={handleUpdateArea}
                    disabled={saving || !farmArea}
                    className="w-full px-6 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Luas'}
                  </button>
                </div>
              </div>

              {/* Card 2: Jumlah Ayam */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Jumlah Ayam</h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-blue-800">
                      ℹ️ Untuk menambah ayam, input: jumlah sekarang + ayam baru
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={population}
                      onChange={(e) => setPopulation(e.target.value)}
                      className="w-full px-4 py-3 pr-16 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Masukkan jumlah ayam"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      ekor
                    </span>
                  </div>
                  <button
                    onClick={handleUpdatePopulation}
                    disabled={saving || !population}
                    className="w-full px-6 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Jumlah'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManajemenKandang;
