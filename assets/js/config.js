/* Environment-based API Base URL Config */
const API_CONFIG = {
  BASE_URL: window.ENV_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api/v1'
    : 'https://api.fitzonegym.com/api/v1'),
  TIMEOUT: 10000 // 10 seconds
};
