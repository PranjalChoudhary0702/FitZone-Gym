/* Production API Base URL Configuration */
const BASE_URL = window.ENV_API_URL || (
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api/v1'
    : 'https://fitzone-gym-rfsa.onrender.com/api/v1'
);

const API_CONFIG = {
  BASE_URL: BASE_URL,
  TIMEOUT: 10000 // 10 seconds
};
