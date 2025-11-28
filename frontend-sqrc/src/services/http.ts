import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const http = axios.create({
  baseURL: API_BASE, // in dev we use Vite proxy so '' or '/api' works
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: add Authorization if present
http.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore storage errors (SSR/local tests)
  }
  return config;
});

// Response interceptor: normalize errors
http.interceptors.response.use(
  (resp) => resp,
  (err) => {
    // optional: central error handling (logout on 401, etc.)
    return Promise.reject(err);
  }
);

export default http;
