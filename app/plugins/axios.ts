// plugins/axios.ts
import axios from 'axios';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  
  axios.defaults.baseURL = config.public.apiBase;
  
  // Add request interceptor to attach auth token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor to handle auth errors
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // If token is expired or invalid, redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  
  return {
    provide: {
      axios
    }
  };
});
