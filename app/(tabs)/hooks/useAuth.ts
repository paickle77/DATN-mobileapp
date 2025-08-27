// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { loginAuthService } from '../services/LoginAuthService';
import AuthUtils from '../utils/auth.utils';

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  userInfo: {
    accountId?: string;
    userId?: string;
    userRole?: string;
    userEmail?: string;
    userName?: string;
  } | null;
  isSessionValid: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    isLoading: true,
    userInfo: null,
    isSessionValid: false,
  });

  // Kiểm tra trạng thái đăng nhập
  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const isLoggedIn = await AuthUtils.isLoggedIn();
      const isSessionValid = await AuthUtils.isSessionValid();
      const userInfo = await AuthUtils.getCurrentUserInfo();

      setAuthState({
        isLoggedIn,
        isLoading: false,
        userInfo,
        isSessionValid,
      });

      // Nếu có login nhưng session hết hạn, thử refresh token
      if (isLoggedIn && !isSessionValid) {
        const refreshSuccess = await AuthUtils.forceRefreshToken();
        if (refreshSuccess) {
          const updatedSessionValid = await AuthUtils.isSessionValid();
          setAuthState(prev => ({
            ...prev,
            isSessionValid: updatedSessionValid,
          }));
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra auth status:', error);
      setAuthState({
        isLoggedIn: false,
        isLoading: false,
        userInfo: null,
        isSessionValid: false,
      });
    }
  };

  // Đăng nhập
  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const result = await loginAuthService.login(email, password);
      
      if (result.success) {
        // Cập nhật auth state sau khi đăng nhập thành công
        await checkAuthStatus();
        return result;
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await AuthUtils.logout();
      setAuthState({
        isLoggedIn: false,
        isLoading: false,
        userInfo: null,
        isSessionValid: false,
      });
    } catch (error) {
      console.error('❌ Lỗi khi đăng xuất:', error);
      throw error;
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const result = await loginAuthService.refreshToken();
      if (result.success) {
        await checkAuthStatus();
      }
      return result;
    } catch (error) {
      console.error('❌ Lỗi khi refresh token:', error);
      throw error;
    }
  };

  // Check auth status khi hook được mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    ...authState,
    login,
    logout,
    refreshToken,
    checkAuthStatus,
  };
};

export default useAuth;
