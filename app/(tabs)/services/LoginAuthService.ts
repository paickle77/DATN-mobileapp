// services/LoginAuthService.ts
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { saveUserData } from '../screens/utils/storage';
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

  // Xử lý login với BCrypt
  // services/LoginAuthService.ts
async login(email: string, password: string): Promise<any> {
  try {
    const response = await axios.post(`${BASE_URL}/login`, { email, password });
    

    const { success, message, data } = response.data;

    if (success && data?.token && data?.account) {
      const { token, account } = data;

      // ✅ Lưu token và account ID vào AsyncStorage
      await saveUserData({ key: 'token', value: token });
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
    // console.error('❌ Lỗi đăng nhập:', error);
    return {
      success: false,
      message: 'Đăng nhập thất bại. Vui lòng kiểm tra tài khoản và mật khẩu.',
    };
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