import axios from 'axios';
import { saveUserData } from '../screens/utils/storage';
import { BASE_URL } from './api';

// Types cho API responses
interface User {
  _id: string;
  account_id?: string;
  email?: string;
  name?: string;
  phone?: string;
  gender?: string;
  avatar?: string;
  password?: string;
  google_id?: string;
  facebook_id?: string;
  provider?: 'local' | 'google' | 'facebook';
}

interface Account {
  _id: string;
  email: string;
  role: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

interface RegisterData {
  email: string;
  password?: string;
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
  private static readonly DEFAULT_AVATAR = 'avatarmacdinh.png';

  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get<ApiResponse<User[]>>(`${BASE_URL}/users`);
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
   * ✅ SỬA: Đăng ký user - trả về account thay vì user
   */
  static async registerUser(data: RegisterData): Promise<Account> {
    try {
      console.log('📝 Đăng ký với data:', data);

      // ✅ Gọi đúng route để đăng ký
      const response = await axios.post<ApiResponse<Account>>(`${BASE_URL}/register`, data);

      if (!response.data.data) {
        throw new Error('Không nhận được thông tin account sau khi đăng ký');
      }

      const account = response.data.data;

      // ✅ Lưu account._id vào AsyncStorage
      await saveUserData({ key: 'userData', value: account._id });
      console.log(`✅ Đăng ký thành công với account ID: ${account._id}`);

      return account;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Lỗi API khi đăng ký:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể đăng ký. Vui lòng thử lại sau.');
      }
      throw error;
    }
  }

  /**
   * ✅ SỬA: Lấy thông tin user bằng account_id
   */
  static async getUserByAccountId(account_id: string): Promise<User | null> {
    try {
      console.log('🔍 Tìm user với account_id:', account_id);
      
      const response = await axios.get<ApiResponse<User>>(`${BASE_URL}/users/account/${account_id}`);
      
      if (!response.data.success || !response.data.data) {
        console.log('❌ Không tìm thấy user với account_id:', account_id);
        return null;
      }
      
      console.log('✅ Tìm thấy user:', response.data.data._id);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('ℹ️ User chưa tạo profile');
        return null;
      }
      console.error('❌ Lỗi khi lấy thông tin user:', error);
      throw new Error('Không thể lấy thông tin người dùng');
    }
  }

  /**
   * ✅ SỬA: Tạo hồ sơ user profile
   */
  static async createUserProfile(account_id: string, profile: CompleteProfileData): Promise<User> {
    try {
      console.log('📝 Tạo profile với:', { account_id, ...profile });

      const body = {
        account_id,
        ...profile,
        avatar: profile.avatar || this.DEFAULT_AVATAR
      };

      const response = await axios.post<ApiResponse<User>>(`${BASE_URL}/users/profile`, body);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tạo hồ sơ người dùng');
      }

      console.log('✅ Tạo profile thành công:', response.data.data._id);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Lỗi API khi tạo profile:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể tạo hồ sơ người dùng');
      }
      throw error;
    }
  }

  /**
   * ✅ SỬA: Cập nhật hồ sơ user (dùng user_id)
   */
  static async updateUserProfile(user_id: string, profileData: Partial<CompleteProfileData>): Promise<User> {
    try {
      console.log('📝 Cập nhật profile user_id:', user_id, 'với data:', profileData);

      const finalData = {
        ...profileData,
        avatar: profileData.avatar || this.DEFAULT_AVATAR
      };

      const response = await axios.put<ApiResponse<User>>(`${BASE_URL}/users/${user_id}`, finalData);
      
      if (!response.data.data) {
        throw new Error('Không nhận được thông tin user sau khi cập nhật');
      }

      console.log('✅ Cập nhật profile thành công');
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Lỗi API khi cập nhật hồ sơ:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật hồ sơ');
      }
      throw error;
    }
  }

  /**
   * ✅ THÊM: Lấy URL avatar
   */
  static getAvatarUrl(avatar: string): string {
    if (!avatar || avatar === this.DEFAULT_AVATAR) {
      return this.DEFAULT_AVATAR;
    }
    
    // Nếu là base64 hoặc local URI
    if (avatar.startsWith('data:') || avatar.startsWith('file:')) {
      return avatar;
    }
    
    // Nếu là URL đầy đủ
    if (avatar.startsWith('http')) {
      return avatar;
    }
    
    // Nếu là filename, tạo URL từ server
    return `${BASE_URL}/uploads/avatars/${avatar}`;
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

// Export types
export type { Account, ApiResponse, CompleteProfileData, RegisterData, User };
