import React from 'react';

const RequestDetailModal = ({ request, onClose }) => {
  if (!request) return null;

  let parsedContent = null;
  try { parsedContent = JSON.parse(request.request_content); } catch { parsedContent = null; }

  const isGuest = request.role === 'Guest' || request.user_id === 0;
  const isLupaPassword = request.request_type === 'Lupa Password';
  const isTambahKandang = request.request_type === 'Tambah Kandang';
  const isTambahPeternak = request.request_type === 'Tambah Peternak';

  const getStatusColor = (s) => ({ 'pending': 'bg-yellow-100 text-yellow-700', 'approved': 'bg-green-100 text-green-700', 'rejected': 'bg-red-100 text-red-700' }[s?.toLowerCase()] || 'bg-gray-100 text-gray-700');
  const getStatusLabel = (s) => ({ 'pending': 'Menunggu', 'approved': 'Disetujui', 'rejected': 'Ditolak' }[s?.toLowerCase()] || s);

  const Field = ({ label, value }) => (
    <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 text-right">{value || '-'}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-5 w-[380px] max-w-[90vw] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Detail Permintaan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">{(request.sender_name || 'G')[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{request.sender_name || 'Guest'}</p>
                <p className="text-xs text-gray-500">{request.role || 'Guest'}</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>{getStatusLabel(request.status)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{request.sent_time || '-'}</p>
        </div>

        <div className="space-y-1">
          <h4 className="font-medium text-gray-900 text-sm mb-2">
            {isLupaPassword ? 'Lupa Password' : isGuest ? 'Laporan Guest' : isTambahKandang ? 'Tambah Kandang' : isTambahPeternak ? 'Tambah Peternak' : request.request_type}
          </h4>

          {isLupaPassword && parsedContent && (
            <>
              <Field label="Email" value={parsedContent.email} />
              <Field label="WhatsApp" value={parsedContent.phone_number} />
              <Field label="Role" value={parsedContent.role} />
            </>
          )}

          {isGuest && (
            <>
              <Field label="Email" value={parsedContent?.email} />
              <Field label="WhatsApp" value={parsedContent?.nomor_whatsapp || request.phone_number} />
              <Field label="Detail" value={parsedContent?.detail_permintaan || parsedContent?.problem_type} />
            </>
          )}

          {isTambahKandang && parsedContent && (
            <>
              <Field label="Nama Kandang" value={parsedContent.nama_kandang} />
              <Field label="Lokasi" value={parsedContent.lokasi_kandang} />
              <Field label="Kapasitas" value={parsedContent.kapasitas_kandang ? `${parsedContent.kapasitas_kandang} ekor` : '-'} />
              <Field label="Peternak" value={parsedContent.peternak_name} />
            </>
          )}

          {isTambahPeternak && parsedContent && (
            <>
              <Field label="Nama" value={parsedContent.nama_lengkap} />
              <Field label="WhatsApp" value={parsedContent.nomor_whatsapp} />
              <Field label="Email" value={parsedContent.email} />
            </>
          )}

          {!isLupaPassword && !isGuest && !isTambahKandang && !isTambahPeternak && (
            <Field label="Detail" value={request.request_content} />
          )}
        </div>

        <button onClick={onClose} className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Tutup</button>
      </div>
    </div>
  );
};

export default RequestDetailModal;
