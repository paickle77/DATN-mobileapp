// services/api.interceptor.ts
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { clearAllStorage, getUserData } from '../screens/utils/storage';
import { loginAuthService } from './LoginAuthService';
import { BASE_URL } from './api';

// Tạo axios instance riêng để tránh recursive calls
const apiClient = axios.create({
  baseURL: BASE_URL,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - thêm access token vào header
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = await getUserData('accessToken');
    
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - xử lý token hết hạn
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Kiểm tra nếu lỗi 401 và có code TOKEN_EXPIRED
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      (error.response.data as any)?.code === 'TOKEN_EXPIRED'
    ) {
      if (isRefreshing) {
        // Nếu đang refresh, thêm request vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResult = await loginAuthService.refreshToken();
        
        if (refreshResult.success && refreshResult.data?.accessToken) {
          const newAccessToken = refreshResult.data.accessToken;
          
          processQueue(null, newAccessToken);
          
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          }
          
          return apiClient(originalRequest);
        } else {
          // Refresh token thất bại, logout user
          processQueue(new Error('Session expired'), null);
          await handleSessionExpired();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        await handleSessionExpired();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Xử lý khi session hết hạn
const handleSessionExpired = async () => {
  try {
    // Logout trên server
    await loginAuthService.logout();
    
    // Xóa local storage
    await clearAllStorage();
    
    // Có thể trigger navigation về login screen tại đây
    // Hoặc emit event để các component khác biết
    console.log('🚪 Session hết hạn, đã đăng xuất người dùng');
    
    // TODO: Navigate to login screen
    // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    
  } catch (error) {
    console.error('❌ Lỗi khi xử lý session hết hạn:', error);
  }
};

export default apiClient;

// Export utility functions
export { handleSessionExpired };

