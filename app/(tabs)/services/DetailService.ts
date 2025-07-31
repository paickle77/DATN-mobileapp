import axios from 'axios';
import { BASE_URL } from './api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number;
  image_url: string;
  rating: number;
  is_active: boolean;
  category_id: {
    _id: string;
    name: string;
  };
  ingredient_id: {
    _id: string;
    name: string;
  }[];
}

export interface Size {
  _id: string;
  product_id: string;
  quantity: number;
  size: string;
  price_increase: number;
}

export interface Favorite {
  _id: string;
  user_id: string;
  product_id: {
    _id: string;
  };
}

export interface CartItem {
  _id: string;
  user_id: string;
  product_id: {
    _id: string;
  };
  size_id: {
    _id: string;
  };
  quantity: number;
}

export interface Review {
  _id: string;
  user_id: string | { _id: string; name: string };
  product_id: string | { _id: string };
  review_date: string;
  star_rating: number;
  content: string;
  image?: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class DetailService {
  public baseUrl = BASE_URL;
  
  // Cache để tối ưu hóa
  private reviewsCache: { [key: string]: Review[] } = {};
  private allReviewsCache: Review[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 phút

  /**
   * Lấy thông tin chi tiết sản phẩm theo ID
   */
  async getProductDetails(productId: string): Promise<Product | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/productsandcategoryid`);
      const products = response.data.data || response.data;
      const foundProduct = products.find((item: Product) => item._id === productId);
      return foundProduct || null;
    } catch (error) {
      console.error('❌ Lỗi khi lấy thông tin sản phẩm:', error);
      throw new Error('Lỗi khi tải dữ liệu sản phẩm');
    }
  }

  /**
   * Lấy danh sách size theo product ID
   */
  async getProductSizes(productId: string): Promise<Size[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/sizes`);
      const allSizes = response.data.data || response.data;
      console.log(productId, 'Tìm kiếm size cho sản phẩm');
      const foundSizes = allSizes.filter((size: Size) => size.product_id === productId);
      console.log('Danh sách size tìm thấy:', foundSizes);
      return foundSizes;
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách size:', error);
      throw new Error('Lỗi khi tải danh sách size');
    }
  }

  /**
   * Kiểm tra trạng thái yêu thích của sản phẩm
   */
  async checkFavoriteStatus(userId: string, productId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/favorites2`);
      const favorites = response.data.data;
      const foundFavorite = favorites.find(
        (item: Favorite) => item.user_id === userId && item.product_id?._id === productId
      );
      return !!foundFavorite;
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra trạng thái yêu thích:', error);
      return false;
    }
  }

  /**
   * Thêm sản phẩm vào danh sách yêu thích
   */
  async addToFavorites(userId: string, productId: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/favorites`, {
        user_id: userId,
        product_id: productId
      });
    } catch (error) {
      console.error('❌ Lỗi khi thêm vào yêu thích:', error);
      throw new Error('Không thể thêm vào danh sách yêu thích');
    }
  }

  /**
   * Xóa sản phẩm khỏi danh sách yêu thích
   */
  async removeFromFavorites(userId: string, productId: string): Promise<void> {
    try {
      const response = await axios.get(`${this.baseUrl}/favorites2`);
      const favorites = response.data.data;
      const foundFavorite = favorites.find(
        (item: Favorite) => item.user_id === userId && item.product_id?._id === productId
      );
      
      if (foundFavorite) {
        await axios.delete(`${this.baseUrl}/favorites/${foundFavorite._id}`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi xóa khỏi yêu thích:', error);
      throw new Error('Không thể xóa khỏi danh sách yêu thích');
    }
  }

  /**
   * Toggle trạng thái yêu thích
   */
  async toggleFavorite(userId: string, productId: string): Promise<{ isAdded: boolean }> {
    try {
      const response = await axios.get(`${this.baseUrl}/favorites2`);
      const favorites = response.data.data;
      const foundFavorite = favorites.find(
        (item: Favorite) => item.user_id === userId && item.product_id?._id === productId
      );

      if (foundFavorite) {
        await axios.delete(`${this.baseUrl}/favorites/${foundFavorite._id}`);
        return { isAdded: false };
      } else {
        await axios.post(`${this.baseUrl}/favorites`, {
          user_id: userId,
          product_id: productId
        });
        return { isAdded: true };
      }
    } catch (error) {
      console.error('❌ Lỗi khi toggle yêu thích:', error);
      throw new Error('Không thể cập nhật danh sách yêu thích');
    }
  }

  /**
   * Lấy danh sách giỏ hàng
   */
  async getCartItems(): Promise<CartItem[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/GetAllCarts`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy giỏ hàng:', error);
      throw new Error('Lỗi khi tải giỏ hàng');
    }
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addToCart(userId: string, productId: string, sizeId: string, quantity: number): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/addtocarts`, {
        user_id: userId,
        product_id: productId,
        size_id: sizeId,
        quantity: quantity
      });
    } catch (error) {
      console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
      throw new Error('Không thể thêm vào giỏ hàng');
    }
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<void> {
    try {
      await axios.put(`${this.baseUrl}/carts/${cartItemId}`, {
        quantity: quantity
      });
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật giỏ hàng:', error);
      throw new Error('Không thể cập nhật giỏ hàng');
    }
  }

  /**
   * Xử lý thêm vào giỏ hàng (kiểm tra tồn tại và cập nhật)
   */
  async handleAddToCart(
    userId: string, 
    productId: string, 
    sizeId: string, 
    quantity: number
  ): Promise<{ isUpdate: boolean; totalQuantity: number }> {
    try {
      const cartItems = await this.getCartItems();
      
      const existingCartItem = cartItems.find(
        (item: CartItem) =>
          item.user_id === userId &&
          item.product_id?._id === productId &&
          item.size_id?._id === sizeId
      );

      if (existingCartItem) {
        const updatedQuantity = existingCartItem.quantity + quantity;
        await this.updateCartItemQuantity(existingCartItem._id, updatedQuantity);
        return { isUpdate: true, totalQuantity: updatedQuantity };
      } else {
        await this.addToCart(userId, productId, sizeId, quantity);
        return { isUpdate: false, totalQuantity: quantity };
      }
    } catch (error) {
      console.error('❌ Lỗi khi xử lý giỏ hàng:', error);
      throw new Error('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  }

  /**
   * ✨ TỐI ƯU HÓA: Lấy tất cả đánh giá một lần với cache
   */
  async getAllReviews(forceRefresh: boolean = false): Promise<Review[]> {
    const now = Date.now();
    
    // Kiểm tra cache
    if (!forceRefresh && this.allReviewsCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('📱 Sử dụng cache reviews');
      return this.allReviewsCache;
    }

    try {
      console.log('🔄 Đang tải tất cả reviews từ API...');
      const response = await axios.get(`${this.baseUrl}/GetAllReview`);
      const allReviews = response.data.data || [];
      
      // Cập nhật cache
      this.allReviewsCache = allReviews;
      this.cacheTimestamp = now;
      
      console.log(`✅ Đã cache ${allReviews.length} reviews`);
      return allReviews;
    } catch (error) {
      console.error('❌ Lỗi khi lấy tất cả đánh giá:', error);
      // Trả về cache cũ nếu có lỗi
      return this.allReviewsCache || [];
    }
  }

  /**
   * ✨ TỐI ƯU HÓA: Tính toán tất cả ratings một lần
   */
  async calculateAllProductRatings(productIds: string[]): Promise<{ [key: string]: number }> {
    try {
      const allReviews = await this.getAllReviews();
      const ratingsMap: { [key: string]: number } = {};

      // Khởi tạo tất cả products với rating 0
      productIds.forEach(productId => {
        ratingsMap[productId] = 0;
      });

      // Group reviews theo product_id
      const reviewsByProduct: { [key: string]: Review[] } = {};
      
      allReviews.forEach(review => {
        const productId = typeof review.product_id === 'object' 
          ? review.product_id._id 
          : review.product_id;
        
        if (productIds.includes(productId)) {
          if (!reviewsByProduct[productId]) {
            reviewsByProduct[productId] = [];
          }
          reviewsByProduct[productId].push(review);
        }
      });

      // Tính rating trung bình cho từng sản phẩm
      Object.keys(reviewsByProduct).forEach(productId => {
        const reviews = reviewsByProduct[productId];
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + (review.star_rating || 0), 0);
          ratingsMap[productId] = Math.round((totalRating / reviews.length) * 10) / 10;
        }
      });

      console.log(`📊 Đã tính rating cho ${Object.keys(ratingsMap).length} sản phẩm`);
      return ratingsMap;
    } catch (error) {
      console.error('❌ Lỗi khi tính toán ratings:', error);
      // Fallback: tạo ratings mặc định
      const fallbackRatings: { [key: string]: number } = {};
      productIds.forEach(productId => {
        fallbackRatings[productId] = 0;
      });
      return fallbackRatings;
    }
  }

  /**
   * Lấy tất cả đánh giá của sản phẩm (sử dụng cache)
   */
  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      // Kiểm tra cache riêng cho sản phẩm này
      if (this.reviewsCache[productId]) {
        console.log(`📱 Sử dụng cache reviews cho sản phẩm ${productId}`);
        return this.reviewsCache[productId];
      }

      const allReviews = await this.getAllReviews();
      const productReviews = allReviews.filter(review => {
        const reviewProductId = typeof review.product_id === 'object' 
          ? review.product_id._id 
          : review.product_id;
        return reviewProductId === productId;
      });

      // Cache kết quả
      this.reviewsCache[productId] = productReviews;
      
      return productReviews;
    } catch (error) {
      console.error('❌ Lỗi khi lấy đánh giá sản phẩm:', error);
      throw new Error('Lỗi khi tải đánh giá sản phẩm');
    }
  }

  /**
   * Lấy thông tin user theo ID
   */
  async getUserInfo(userId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${userId}`);
      return response.data.data?.name || 'Khách hàng';
    } catch (error) {
      console.error('❌ Lỗi khi lấy thông tin user:', error);
      return 'Khách hàng';
    }
  }

  /**
   * ✨ TỐI ƯU HÓA: Lấy tóm tắt đánh giá sản phẩm (sử dụng cache)
   */
  async getReviewSummary(productId: string): Promise<ReviewSummary> {
    try {
      const reviews = await this.getProductReviews(productId);
      
      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          reviews: []
        };
      }

      const averageRating = reviews.reduce((sum, review) => sum + review.star_rating, 0) / reviews.length;
      
      return {
        averageRating: Math.round(averageRating * 10) / 10, // Làm tròn 1 chữ số thập phân
        totalReviews: reviews.length,
        reviews: reviews
      };
    } catch (error) {
      console.error('❌ Lỗi khi tính toán tóm tắt đánh giá:', error);
      return {
        averageRating: 0,
        totalReviews: 0,
        reviews: []
      };
    }
  }

  /**
   * Lấy đánh giá với thông tin user đã populate
   */
  async getReviewsWithUserInfo(productId: string): Promise<Review[]> {
    try {
      const reviews = await this.getProductReviews(productId);
      
      // Lấy thông tin user cho các review chưa có thông tin user
      const reviewsWithUserInfo = await Promise.all(
        reviews.map(async (review) => {
          if (typeof review.user_id === 'string') {
            try {
              const userName = await this.getUserInfo(review.user_id);
              return {
                ...review,
                user_id: {
                  _id: review.user_id,
                  name: userName
                }
              };
            } catch (error) {
              return {
                ...review,
                user_id: {
                  _id: review.user_id,
                  name: 'Khách hàng'
                }
              };
            }
          }
          return review;
        })
      );

      return reviewsWithUserInfo;
    } catch (error) {
      console.error('❌ Lỗi khi lấy đánh giá với thông tin user:', error);
      throw new Error('Lỗi khi tải thông tin đánh giá');
    }
  }

  /**
   * ✨ TÍNH NĂNG MỚI: Xóa cache khi cần
   */
  clearCache(): void {
    this.reviewsCache = {};
    this.allReviewsCache = null;
    this.cacheTimestamp = 0;
    console.log('🗑️ Đã xóa cache reviews');
  }

  /**
   * ✨ TÍNH NĂNG MỚI: Refresh cache
   */
  async refreshCache(): Promise<void> {
    console.log('🔄 Đang refresh cache...');
    await this.getAllReviews(true);
  }
}

// Export instance
export const detailService = new DetailService();
export default detailService;