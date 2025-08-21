// services/ProfileService.ts
import axios from 'axios';
import { getUserData } from '../screens/utils/storage';
import { BASE_URL } from './api';

export interface Users {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  account_id?: string;
}

export interface GetAllResponse {
  success: boolean;
  message: string;
  msg: string;
  data: Users[];
}

class ProfileService {
  

  //lấy thông tin user theo account
  async getProfileByAccountId(accountId: string): Promise<Users | null> {
  try {
    const response = await axios.get(`${BASE_URL}/users/account/${accountId}`);
    return response.data?.data || null;
    
  } catch (error) {
    console.error('❌ Lỗi khi lấy user theo account ID:', error);
    return null;
  }
}
  // Lấy toàn bộ danh sách user (nếu cần)
  async getAll(): Promise<GetAllResponse> {
    try {
      const response = await axios.get(`${BASE_URL}/users`);
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
