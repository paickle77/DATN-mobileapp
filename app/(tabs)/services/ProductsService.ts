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
  category_id: string | Category; // Có thể là string hoặc populated object
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data?: Product[];
}

export interface SingleProductResponse {
  success: boolean;
  message: string;
  data?: Product;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data?: Category[];
}

class ProductService {
  private apiUrl = `${BASE_URL}/productsandcategoryid`;
  private categoryUrl = `${BASE_URL}/categories`;

  // Lấy danh sách tất cả sản phẩm
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(this.apiUrl);
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log('Lấy sản phẩm thành công');
        console.log("Dữ liệu API:", response.data.data);
        return response.data.data;
      }

      throw new Error('Không có dữ liệu sản phẩm');
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
      throw error;
    }
  }

  // Lấy sản phẩm theo category ID
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      const response = await axios.get(`${this.apiUrl}?category_id=${categoryId}`);
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log(`Lấy sản phẩm category ${categoryId} thành công`);
        return response.data.data;
      }

      // Fallback: Lấy tất cả sản phẩm và filter theo category
      const allProducts = await this.getAllProducts();
      const filteredProducts = allProducts.filter(product => {
        if (typeof product.category_id === 'string') {
          return product.category_id === categoryId;
        } else if (typeof product.category_id === 'object' && product.category_id !== null) {
          return product.category_id._id === categoryId;
        }
        return false;
      });

      console.log(`Filtered products for category ${categoryId}:`, filteredProducts);
      return filteredProducts;
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm theo category:', error);
      throw error;
    }
  }

  // Lấy chi tiết sản phẩm theo ID
  async getProductById(productId: string): Promise<Product> {
    try {
      const response = await axios.get(`${this.apiUrl}/${productId}`);
      
      if (response.data && response.data.data) {
        console.log('Lấy chi tiết sản phẩm thành công');
        return response.data.data;
      }

      throw new Error('Không tìm thấy sản phẩm');
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      throw error;
    }
  }

  // Tìm kiếm sản phẩm theo tên
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const response = await axios.get(`${this.apiUrl}?search=${encodeURIComponent(searchTerm)}`);
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log('Tìm kiếm sản phẩm thành công');
        return response.data.data;
      }

      // Fallback: Lấy tất cả sản phẩm và filter theo tên
      const allProducts = await this.getAllProducts();
      const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filteredProducts;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sản phẩm:', error);
      throw error;
    }
  }

  // Lấy sản phẩm theo branch ID
  async getProductsByBranch(branchId: string): Promise<Product[]> {
    try {
      const response = await axios.get(`${this.apiUrl}?branch_id=${branchId}`);
      
      if (response.data && Array.isArray(response.data.data)) {
        console.log(`Lấy sản phẩm branch ${branchId} thành công`);
        return response.data.data;
      }

      // Fallback: Filter từ tất cả sản phẩm
      const allProducts = await this.getAllProducts();
      return allProducts.filter(product => product.branch_id === branchId);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm theo branch:', error);
      throw error;
    }
  }

  // Lấy sản phẩm có giảm giá
  async getDiscountedProducts(): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts.filter(product => 
        product.discount_price && product.discount_price > 0 && product.discount_price < product.price
      );
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm giảm giá:', error);
      throw error;
    }
  }

  // Lấy sản phẩm mới nhất (giả sử có trường created_at)
  async getLatestProducts(limit: number = 10): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      // Giả sử API trả về sản phẩm đã được sort theo thời gian
      return allProducts.slice(0, limit);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm mới nhất:', error);
      throw error;
    }
  }

  // Lấy sản phẩm theo rating
  async getTopRatedProducts(limit: number = 10): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      const sortedProducts = allProducts.sort((a, b) => {
        const ratingA = parseFloat(a.rating) || 0;
        const ratingB = parseFloat(b.rating) || 0;
        return ratingB - ratingA;
      });
      return sortedProducts.slice(0, limit);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm rating cao:', error);
      throw error;
    }
  }

  // Lấy sản phẩm còn hàng
  async getInStockProducts(): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts.filter(product => product.stock > 0 && product.is_active);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm còn hàng:', error);
      throw error;
    }
  }

  // Filter sản phẩm theo nhiều điều kiện
  async filterProducts(filters: {
    categoryId?: string;
    branchId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    hasDiscount?: boolean;
    searchTerm?: string;
  }): Promise<Product[]> {
    try {
      let products = await this.getAllProducts();

      // Apply filters
      if (filters.categoryId) {
        products = products.filter(product => {
          if (typeof product.category_id === 'string') {
            return product.category_id === filters.categoryId;
          } else if (typeof product.category_id === 'object' && product.category_id !== null) {
            return product.category_id._id === filters.categoryId;
          }
          return false;
        });
      }

      if (filters.branchId) {
        products = products.filter(product => product.branch_id === filters.branchId);
      }

      if (filters.minPrice !== undefined) {
        products = products.filter(product => product.price >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        products = products.filter(product => product.price <= filters.maxPrice!);
      }

      if (filters.minRating !== undefined) {
        products = products.filter(product => parseFloat(product.rating) >= filters.minRating!);
      }

      if (filters.inStock) {
        products = products.filter(product => product.stock > 0);
      }

      if (filters.hasDiscount) {
        products = products.filter(product => 
          product.discount_price && product.discount_price > 0 && product.discount_price < product.price
        );
      }

      if (filters.searchTerm) {
        products = products.filter(product => 
          product.name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          product.description.toLowerCase().includes(filters.searchTerm!.toLowerCase())
        );
      }

      return products.filter(product => product.is_active);
    } catch (error) {
      console.error('Lỗi khi filter sản phẩm:', error);
      throw error;
    }
  }

  // Utility method để format price
  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + ' vnđ';
  }

  // Utility method để tính phần trăm giảm giá
  calculateDiscountPercentage(originalPrice: number, discountPrice: number): number {
    if (!discountPrice || discountPrice >= originalPrice) return 0;
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  }

  // Utility method để check sản phẩm có giảm giá không
  hasDiscount(product: Product): boolean {
    return !!(product.discount_price && product.discount_price > 0 && product.discount_price < product.price);
  }

  // Utility method để get final price
  getFinalPrice(product: Product): number {
    return this.hasDiscount(product) ? product.discount_price : product.price;
  }
}

// Export instance
export const productService = new ProductService();
export default productService;