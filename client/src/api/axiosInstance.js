import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
  withCredentials: true, // Always send cookies (for HttpOnly JWT cookie)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// --- Request Interceptor ---
axiosInstance.interceptors.request.use(
  (config) => {
    // If a token exists in localStorage (for non-cookie clients), attach it
    const token = localStorage.getItem('kaamlink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response) {
      // Handle 401 (unauthorized) globally - redirect to login
      if (response.status === 401) {
        localStorage.removeItem('kaamlink_token');
        // Only redirect if not already on auth pages
        if (
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/signup')
        ) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

