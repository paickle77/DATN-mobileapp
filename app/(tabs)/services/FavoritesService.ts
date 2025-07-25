
import axios from 'axios';
import { BASE_URL } from './api';


export interface Favorites {
  id: string;
  email: string;
  password: string;
  name?: string;
}

export interface GetAllResponse  {
  success: boolean;
  message: string;
    data: Favorites[];
}

class FavoriteAuthService {
  private apiUrl = `${BASE_URL}/favorites2`;

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
export const favoriteAuthService = new FavoriteAuthService();
export default favoriteAuthService;