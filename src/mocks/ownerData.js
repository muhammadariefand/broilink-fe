export const mockOwnerData = {
  profile: {
    username: 'owner1',
    email: 'owner1@broilink.com',
    totalFarms: 3
  },

  farms: [
    {
      id: 1,
      name: 'Kandang Sleman',
      status: 'normal',
      temperature: 30,
      humidity: 65,
      ammonia: 15
    },
    {
      id: 2,
      name: 'Kandang Bantul',
      status: 'waspada',
      temperature: 34,
      humidity: 75,
      ammonia: 18
    },
    {
      id: 3,
      name: 'Kandang Kulonprogo',
      status: 'bahaya',
      temperature: 36,
      humidity: 82,
      ammonia: 32
    }
  ],

  recentAnalytics: {
    labels: ['00:00', '06:00', '12:00', '18:00'],
    mortalitas: [2, 3, 1, 2],
    bobot: [800, 820, 850, 870],
    pakan: [3, 4, 3, 4],
    minum: [4, 5, 4, 5]
  },

  activities: [
    { time: '18:30', activity: 'Update Indikator Suhu: 30°C', status: 'normal', farm: 'Kandang Sleman' },
    { time: '17:56', activity: 'Laporan Minum oleh Budi', status: 'info', farm: 'Kandang Bantul' },
    { time: '12:45', activity: 'Update Indikator Amonia: 32 ppm', status: 'bahaya', farm: 'Kandang Kulonprogo' },
    { time: '08:00', activity: 'Laporan Pakan oleh Ahmad', status: 'info', farm: 'Kandang Sleman' },
    { time: '07:30', activity: 'Update Indikator Kelembapan: 82%', status: 'waspada', farm: 'Kandang Bantul' }
  ],

  currentSensor: {
    temperature: 30,
    humidity: 65,
    ammonia: 15,
    status: 'normal'
  },

  sensorHistory: {
    '1day': {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      temperature: [28, 29, 31, 32, 31, 30],
      humidity: [62, 64, 66, 68, 67, 65],
      ammonia: [12, 14, 16, 18, 16, 15]
    },
    '1week': {
      labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
      temperature: [29, 30, 31, 30, 29, 30, 31],
      humidity: [64, 66, 67, 65, 64, 66, 68],
      ammonia: [14, 15, 16, 15, 14, 15, 17]
    },
    '1month': {
      labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
      temperature: [29, 30, 31, 30],
      humidity: [65, 66, 68, 67],
      ammonia: [14, 15, 16, 15]
    },
    '6months': {
      labels: ['Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar'],
      temperature: [28, 29, 30, 29, 30, 31],
      humidity: [63, 65, 67, 66, 68, 69],
      ammonia: [13, 14, 15, 14, 15, 16]
    }
  },

  analyticsHistory: {
    '1day': {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      pakan: [3, 4, 3, 4, 3, 4],
      minum: [4, 5, 4, 5, 4, 5],
      bobot: [0.8, 0.82, 0.85, 0.87, 0.89, 0.9],
      kematian: [1, 0, 1, 0, 1, 0]
    },
    '1week': {
      labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
      pakan: [20, 22, 21, 23, 22, 21, 20],
      minum: [28, 30, 29, 31, 30, 29, 28],
      bobot: [0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1],
      kematian: [3, 2, 4, 2, 3, 2, 3]
    },
    '1month': {
      labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
      pakan: [140, 150, 155, 160],
      minum: [200, 210, 215, 220],
      bobot: [0.8, 1.2, 1.6, 2.0],
      kematian: [15, 12, 10, 8]
    },
    '6months': {
      labels: ['Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar'],
      pakan: [500, 520, 540, 560, 580, 600],
      minum: [800, 820, 840, 860, 880, 900],
      bobot: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
      kematian: [50, 45, 40, 35, 30, 25]
    }
  }
};
