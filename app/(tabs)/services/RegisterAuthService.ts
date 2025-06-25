import axios from 'axios';
import { saveUserData } from '../screens/utils/storage';
import { BASE_URL } from './api';

// Types cho API responses
interface User {
  data: any;
  message: string;
  success: any;
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  gender?: string;
  avatar?: string;
  password?: string;
  google_id?: string;
  facebook_id?: string;
  provider?: 'local' | 'google' | 'facebook';
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

interface RegisterData {
  email: string;
  password?: string; // password không bắt buộc (Google/Facebook không cần)
  name?: string;
  image?: string;
  google_id?: string;
  facebook_id?: string;
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

  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get<ApiResponse<User[]>>(this.USERS_ENDPOINT);
      return response.data.data || [];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách users:', error);
      throw new Error('Không thể lấy danh sách người dùng');
    }
  }

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
   * Đăng ký user local hoặc social (Google/Facebook)
   */
static async registerUser(data: RegisterData): Promise<User> {
  try {
    const emailExists = await this.checkEmailExists(data.email);
    if (emailExists) {
      throw new Error('Email đã tồn tại. Vui lòng dùng tài khoản khác hoặc đăng nhập.');
    }

    const response = await axios.post<ApiResponse<User>>(this.USERS_ENDPOINT, data);

    if (!response.data.data) {
      throw new Error('Không nhận được thông tin user sau khi đăng ký');
    }

    const user = response.data.data;

    // ✅ Lưu user._id vào AsyncStorage
    await saveUserData({ key: 'userId', value: user._id });
    console.log(`Đăng ký thành công với user ID: ${user._id}`);

    return user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Lỗi API khi đăng ký:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Không thể đăng ký. Vui lòng thử lại sau.');
    }
    throw error;
  }
}

  static async registerWithSocial(data: {
  email: string;
  name?: string;
  image?: string;
  provider: 'google' | 'facebook';
  google_id?: string;
  facebook_id?: string;
}): Promise<User> {
  try {
    const response = await axios.post<ApiResponse<User>>(`${this.USERS_ENDPOINT}`, data);

    if (!response.data.data) {
      throw new Error('Không nhận được thông tin user sau khi đăng ký mạng xã hội');
    }

    const user = response.data.data;

    // ✅ Lưu user._id vào AsyncStorage
    await saveUserData({ key: 'userId', value: user._id });

    return user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Lỗi API khi đăng ký mạng xã hội:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Không thể đăng ký bằng mạng xã hội. Vui lòng thử lại sau.');
    }
    throw error;
  }
}

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

  static async updateUserProfile(id: string, profileData: CompleteProfileData): Promise<User> {
    try {
      const finalData = {
        ...profileData,
        avatar: profileData.avatar || this.DEFAULT_AVATAR
      };

      const response = await axios.put<ApiResponse<User>>(`${this.USERS_ENDPOINT}/${id}`, finalData);
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

  static processAvatarImage(imageUri: string | null): string {
    return imageUri || this.DEFAULT_AVATAR;
  }

  static formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10 && cleaned.startsWith('0')) return cleaned;
    if (cleaned.length === 11 && cleaned.startsWith('84')) return '0' + cleaned.substring(2);
    return cleaned;
  }

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

// Export types để sử dụng ở component khác
export type { ApiResponse, CompleteProfileData, RegisterData, User };

