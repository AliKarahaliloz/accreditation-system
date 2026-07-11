"use client";

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        // More robust header setting
        if (config.headers.set) {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          (config.headers as any)['Authorization'] = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      const url = error.config?.url;

      if (status === 401) {
        alert("Oturumunuz sonlandı (401). Lütfen tekrar giriş yapın.");
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        console.error(`403 Forbidden at ${url}:`, error.response?.data);
        const backendMsg = error.response?.data?.message || error.response?.data;
        const msg = backendMsg ? `Yetkisiz işlem (403): ${backendMsg}` : `Yetkisiz işlem (403): Bu işlem için yetkiniz bulunmamaktadır. \nURL: ${url}`;
        alert(msg);
      } else if (!error.response) {
        alert("Ağ hatası veya CORS sorunu: " + error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
