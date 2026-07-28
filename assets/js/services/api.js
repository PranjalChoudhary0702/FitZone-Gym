/* Axios Base HTTP Client Instance */
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

/* Request Interceptor to Attach JWT Authorization Token */
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('adminToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

/* Global Interceptor for Error Handling */
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = 'An unexpected network error occurred.';

    if (error.response) {
      // Requirement #9: Print complete response body on error (422, 400, etc.)
      console.error('[HTTP Error Response Body]:', error.response.data);

      errorMessage = error.response.data?.message || error.response.data?.error || `Server Error (${error.response.status})`;
      
      // If 401 Unauthorized occurs on admin operations, handle token expiration/invalidation
      if (error.response.status === 401 && window.handleAdminUnauthorized) {
        window.handleAdminUnauthorized(errorMessage);
      }
    } else if (error.request) {
      errorMessage = 'Backend API is unreachable. Please check your connection.';
    } else {
      errorMessage = error.message;
    }

    console.error('[API Error]:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);
