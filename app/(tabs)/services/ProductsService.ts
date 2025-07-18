import axios from 'axios';
import { BASE_URL } from './api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number;
  image_url: string;
  branch_id: string;
  is_active: boolean;
  rating: string;
  stock: number;
  ingredient_id: string;
  category_id: string;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data?: Product[];
}

class ProductService {
  private apiUrl = `${BASE_URL}/productsandcategoryid`;  // Đúng đường dẫn API cho sản phẩm

  // Lấy danh sách sản phẩm
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(this.apiUrl);
      
      if (response.data && Array.isArray(response.data.data)) {
        // console.log('Lấy sản phẩm thành công');
        // console.log("Dữ liệu API:",response.data.data)
        return response.data.data;
      }

      throw new Error('Không có dữ liệu sản phẩm');
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
      throw error;
    }
  }
}

// Export instance
export const productService = new ProductService();
export default productService;
