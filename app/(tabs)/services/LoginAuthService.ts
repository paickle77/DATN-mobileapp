// services/LoginAuthService.ts
import axios from 'axios';
import { BASE_URL } from './api';

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

class LoginAuthService {
  private apiUrl = `${BASE_URL}/users`;

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

  // Xử lý login
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Lấy danh sách users
      const users = await this.getAllUsers();
      
      // Tìm user khớp với email và password
      const matchedUser = users.find((user: User) => {
        return user.email === email && user.password === password;
      });

      if (matchedUser) {
        console.log('Đăng nhập thành công:', matchedUser);
        return {
          success: true,
          message: 'Đăng nhập thành công!',
          user: matchedUser,
        };
      } else {
        return {
          success: false,
          message: 'Email hoặc mật khẩu không chính xác!',
        };
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.',
      };
    }
  }
}

// Export instance
export const loginAuthService = new LoginAuthService();
export default loginAuthService;