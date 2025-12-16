import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { handleError } from '../../utils/errorHandler';
import NavbarAdmin from '../../components/NavbarAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';
import RequestDetailModal from '../../components/RequestDetailModal';

const RiwayatLaporan = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('Terbaru');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [currentPage, filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const sortOrder = filter === 'Terbaru' ? 'newest' : 'oldest';
      const response = await adminService.getRequests(sortOrder, currentPage);

      const data = response.data.data || response.data;

      if (data && Array.isArray(data)) {
      setRequests(data);
      }
    } catch (error) {
      const errorMessage = handleError('RiwayatLaporan fetchRequests', error);
      console.error('Failed to fetch requests:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await adminService.updateRequestStatus(requestId, newStatus);
      fetchRequests();
    } catch (error) {
      const errorMessage = handleError('RiwayatLaporan handleStatusUpdate', error);
      alert('Gagal mengupdate status: ' + errorMessage);
    }
  };

  const handleDetailClick = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'approved': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Menunggu',
      'approved': 'Disetujui',
      'rejected': 'Ditolak'
    };
    return labels[status?.toLowerCase()] || status;
  };

  // Get display text for Detail Permintaan column
  const getRequestTypeDisplay = (request) => {
    const isGuest = request.role === 'Guest' || request.user_id === 0;
    
    if (isGuest) {
      // For guest, show the problem type from request_content
      try {
        const content = JSON.parse(request.request_content);
        return content.detail_permintaan || content.problem_type || 'Laporan Guest';
      } catch {
        // Parse old format
        const lines = (request.request_content || '').split('\n');
        for (const line of lines) {
          if (line.startsWith('Detail Permintaan:')) {
            return line.replace('Detail Permintaan:', '').trim();
          }
        }
        return 'Laporan Guest';
      }
    }
    
    // For owner, show request_type (Tambah Kandang / Tambah Peternak)
    return request.request_type || '-';
  };

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarAdmin /><SidebarAdmin />
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
      <NavbarAdmin /><SidebarAdmin />
      <main className="ml-48 pt-16">
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Riwayat Laporan & Permintaan</h1>
          <p className="text-gray-600 text-sm mt-1 mb-8">Log semua permintaan yang dikirimkan oleh pengguna sistem</p>

          <div className="flex justify-end items-center gap-2">
            <span className="text-sm text-gray-600">Urutkan:</span>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                <option>Terbaru</option>
                <option>Terlama</option>
              </select>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">NO</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">WhatsApp</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Waktu</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Detail Permintaan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-500">
                        <p>Belum ada laporan</p>
                      </td>
                    </tr>
                  ) : (
                    requests.slice((currentPage - 1) * 5, currentPage * 5).map((log, index) => (
                      <tr key={log.request_id || log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm text-gray-900">{(currentPage - 1) * 5 + index + 1}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{log.username || log.sender_name || 'Guest'}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{log.role || 'Guest'}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{log.phone_number || '—'}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{log.sent_time || '—'}</td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleDetailClick(log)}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {getRequestTypeDisplay(log)}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={log.status || 'pending'}
                            onChange={(e) => handleStatusUpdate(log.request_id || log.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-cyan-500 cursor-pointer ${getStatusColor(log.status)}`}
                          >
                            <option value="pending">Menunggu</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {requests.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.ceil(requests.length / 5) }, (_, i) => i + 1).slice(0, 5).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(requests.length / 5), p + 1))}
                  disabled={currentPage >= Math.ceil(requests.length / 5)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default RiwayatLaporan;
