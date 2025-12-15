import React from 'react';

const RequestDetailModal = ({ request, onClose }) => {
  if (!request) return null;

  // Parse request_content JSON
  let parsedContent = null;
  try {
    parsedContent = JSON.parse(request.request_content);
  } catch (e) {
    // If not JSON, use raw content
    parsedContent = null;
  }

  const isGuest = request.role === 'Guest' || request.user_id === 0;
  const isOwner = request.role === 'Owner';
  const isTambahKandang = request.request_type === 'Tambah Kandang' || parsedContent?.type === 'tambah_kandang';
  const isTambahPeternak = request.request_type === 'Tambah Peternak' || parsedContent?.type === 'tambah_peternak';

  // Extract data based on request type
  const getGuestData = () => {
    if (parsedContent) {
      return {
        email: parsedContent.email || '-',
        whatsapp: parsedContent.nomor_whatsapp || parsedContent.whatsapp || request.phone_number || '-',
        detail: parsedContent.detail_permintaan || parsedContent.problem_type || '-'
      };
    }
    // Parse from old format "Email: xxx\nNomor WhatsApp: xxx\nDetail Permintaan: xxx"
    const lines = (request.request_content || '').split('\n');
    const data = {};
    lines.forEach(line => {
      if (line.startsWith('Email:')) data.email = line.replace('Email:', '').trim();
      if (line.startsWith('Nomor WhatsApp:')) data.whatsapp = line.replace('Nomor WhatsApp:', '').trim();
      if (line.startsWith('Detail Permintaan:')) data.detail = line.replace('Detail Permintaan:', '').trim();
    });
    return {
      email: data.email || '-',
      whatsapp: data.whatsapp || request.phone_number || '-',
      detail: data.detail || '-'
    };
  };

  const getTambahKandangData = () => {
    if (parsedContent) {
      return {
        nama_kandang: parsedContent.nama_kandang || parsedContent.farm_name || '-',
        lokasi: parsedContent.lokasi_kandang || parsedContent.location || '-',
        kapasitas: parsedContent.kapasitas_kandang || parsedContent.farm_area || '-',
        peternak: parsedContent.peternak_name || '-'
      };
    }
    return {
      nama_kandang: '-',
      lokasi: '-',
      kapasitas: '-',
      peternak: '-'
    };
  };

  const getTambahPeternakData = () => {
    if (parsedContent) {
      return {
        nama: parsedContent.nama_lengkap || parsedContent.name || '-',
        whatsapp: parsedContent.nomor_whatsapp || parsedContent.phone_number || '-',
        email: parsedContent.email || '-'
      };
    }
    return {
      nama: '-',
      whatsapp: '-',
      email: '-'
    };
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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-[450px] max-w-[90vw] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Detail Permintaan</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Request Info Header */}
        <div className="bg-gray-50 rounded-lg p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Pengirim</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {getStatusLabel(request.status)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {(request.sender_name || request.username || 'G')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{request.sender_name || request.username || 'Guest'}</p>
              <p className="text-sm text-gray-500">{request.role || 'Guest'}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">Waktu pengajuan</p>
            <p className="text-sm text-gray-700">{request.sent_time || '-'}</p>
          </div>
        </div>

        {/* Content based on type */}
        <div className="space-y-4">
          {isGuest && (
            <>
              <h4 className="font-medium text-gray-900 mb-3">Laporan Guest</h4>
              {(() => {
                const data = getGuestData();
                return (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Email</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{data.email}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Nomor WhatsApp</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{data.whatsapp}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Detail Permasalahan</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{data.detail}</p>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {isOwner && isTambahKandang && (
            <>
              <h4 className="font-medium text-gray-900 mb-3">Permintaan Tambah Kandang</h4>
              {(() => {
                const data = getTambahKandangData();
                return (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Nama Kandang</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{data.nama_kandang}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Lokasi Kandang</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{data.lokasi}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Kapasitas Kandang</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{data.kapasitas} ekor</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Peternak yang Mengurusi</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{data.peternak}</p>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {isOwner && isTambahPeternak && (
            <>
              <h4 className="font-medium text-gray-900 mb-3">Permintaan Tambah Peternak</h4>
              {(() => {
                const data = getTambahPeternakData();
                return (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Nama Lengkap</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{data.nama}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Nomor WhatsApp</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{data.whatsapp}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Email</label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{data.email}</p>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* Fallback for other request types (like Lupa Password from user) */}
          {!isGuest && !isTambahKandang && !isTambahPeternak && (
            <>
              <h4 className="font-medium text-gray-900 mb-3">{request.request_type || 'Permintaan'}</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Nomor WhatsApp</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{request.phone_number || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Detail</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg whitespace-pre-wrap">
                    {request.request_content || '-'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;
