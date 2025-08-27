// services/LoginAuthService.ts
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { getUserData, saveUserData } from '../screens/utils/storage';
import { BASE_URL } from './api';

export interface User {
  role: string;
  _id: string;
  email: string;
  password: string;
  name?: string;
  phone: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  role?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    refreshTokenExpires: number;
    account: any;
    profile: any;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    refreshTokenExpires: number;
  };
}

class LoginAuthService {
  private apiUrl = `${BASE_URL}/login`;

  // Lấy danh sách users để login
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get(this.apiUrl);
      
      if (response.data && response.data.data) {
        console.log('Lấy API thành công');
        return response.data.data;
      }
      
      throw new Error('Không có dữ liệu người dùng');
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      throw error;
    }
  }

  // Kiểm tra mật khẩu với BCrypt
  private async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      console.error('Lỗi khi so sánh mật khẩu:', error);
      return false;
    }
  }

  // Mã hóa mật khẩu với BCrypt (tiện ích bổ sung)
  async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      console.error('Lỗi khi mã hóa mật khẩu:', error);
      throw error;
    }
  }

  // ✅ SỬA: Xử lý login với dual token
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { email, password });
      
      const { success, message, data } = response.data;

      if (success && data?.accessToken && data?.refreshToken && data?.account) {
        const { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires, account, profile } = data;

        // ✅ Lưu tokens và thông tin vào AsyncStorage
        await saveUserData({ key: 'accessToken', value: accessToken });
        await saveUserData({ key: 'refreshToken', value: refreshToken });
        await saveUserData({ key: 'accessTokenExpires', value: accessTokenExpires.toString() });
        await saveUserData({ key: 'refreshTokenExpires', value: refreshTokenExpires.toString() });
        await saveUserData({ key: 'userData', value: account._id });

        return {
          success,
          message,
          data // ✅ Trả lại toàn bộ data để lấy account.role, profile...
        };
      } else {
        return {
          success: false,
          message: message || 'Sai thông tin đăng nhập',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Đăng nhập thất bại. Vui lòng kiểm tra tài khoản và mật khẩu.',
      };
    }
  }

  // ✅ THÊM: Refresh token method
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const refreshToken = await getUserData('refreshToken');
      
      if (!refreshToken) {
        throw new Error('Không có refresh token');
      }

      const response = await axios.post(`${BASE_URL}/refresh-token`, { refreshToken });
      
      const { success, message, data } = response.data;

      if (success && data?.accessToken && data?.refreshToken) {
        const { accessToken, refreshToken: newRefreshToken, accessTokenExpires, refreshTokenExpires } = data;

        // ✅ Lưu tokens mới vào AsyncStorage
        await saveUserData({ key: 'accessToken', value: accessToken });
        await saveUserData({ key: 'refreshToken', value: newRefreshToken });
        await saveUserData({ key: 'accessTokenExpires', value: accessTokenExpires.toString() });
        await saveUserData({ key: 'refreshTokenExpires', value: refreshTokenExpires.toString() });

        return {
          success,
          message,
          data
        };
      } else {
        return {
          success: false,
          message: message || 'Không thể refresh token',
        };
      }
    } catch (error: any) {
      console.error('❌ Lỗi refresh token:', error);
      return {
        success: false,
        message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      };
    }
  }

  // ✅ THÊM: Logout method
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const refreshToken = await getUserData('refreshToken');
      
      if (refreshToken) {
        // Gọi API logout để xóa refresh token khỏi server
        await axios.post(`${BASE_URL}/logout`, { refreshToken });
      }

      return {
        success: true,
        message: 'Đăng xuất thành công'
      };
    } catch (error) {
      console.error('❌ Lỗi khi đăng xuất:', error);
      // Vẫn trả về success vì client đã logout local
      return {
        success: true,
        message: 'Đăng xuất thành công'
      };
    }
  }

  // ✅ THÊM: Kiểm tra token có hết hạn không
  async isAccessTokenExpired(): Promise<boolean> {
    try {
      const expiresString = await getUserData('accessTokenExpires');
      if (!expiresString) return true;
      
      const expires = parseInt(expiresString);
      return Date.now() >= expires;
    } catch (error) {
      return true;
    }
  }

  // ✅ THÊM: Auto refresh token nếu cần
  async ensureValidToken(): Promise<boolean> {
    try {
      const isExpired = await this.isAccessTokenExpired();
      
      if (!isExpired) {
        return true; // Access token còn hạn
      }

      // Access token hết hạn, thử refresh
      console.log('🔄 Access token hết hạn, đang refresh...');
      const refreshResult = await this.refreshToken();
      
      if (refreshResult.success) {
        console.log('✅ Refresh token thành công');
        return true;
      } else {
        console.log('❌ Refresh token thất bại');
        return false;
      }
    } catch (error) {
      console.error('❌ Lỗi khi ensure valid token:', error);
      return false;
    }
  }



  // Phương thức kiểm tra mật khẩu mà không cần đăng nhập
  async verifyPassword(email: string, password: string): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const user = users.find((u: User) => u.email === email);
      
      if (!user) {
        return false;
      }

      return await this.comparePassword(password, user.password);
    } catch (error) {
      console.error('Lỗi khi xác thực mật khẩu:', error);
      return false;
    }
  }
}

// Export instance
export const loginAuthService = new LoginAuthService();
export default loginAuthService;