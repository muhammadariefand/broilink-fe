import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ownerService from '../../services/ownerService';
import { handleError } from '../../utils/errorHandler';
import RequestModal from '../../components/RequestModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('Mortalitas');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [farmData, setFarmData] = useState({ name: 'Kandang A', status: 'Normal', temp: '-' });
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([
    { time: '00:00', value: 0 }, { time: '04:00', value: 0 }, { time: '08:00', value: 0 },
    { time: '12:00', value: 0 }, { time: '16:00', value: 0 }, { time: '20:00', value: 0 }
  ]);

  const yAxisConfig = useMemo(() => {
    const maxValue = Math.max(...chartData.map(d => d.value), 1);
    let ceiling;
    if (maxValue <= 5) ceiling = 5;
    else if (maxValue <= 10) ceiling = 10;
    else if (maxValue <= 20) ceiling = 20;
    else if (maxValue <= 50) ceiling = 50;
    else if (maxValue <= 100) ceiling = 100;
    else if (maxValue <= 500) ceiling = 500;
    else if (maxValue <= 1000) ceiling = 1000;
    else ceiling = Math.ceil(maxValue / 500) * 500;
    return { max: ceiling, ticks: [ceiling, Math.round(ceiling * 0.75), Math.round(ceiling * 0.5), Math.round(ceiling * 0.25), 0] };
  }, [chartData]);

  const getUnit = () => ({ 'Mortalitas': 'Ekor', 'Bobot': 'Gram', 'Pakan': 'Kg', 'Minum': 'Liter' }[selectedFilter] || '');

  useEffect(() => { fetchDashboardData(); }, []);
  useEffect(() => { if (selectedFarmId) fetchChartData(selectedFarmId); }, [selectedFilter, selectedFarmId]);

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const response = await ownerService.getDashboard();
      const data = response.data.data || response.data;
      if (data.farms?.length > 0) {
        setFarms(data.farms);
        const farm = data.farms[0];
        if (!selectedFarmId) setSelectedFarmId(farm.farm_id);
        setFarmData({ name: farm.farm_name || 'Kandang', status: farm.status || 'normal', temp: farm.temperature ? `${Math.round(farm.temperature)}°C` : '-' });
        await fetchChartData(farm.farm_id);
      }
      if (data.activities?.length > 0) {
        setActivities(data.activities.map(a => ({
          time: a.time || '-', activity: a.type === 'sensor' ? 'Update Indikator' : 'Laporan Manual',
          detail: a.message || '-', status: a.type === 'sensor' ? 'Normal' : 'Info'
        })));
      }
    } catch (error) { setApiError(handleError('Dashboard', error)); }
    setIsLoadingData(false);
  };

  const fetchChartData = async (farmId) => {
    try {
      const filterMap = { 'Mortalitas': 'mortality', 'Bobot': 'avg_weight', 'Pakan': 'feed', 'Minum': 'water' };
      const field = filterMap[selectedFilter] || 'mortality';
      const response = await ownerService.getAnalytics(farmId, '1day');
      const data = response.data.data || response.data;
      if (data.labels && data[field]) {
        setChartData(data.labels.map((label, i) => ({ time: label, value: Math.round(parseFloat(data[field][i])) || 0 })));
      }
    } catch (e) { console.error(e); }
  };

  const getStatusColor = (s) => ({ 'normal': '#22C55E', 'waspada': '#FFD700', 'bahaya': '#EF4444' }[s.toLowerCase()] || '#9CA3AF');
  const getBarColor = () => ({ 'Mortalitas': 'bg-red-500', 'Bobot': 'bg-green-500', 'Pakan': 'bg-orange-500', 'Minum': 'bg-blue-500' }[selectedFilter] || 'bg-gray-500');
  const getBadgeClass = (s) => {
    const base = "inline-block px-3 py-1 rounded-full text-xs font-medium";
    return { 'normal': `${base} bg-green-500 text-white`, 'info': `${base} bg-blue-500 text-white`, 'waspada': `${base} bg-yellow-400 text-white`, 'bahaya': `${base} bg-red-500 text-white` }[s.toLowerCase()] || `${base} bg-gray-100 text-gray-800`;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {apiError && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{apiError}</div>}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Owner</h1>
          <p className="text-gray-600 text-sm mt-1">Pantau kondisi semua kandang dan aktivitas peternakan Anda</p>
        </div>
        <button onClick={() => setShowRequestModal(true)} className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-600">
          <span className="text-xl font-semibold">+</span> Pengajuan Permintaan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg text-center font-semibold text-gray-900 mb-4">Kondisi Kandang</h2>
          <div className="text-center py-4">
            <div className="w-20 h-20 mx-auto mb-4">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="40" fill={getStatusColor(farmData.status)} />
                <path d="M40 18 L60 58 L20 58 Z" fill="#fff" />
                <path d="M38 32 L42 32 L41.5 45 L38.5 45 Z" fill={getStatusColor(farmData.status)} />
                <circle cx="40" cy="50" r="2.5" fill={getStatusColor(farmData.status)} />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{farmData.name}</h3>
            <p className="text-xl font-semibold capitalize text-gray-500 mb-1">{farmData.status}</p>
            <p className="text-xl font-bold text-gray-500">{farmData.temp}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg text-center font-semibold text-gray-900 mb-3">Analisis Laporan (Terbaru)</h2>
          <div className="flex gap-2 mb-4">
            <select value={selectedFarmId || ''} onChange={(e) => setSelectedFarmId(Number(e.target.value))}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs">
              {farms.map(f => <option key={f.farm_id} value={f.farm_id}>{f.farm_name}</option>)}
            </select>
            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs">
              <option>Mortalitas</option><option>Bobot</option><option>Pakan</option><option>Minum</option>
            </select>
          </div>

          <div className="flex h-48">
            <div className="flex flex-col items-center justify-center pr-1">
              <span className="text-[10px] text-gray-600 transform -rotate-90 whitespace-nowrap">{getUnit()}</span>
            </div>
            <div className="flex flex-col justify-between text-[10px] text-gray-600 pr-1 py-1">
              {yAxisConfig.ticks.map((t, i) => <span key={i}>{t}</span>)}
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex items-end gap-1 border-l border-b border-gray-400 px-1">
                {chartData.map((d, i) => {
                  const h = yAxisConfig.max > 0 ? (d.value / yAxisConfig.max) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className={`w-full max-w-[32px] ${getBarColor()} rounded-t flex items-start justify-center pt-0.5`}
                        style={{ height: `${Math.max(h, d.value > 0 ? 8 : 2)}%`, minHeight: d.value > 0 ? '16px' : '4px' }}>
                        <span className="text-[8px] font-semibold text-white">{d.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-1 px-1 pt-1">
                {chartData.map((d, i) => <div key={i} className="flex-1 text-center text-[9px] text-gray-600">{d.time}</div>)}
              </div>
              <p className="text-center text-[10px] text-gray-600 mt-1">Jam</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg text-center font-semibold text-gray-900 mb-4">Aktivitas Peternakan</h2>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Waktu</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Aktivitas</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a, i) => (
              <tr key={i} className={`border-t border-gray-100 ${a.status === 'Info' ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50'}`}
                onClick={() => a.status === 'Info' && navigate('/owner/analytics')}>
                <td className="px-4 py-4 text-gray-600 text-sm">{a.time}</td>
                <td className="px-4 py-4"><span className="font-medium text-gray-900">{a.activity}</span><br /><span className="text-sm text-gray-600">{a.detail}</span></td>
                <td className="px-4 py-4"><span className={getBadgeClass(a.status)}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRequestModal && <RequestModal onClose={() => setShowRequestModal(false)} />}
    </div>
  );
};

export default Dashboard;
