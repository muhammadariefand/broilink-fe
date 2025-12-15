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
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [farmData, setFarmData] = useState({
    name: 'Kandang A',
    status: 'Waspada',
    temp: '35°C'
  });

  const [activities, setActivities] = useState([
    { time: '18.30', activity: 'Update Indikator', detail: 'Kelembapan: 70%', status: 'Normal' },
    { time: '17.56', activity: 'Laporan Minum', detail: 'oleh Budi', status: 'Info' },
    { time: '12.45', activity: 'Laporan Pakan', detail: 'oleh Budi', status: 'Info' },
    { time: '08.00', activity: 'Update Indikator', detail: 'Suhu: 35°C', status: 'Waspada' },
    { time: '07.30', activity: 'Update Indikator', detail: 'Suhu: 35,1°C', status: 'Bahaya' }
  ]);

  // Chart data: 6 bars with 4h interval
  const [chartData, setChartData] = useState([
    { time: '00:00', value: 0 },
    { time: '04:00', value: 0 },
    { time: '08:00', value: 0 },
    { time: '12:00', value: 0 },
    { time: '16:00', value: 0 },
    { time: '20:00', value: 0 },
  ]);

  // Calculate dynamic Y-axis based on max value and parameter type
  const yAxisConfig = useMemo(() => {
    const maxValue = Math.max(...chartData.map(d => d.value), 0);
    const isMortalitas = selectedFilter === 'Mortalitas';
    
    // If all values are 0, use default ceiling
    if (maxValue === 0) {
      return { 
        max: isMortalitas ? 10 : 100, 
        ticks: isMortalitas ? [10, 8, 6, 4, 2, 0] : [100, 75, 50, 25, 0] 
      };
    }
    
    // Round up to nice number
    let ceiling;
    if (maxValue <= 5) ceiling = isMortalitas ? 5 : 10;
    else if (maxValue <= 10) ceiling = 10;
    else if (maxValue <= 20) ceiling = 20;
    else if (maxValue <= 50) ceiling = 50;
    else if (maxValue <= 100) ceiling = 100;
    else if (maxValue <= 200) ceiling = 200;
    else if (maxValue <= 500) ceiling = 500;
    else if (maxValue <= 1000) ceiling = 1000;
    else ceiling = Math.ceil(maxValue / 500) * 500;

    // Generate 5 tick marks (including 0)
    let ticks;
    if (isMortalitas) {
      // For mortalitas: always use integers
      const step = Math.ceil(ceiling / 4);
      ticks = [ceiling, step * 3, step * 2, step, 0];
    } else {
      // For other parameters: can have decimals
      ticks = [ceiling, ceiling * 0.75, ceiling * 0.5, ceiling * 0.25, 0];
    }
    
    return { max: ceiling, ticks };
  }, [chartData, selectedFilter]);

  // Get Y-axis unit label
  const getYAxisLabel = () => {
    switch (selectedFilter) {
      case 'Mortalitas': return 'Ekor';
      case 'Bobot': return 'Gram';
      case 'Pakan': return 'Kg';
      case 'Minum': return 'Liter';
      default: return '';
    }
  };

  // Format tick value (integer for mortalitas)
  const formatTick = (value) => {
    if (selectedFilter === 'Mortalitas') {
      return Math.round(value);
    }
    return Number.isInteger(value) ? value : value.toFixed(1);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedFarmId) {
      fetchChartData(selectedFarmId);
    }
  }, [selectedFilter, selectedFarmId]);

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    setApiError(null);

    try {
      const response = await ownerService.getDashboard();
      const data = response.data.data || response.data;

      if (data.farms && data.farms.length > 0) {
        setFarms(data.farms);

        const farmToDisplay = selectedFarmId
          ? data.farms.find(f => f.farm_id === selectedFarmId)
          : data.farms[0];

        if (!selectedFarmId) {
          setSelectedFarmId(data.farms[0].farm_id);
        }

        if (farmToDisplay) {
          setFarmData({
            name: farmToDisplay.farm_name || 'Kandang A',
            status: farmToDisplay.status || 'normal',
            temp: farmToDisplay.temperature ? `${Math.round(farmToDisplay.temperature)}°C` : '-'
          });
          await fetchChartData(farmToDisplay.farm_id);
        }
      }

      if (data.activities && data.activities.length > 0) {
        const acts = data.activities.map(activity => ({
          time: activity.time || '-',
          activity: activity.type === 'sensor' ? 'Update Indikator' : 'Laporan Manual',
          detail: activity.message || '-',
          status: activity.type === 'sensor' ? 'Normal' : 'Info'
        }));
        setActivities(acts);
      }

      setIsLoadingData(false);
    } catch (error) {
      const errorMessage = handleError('DashboardOwner fetchData', error);
      setApiError(errorMessage);
      setIsLoadingData(false);
    }
  };

  const fetchChartData = async (farmId) => {
    try {
      setIsLoadingChart(true);
      
      const filterMapping = {
        'Mortalitas': 'mortality',
        'Bobot': 'avg_weight',
        'Pakan': 'feed',
        'Minum': 'water'
      };

      const dataField = filterMapping[selectedFilter] || 'mortality';

      // Call analysis aggregate API (manual data)
      const response = await ownerService.getAnalytics(farmId, '1day');
      const data = response.data.data || response.data;

      console.log('📊 Chart API Response:', {
        dataField,
        labels: data.labels,
        values: data[dataField],
        rawData: data
      });

      if (data.labels && data[dataField]) {
        // Use all 6 data points from API
        const newChartData = data.labels.map((label, i) => ({
          time: label || '00:00',
          value: parseFloat(data[dataField][i]) || 0
        }));

        console.log('📈 Processed Chart Data:', newChartData);
        setChartData(newChartData);
      } else {
        // Default empty data
        setChartData([
          { time: '00:00', value: 0 },
          { time: '04:00', value: 0 },
          { time: '08:00', value: 0 },
          { time: '12:00', value: 0 },
          { time: '16:00', value: 0 },
          { time: '20:00', value: 0 },
        ]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch chart data:', error);
    } finally {
      setIsLoadingChart(false);
    }
  };

  const handlePengajuan = () => {
    setShowRequestModal(true);
  };

  const getStatusBadgeClass = (status) => {
    const baseClass = "inline-block px-3 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'normal':
        return `${baseClass} bg-green-500 text-white`;
      case 'info':
        return `${baseClass} bg-blue-500 text-white`;
      case 'waspada':
        return `${baseClass} bg-yellow-400 text-white`;
      case 'bahaya':
        return `${baseClass} bg-red-500 text-white`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  const getBarColor = () => {
    switch (selectedFilter) {
      case 'Mortalitas': return 'from-red-500 to-red-400';
      case 'Bobot': return 'from-green-500 to-green-400';
      case 'Pakan': return 'from-orange-500 to-orange-400';
      case 'Minum': return 'from-blue-500 to-blue-400';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Error Alert */}
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Gagal Memuat Data dari Backend</h3>
              <p className="text-sm text-red-700 mt-1">{apiError}</p>
              <p className="text-xs text-red-600 mt-2">📊 Menampilkan data mock sebagai fallback.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Owner</h1>
          <p className="text-gray-600 text-sm mt-1 mb-8">Pantau kondisi semua kandang dan aktivitas peternakan Anda</p>
        </div>
        <button
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          onClick={handlePengajuan}
        >
          <span className="text-xl font-semibold">+</span>
          Pengajuan Permintaan
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Kondisi Kandang Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg text-center font-semibold text-gray-900 mb-4">Kondisi Kandang</h2>
          <div className="text-center py-4">
            <div className="w-20 h-20 mx-auto mb-4">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="40" fill={
                  farmData.status.toLowerCase() === 'normal' ? '#22C55E' :
                  farmData.status.toLowerCase() === 'waspada' ? '#FFD700' :
                  farmData.status.toLowerCase() === 'bahaya' ? '#EF4444' :
                  '#9CA3AF'
                }/>
                <path d="M40 18 L60 58 L20 58 Z" fill="#fff"/>
                <path d="M38 32 L42 32 L41.5 45 L38.5 45 Z" fill={
                  farmData.status.toLowerCase() === 'normal' ? '#22C55E' :
                  farmData.status.toLowerCase() === 'waspada' ? '#FFD700' :
                  farmData.status.toLowerCase() === 'bahaya' ? '#EF4444' :
                  '#9CA3AF'
                }/>
                <circle cx="40" cy="50" r="2.5" fill={
                  farmData.status.toLowerCase() === 'normal' ? '#22C55E' :
                  farmData.status.toLowerCase() === 'waspada' ? '#FFD700' :
                  farmData.status.toLowerCase() === 'bahaya' ? '#EF4444' :
                  '#9CA3AF'
                }/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{farmData.name}</h3>
            <p className="text-xl font-semibold capitalize text-[#64748B] mb-1">{farmData.status}</p>
            <p className="text-xl font-bold text-[#64748B]">{farmData.temp}</p>
          </div>
        </div>

        {/* Analisis Laporan Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg text-center font-semibold text-gray-900 mb-3">Analisis Laporan (Terbaru)</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <select
                  className="w-full px-3 py-1.5 border border-gray-400 rounded-lg text-xs cursor-pointer focus:ring-blue-500 focus:border-blue-500 focus:outline-none mb-2"
                  value={selectedFarmId || ''}
                  onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                >
                  {farms.map(farm => (
                    <option key={farm.farm_id} value={farm.farm_id}>{farm.farm_name}</option>
                  ))}
                </select>
                <select
                  className="w-fit px-3 py-1.5 border border-gray-400 rounded-lg text-xs cursor-pointer focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option>Mortalitas</option>
                  <option>Bobot</option>
                  <option>Pakan</option>
                  <option>Minum</option>
                </select>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="flex gap-1 pb-10 h-56">
            {/* Y-Axis Label */}
            <div className="flex items-center pb-2">
              <span className="text-sm text-gray-800 font-medium transform -rotate-90 whitespace-nowrap">
                {getYAxisLabel()}
              </span>
            </div>

            {/* Y-Axis Ticks */}
            <div className="flex flex-col justify-between text-xs text-gray-600 pt-1 pr-1 w-12 text-right">
              {yAxisConfig.ticks.map((tick, i) => (
                <span key={i}>{formatTick(tick)}</span>
              ))}
            </div>
            
            {/* Chart Area */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex items-end gap-1 pl-2 border-l-2 border-b-2 border-gray-400 relative">
                {isLoadingChart ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  chartData.map((data, index) => {
                    // Calculate height percentage based on yAxisConfig.max
                    const heightPercent = yAxisConfig.max > 0 
                      ? Math.min((data.value / yAxisConfig.max) * 100, 100)
                      : 0;
                    
                    // Minimum height for visibility when value > 0
                    const minHeight = data.value > 0 ? 8 : 0;
                    const finalHeight = Math.max(heightPercent, minHeight);
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div
                          className={`w-full max-w-[40px] bg-gradient-to-t ${getBarColor()} rounded-t flex items-start justify-center pt-1 transition-all duration-300`}
                          style={{ 
                            height: `${finalHeight}%`,
                            minHeight: data.value > 0 ? '24px' : '20px'
                          }}
                        >
                          <span className="text-[10px] font-semibold text-white">
                            {selectedFilter === 'Mortalitas' ? Math.round(data.value) : data.value}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* X-Axis Labels */}
              <div className="flex gap-1 pl-2 pt-1">
                {chartData.map((data, index) => (
                  <div key={index} className="flex-1 text-center">
                    <span className="text-[10px] text-gray-600">{data.time}</span>
                  </div>
                ))}
              </div>
              
              {/* X-Axis Title */}
              <div className="text-center text-sm text-gray-800 font-medium mt-2">
                Jam
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aktivitas Peternakan Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg text-center font-semibold text-gray-900 mb-4">Aktivitas Peternakan</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktivitas</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr
                  key={index}
                  className={`border-t border-gray-100 transition-colors ${activity.status === 'Info' ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    // Navigate to owner analytics page when clicking Info status
                    if (activity.status === 'Info') {
                      navigate('/owner/analytics');
                    }
                  }}
                >
                  <td className="px-4 py-4 text-gray-600 text-sm">{activity.time}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-900">{activity.activity}</span>
                      <span className="text-sm text-gray-600">{activity.detail}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={getStatusBadgeClass(activity.status)}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRequestModal && (
        <RequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
