/**
 * Extract user-friendly error message from API error
 * @param {Error} error - Axios error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Network error (no response from server)
  if (!error.response) {
    return 'Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.';
  }

  // Server responded with error
  const { status, data } = error.response;

  // Specific status code handling
  switch (status) {
    case 400:
      return data.message || 'Permintaan tidak valid. Silakan periksa input Anda.';
    case 401:
      return 'Sesi Anda telah berakhir. Silakan login kembali.';
    case 403:
      return 'Anda tidak memiliki izin untuk melakukan tindakan ini.';
    case 404:
      return 'Data yang diminta tidak ditemukan.';
    case 419:
      return 'Sesi berakhir. Silakan refresh dan coba lagi.';
    case 422:
      // Validation errors
      if (data.errors) {
        const firstError = Object.values(data.errors)[0];
        return Array.isArray(firstError) ? firstError[0] : firstError;
      }
      return data.message || 'Validasi gagal. Silakan periksa input Anda.';
    case 500:
      return 'Terjadi kesalahan server. Silakan coba lagi nanti.';
    default:
      return data.message || 'Terjadi kesalahan yang tidak terduga.';
  }
};

/**
 * Log error for debugging
 * @param {string} context - Where the error occurred
 * @param {Error} error - Error object
 */
export const logError = (context, error) => {
  if (import.meta.env.DEV) {
    console.group(`Error in ${context}`);
    console.error('Error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    console.groupEnd();
  }
};

/**
 * Handle error and return user-friendly message
 * Combines logging and message extraction
 * @param {string} context - Where the error occurred
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const handleError = (context, error) => {
  logError(context, error);
  return getErrorMessage(error);
};
