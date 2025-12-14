const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export { USE_MOCK_DATA, API_BASE_URL };
