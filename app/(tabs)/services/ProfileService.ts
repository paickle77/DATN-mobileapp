// services/ProfileService.ts
import axios from 'axios';
import { getUserData } from '../screens/utils/storage';
import { BASE_URL } from './api';

export interface Users {
  _id: string;
  email: string;
  is_lock: boolean;
  password: string;
  isDefault: boolean;
  created_at: string;
  updated_at: string;
  __v: number;
  name: string;
  phone: string;
}

export interface GetAllResponse {
  success: boolean;
  message: string;
  msg: string;
  data: Users[];
}

class ProfileService {
  private apiUrl = `${BASE_URL}/users`;

  // Lấy toàn bộ danh sách user (nếu cần)
  async getAll(): Promise<GetAllResponse> {
    try {
      const response = await axios.get(this.apiUrl);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách người dùng:', error);
      throw error;
    }
  }

  // ✅ Lấy thông tin người dùng hiện tại từ AsyncStorage và API
  async getCurrentUserProfile(): Promise<Users | null> {
    try {
      const user = await getUserData('userData');
      if (!user || !user) {
        console.warn('⚠️ Không tìm thấy user từ AsyncStorage');
        return null;
      }

      const result = await this.getAll();
      if (result.success && result.data.length > 0) {
        const found = result.data.find((u) => String(u._id) === String(user));
        return found || null;
      }

      return null;
    } catch (error) {
      console.error('❌ Lỗi khi lấy user hiện tại:', error);
      return null;
    }
  }
}

export const profileService = new ProfileService();
export default profileService;
