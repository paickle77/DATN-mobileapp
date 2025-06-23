import axios from 'axios';
import { BASE_URL } from './api';

// Types cho API responses
interface User {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  gender?: string;
  avatar?: string;
  password?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

// Interface cho form data
interface RegisterData {
  email: string;
  password: string;
}

interface CompleteProfileData {
  name: string;
  phone: string;
  gender: string;
  avatar?: string;
}

export class RegisterAuthService {
  private static readonly USERS_ENDPOINT = `${BASE_URL}/users`;
  private static readonly DEFAULT_AVATAR = 'avatarmacdinh.png';

  /**
   * Lấy danh sách tất cả users (để check email trùng)
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get<ApiResponse<User[]>>(this.USERS_ENDPOINT);
      return response.data.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách users:', error);
      throw new Error('Không thể lấy danh sách người dùng');
    }
  }

  /**
   * Kiểm tra email đã tồn tại chưa
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      return users.some(user => user.email === email);
    } catch (error) {
      console.error('Lỗi khi kiểm tra email:', error);
      throw error;
    }
  }

  /**
   * Đăng ký user mới
   */
  static async registerUser(data: RegisterData): Promise<User> {
    try {
      // Kiểm tra email trùng trước khi đăng ký
      const emailExists = await this.checkEmailExists(data.email);
      if (emailExists) {
        throw new Error('Email đã tồn tại. Vui lòng chọn email khác.');
      }

      const response = await axios.post<ApiResponse<User>>(this.USERS_ENDPOINT, data);
      
      if (!response.data.data) {
        throw new Error('Không nhận được thông tin user sau khi đăng ký');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Lỗi API khi đăng ký:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể đăng ký. Vui lòng thử lại sau.');
      }
      throw error;
    }
  }

  /**
   * Lấy thông tin user theo ID
   */
  static async getUserById(id: string): Promise<User> {
    try {
      const response = await axios.get<ApiResponse<User>>(`${this.USERS_ENDPOINT}/${id}`);
      
      if (!response.data.data) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error);
      throw new Error('Không thể lấy thông tin người dùng');
    }
  }

  /**
   * Cập nhật hồ sơ user
   */
  static async updateUserProfile(id: string, profileData: CompleteProfileData): Promise<User> {
    try {
      // Nếu không có avatar được chọn, sử dụng avatar mặc định
      const finalData = {
        ...profileData,
        avatar: profileData.avatar || this.DEFAULT_AVATAR
      };

      const response = await axios.put<ApiResponse<User>>(
        `${this.USERS_ENDPOINT}/${id}`, 
        finalData
      );

      if (!response.data.data) {
        throw new Error('Không nhận được thông tin user sau khi cập nhật');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Lỗi API khi cập nhật hồ sơ:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật hồ sơ');
      }
      throw error;
    }
  }

  /**
   * Upload ảnh avatar (nếu cần thiết - tùy thuộc vào backend setup)
   * Hiện tại chỉ return đường dẫn ảnh local hoặc default
   */
  static processAvatarImage(imageUri: string | null): string {
    // Nếu có ảnh được chọn, return đường dẫn ảnh
    if (imageUri) {
      return imageUri;
    }
    
    // Nếu không có ảnh, dùng ảnh mặc định
    return this.DEFAULT_AVATAR;
  }

  /**
   * Helper method để format phone number (nếu cần)
   */
  static formatPhoneNumber(phone: string): string {
    // Loại bỏ tất cả ký tự không phải số
    const cleaned = phone.replace(/\D/g, '');
    
    // Đảm bảo bắt đầu bằng 0 cho số Việt Nam
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return cleaned;
    }
    
    // Nếu bắt đầu bằng 84, chuyển thành 0
    if (cleaned.length === 11 && cleaned.startsWith('84')) {
      return '0' + cleaned.substring(2);
    }
    
    return cleaned;
  }

  /**
   * Validate dữ liệu trước khi gửi API
   */
  static validateRegisterData(email: string, password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!email || !email.includes('@')) {
      errors.push('Email không hợp lệ');
    }

    if (!password || password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate dữ liệu hồ sơ
   */
  static validateProfileData(name: string, phone: string, gender: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!name || name.trim().length < 2) {
      errors.push('Họ tên phải có ít nhất 2 ký tự');
    }

    const formattedPhone = this.formatPhoneNumber(phone);
    if (!formattedPhone || formattedPhone.length !== 10) {
      errors.push('Số điện thoại không hợp lệ');
    }

    if (!gender) {
      errors.push('Vui lòng chọn giới tính');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export types để sử dụng ở các component khác
export type { ApiResponse, CompleteProfileData, RegisterData, User };
