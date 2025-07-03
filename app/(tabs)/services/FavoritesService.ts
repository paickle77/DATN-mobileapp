import axios from 'axios';
import { BASE_URL } from './api';

export interface Favorites {
  id: string;
  email: string;
  password: string;
  name?: string;
}

export interface GetAllResponse {
  success: boolean;
  message: string;
  data: Favorites[];
}

class FavoriteAuthService {
  private apiUrl = `${BASE_URL}/favorites2`;

  async getAll(): Promise<GetAllResponse> {
    try {
      const response = await axios.get(this.apiUrl);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const response = await axios.delete(`${BASE_URL}/favorites/${id}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xoá sản phẩm yêu thích:', error);
      throw error;
    }
  }
}

export const favoriteAuthService = new FavoriteAuthService();
export default favoriteAuthService;
