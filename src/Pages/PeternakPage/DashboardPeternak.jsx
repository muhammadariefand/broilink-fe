import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Thermometer, Droplet, Wind, Home, Bell } from "lucide-react";
import peternakService from '../../services/peternakService';
import { handleError } from '../../utils/errorHandler';
import axios from 'axios'; // <--- TAMBAHAN: Kita pakai axios langsung buat fitur ini

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function DashboardPeternak() {
  const [selectedData1, setSelectedData1] = useState('pakan');
  const [selectedData2, setSelectedData2] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [farmName, setFarmName] = useState('');
  const [sensorData, setSensorData] = useState({ suhu: 0, kelembapan: 0, amonia: 0, statusKandang: 'Normal' });
  const [chartData, setChartData] = useState({
    pakan: { labels: [], data: [], color: '#F59E0B', unit: 'Kg' },
    minum: { labels: [], data: [], color: '#06B6D4', unit: 'Liter' },
    bobot: { labels: [], data: [], color: '#10B981', unit: 'Gram' },
    kematian: { labels: [], data: [], color: '#EF4444', unit: 'Ekor' }
  });

  // --- FUNGSI BARU: HUBUNGKAN TELEGRAM ---
  const connectTelegram = async () => {
    try {
      // Ambil token auth dari localStorage (sesuaikan jika kamu simpan dengan nama lain)
      const token = localStorage.getItem('token'); 

      // Panggil API Backend (Sesuaikan Base URL jika perlu, misal: http://localhost:8000/api/...)
      const response = await axios.get('http://localhost:8000/api/peternak/telegram-link', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Buka Link Telegram di Tab Baru
        window.open(response.data.url, '_blank');
      }
    } catch (error) {
      console.error("Gagal koneksi Telegram:", error);
      alert("Gagal mengambil link. Pastikan server nyala dan Anda sudah login.");
    }
  };
  // ---------------------------------------

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await peternakService.getDashboard();
      const data = response.data.data || response.data;

      if (data.current) {
        setSensorData({
          suhu: Math.round(data.current.temperature) || 0,
          kelembapan: Math.round(data.current.humidity) || 0,
          amonia: Math.round(data.current.ammonia) || 0,
          statusKandang: data.current.status || 'Normal'
        });
      }

      if (data.farm?.name) setFarmName(data.farm.name);

      if (data.summary) {
        const labels = data.summary.labels || [];
        setChartData({
          pakan: { labels, data: (data.summary.pakan || []).map(v => Math.round(v)), color: '#F59E0B', unit: 'Kg' },
          minum: { labels, data: (data.summary.minum || []).map(v => Math.round(v)), color: '#06B6D4', unit: 'Liter' },
          bobot: { labels, data: (data.summary.bobot || []).map(v => Math.round(v)), color: '#10B981', unit: 'Gram' },
          kematian: { labels, data: (data.summary.kematian || []).map(v => Math.round(v)), color: '#EF4444', unit: 'Ekor' }
        });
      }
      setLoading(false);
    } catch (error) {
      setApiError(handleError('DashboardPeternak', error));
      setLoading(false);
    }
  };

  const calcYMax = (data) => {
    const max = Math.max(...data, 1);
    if (max <= 10) return 10;
    if (max <= 50) return 50;
    if (max <= 100) return 100;
    if (max <= 500) return 500;
    if (max <= 1000) return 1000;
    return Math.ceil(max / 500) * 500;
  };

  const getChartConfig = () => {
    const datasets = [];
    const data1 = chartData[selectedData1];
    const yMax1 = calcYMax(data1.data);

    datasets.push({
      label: selectedData1.charAt(0).toUpperCase() + selectedData1.slice(1),
      data: data1.data,
      backgroundColor: data1.color,
      borderColor: data1.color,
      borderWidth: 2,
      type: 'bar',
      yAxisID: 'y',
      order: 2
    });

    let yMax2 = null;
    if (selectedData2) {
      const data2 = chartData[selectedData2];
      yMax2 = calcYMax(data2.data);
      datasets.push({
        label: selectedData2.charAt(0).toUpperCase() + selectedData2.slice(1),
        data: data2.data,
        backgroundColor: 'transparent',
        borderColor: data2.color,
        borderWidth: 2,
        type: 'line',
        yAxisID: 'y1',
        order: 1
      });
    }

    return {
      labels: data1.labels,
      datasets,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { grid: { display: false } },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 0,
            max: yMax1,
            title: { display: true, text: data1.unit },
            grid: { drawOnChartArea: false }
          },
          ...(selectedData2 && {
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              min: 0,
              max: yMax2,
              title: { display: true, text: chartData[selectedData2].unit },
              grid: { drawOnChartArea: false }
            }
          })
        },
        plugins: { legend: { position: 'top' } }
      }
    };
  };

  const config = getChartConfig();

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Peternak</h1>
      <p className="text-gray-600 text-sm mt-1 mb-8">Pusat visual pemantauan status dan tren operasional peternakan</p>

      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{apiError}</p>
        </div>
      )}

      {/* TOMBOL YANG SUDAH DIUPDATE */}
      <div className="flex justify-end mt-6">
        <button 
          onClick={connectTelegram}
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
        >
          <Bell size={20} />
          <span>Aktifkan Notifikasi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><Thermometer size={30} /></div>
            <div><span className="block text-sm text-gray-600">Suhu Aktual</span><span className="block text-2xl font-bold">{sensorData.suhu}°C</span></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Droplet size={30} /></div>
            <div><span className="block text-sm text-gray-600">Kelembapan Aktual</span><span className="block text-2xl font-bold">{sensorData.kelembapan}%</span></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Wind size={30} /></div>
            <div><span className="block text-sm text-gray-600">Kadar Amonia</span><span className="block text-2xl font-bold">{sensorData.amonia} ppm</span></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-black"><Home size={30} /></div>
            <div><span className="block text-sm text-gray-600">Status Kandang</span><span className="inline-block mt-1 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">{sensorData.statusKandang}</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Laporan (7 Hari Terakhir)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data 1 (Batang)</label>
            <select value={selectedData1} onChange={(e) => setSelectedData1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="pakan">Konsumsi Pakan</option>
              <option value="minum">Konsumsi Minum</option>
              <option value="bobot">Rata-rata Bobot</option>
              <option value="kematian">Jumlah Kematian</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data 2 (Garis)</label>
            <select value={selectedData2} onChange={(e) => setSelectedData2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Tidak Ada</option>
              <option value="pakan">Konsumsi Pakan</option>
              <option value="minum">Konsumsi Minum</option>
              <option value="bobot">Rata-rata Bobot</option>
              <option value="kematian">Jumlah Kematian</option>
            </select>
          </div>
        </div>
        <div className="h-80">
          <Line data={config} options={config.options} />
        </div>
        <p className="text-center text-gray-600 text-sm mt-2">Hari</p>
      </div>
    </div>
  );
}