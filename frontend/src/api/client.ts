import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

let currentAuthToken: string | undefined = undefined;

export const setAuthToken = (token?: string) => {
  currentAuthToken = token;
};

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (currentAuthToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentAuthToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 401 unauthorized handling
    }
    return Promise.reject(error);
  },
);

export default api;
