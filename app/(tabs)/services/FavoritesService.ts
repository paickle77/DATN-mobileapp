import axios from 'axios';
import { getUserData } from '../screens/utils/storage';
import { BASE_URL } from './api';

export interface FavoriteItem {
  _id: string;
  Account_id: string;
  product_id: {
    _id: string;
    name: string;
    // có thể thêm các field khác nếu cần (image, price,...)
  } | string;
}

export interface FavoriteResponse {
  success: boolean;
  message: string;
  data: FavoriteItem[];
}

export interface FavoriteWithNamesResponse {
  msg: string;
  data: {
    _id: string;
    Account_id: string;
    product_names: string[];
  };
}

class FavoriteService {
  // ✅ Lấy danh sách yêu thích theo account
  async getFavoritesByAccount(): Promise<FavoriteWithNamesResponse> {
    const user = await getUserData('userData');
    const accountId = user?._id || user?.accountId;
    if (!accountId) throw new Error('Không tìm thấy accountId');

    const response = await axios.get(`${BASE_URL}/favorites/account/${accountId}`);
    return response.data;
  }

  // ✅ Lấy toàn bộ (nếu là admin)
  async getAll(): Promise<FavoriteResponse> {
    const response = await axios.get(`${BASE_URL}/favorites2`);
    return response.data;
  }

  // ✅ Xoá theo id yêu thích
  async delete(id: string) {
    const response = await axios.delete(`${BASE_URL}/favorites/${id}`);
    return response.data;
  }
}

export const favoriteService = new FavoriteService();
export default favoriteService;
