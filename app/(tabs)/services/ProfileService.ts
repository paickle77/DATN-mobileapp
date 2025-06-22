import axios from 'axios';
import { BASE_URL } from './api';

export interface Users {
  _id: string;
  email: string;
  is_lock: boolean;
  password: string;
  isDefault: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
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

  // Lấy danh sách users để login
  async getAll(): Promise<GetAllResponse> {
    try {
      const response = await axios.get(this.apiUrl);
      return response.data; // response.data phải có success, message, data
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      throw error;
    }
  }
}

// Export instance
export const profileService = new ProfileService();
export default profileService;
