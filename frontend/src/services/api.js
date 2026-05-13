import axios from 'axios';

/**
 * Axios instance pre-configured for our backend.
 *
 * Why Axios instead of fetch()?
 * - Automatic JSON parsing
 * - Interceptors (add token to every request automatically)
 * - Better error objects with response.data
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 40000, // 40s — covers Azure F1 cold start wake-up time
});

// REQUEST interceptor — attach JWT before every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE interceptor — clear session and signal logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Fire a custom event so AuthContext can update React state and
      // let React Router navigate — avoids a hard page reload that clears the console
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
