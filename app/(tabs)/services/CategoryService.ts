import axios from 'axios';
import { BASE_URL } from './api';

export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data?: Category[];
}

class CategoryService {
  private categoryUrl = `${BASE_URL}/categories`;

  // Lấy tất cả danh mục
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await axios.get(this.categoryUrl);

      if (response.data && Array.isArray(response.data.data)) {
        console.log('Lấy danh sách danh mục thành công');
        return response.data.data;
      }

      throw new Error('Không có dữ liệu danh mục');
    } catch (error) {
      console.error('Lỗi khi lấy danh mục:', error);
      throw error;
    }
  }
}

// Export instance
export const categoryService = new CategoryService();
export default categoryService;
