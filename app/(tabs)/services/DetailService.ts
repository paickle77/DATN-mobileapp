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
  Account_id: string;
  product_id: {
    _id: string;
  };
}

export interface CartItem {
  _id: string;
  Account_id: string;
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
  Account_id: string | { _id: string; name: string };
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
  private reviewsCache: { [key: string]: Review[] } = {};
  private allReviewsCache: Review[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  async getProductDetails(productId: string): Promise<Product | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/productsandcategoryid`);
      const products = response.data.data || response.data;
      return products.find((item: Product) => item._id === productId) || null;
    } catch (error) {
      console.error('❌ Lỗi khi lấy thông tin sản phẩm:', error);
      throw new Error('Lỗi khi tải dữ liệu sản phẩm');
    }
  }

  async getProductSizes(productId: string): Promise<Size[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/sizes`);
      const allSizes = response.data.data || response.data;
      return allSizes.filter((size: Size) => size.product_id === productId);
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách size:', error);
      throw new Error('Lỗi khi tải danh sách size');
    }
  }

  async checkFavoriteStatus(accountId: string, productId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/favorites2`);
      const favorites = response.data.data;
      return favorites.some(
        (item: Favorite) => item.Account_id === accountId && item.product_id?._id === productId
      );
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra trạng thái yêu thích:', error);
      return false;
    }
  }

  async addToFavorites(accountId: string, productId: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/favorites`, {
        Account_id: accountId,
        product_id: productId
      });
    } catch (error) {
      console.error('❌ Lỗi khi thêm vào yêu thích:', error);
      throw new Error('Không thể thêm vào danh sách yêu thích');
    }
  }

  async removeFromFavorites(accountId: string, productId: string): Promise<void> {
    try {
      const response = await axios.get(`${this.baseUrl}/favorites2`);
      const favorites = response.data.data;
      const foundFavorite = favorites.find(
        (item: Favorite) => item.Account_id === accountId && item.product_id?._id === productId
      );
      if (foundFavorite) {
        await axios.delete(`${this.baseUrl}/favorites/${foundFavorite._id}`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi xóa khỏi yêu thích:', error);
      throw new Error('Không thể xóa khỏi danh sách yêu thích');
    }
  }

  async toggleFavorite(accountId: string, productId: string): Promise<{ isAdded: boolean }> {
    try {
      const response = await axios.get(`${this.baseUrl}/favorites2`);
      const favorites = response.data.data;
      const foundFavorite = favorites.find(
        (item: Favorite) => item.Account_id === accountId && item.product_id?._id === productId
      );
      if (foundFavorite) {
        await axios.delete(`${this.baseUrl}/favorites/${foundFavorite._id}`);
        return { isAdded: false };
      } else {
        await axios.post(`${this.baseUrl}/favorites`, {
          Account_id: accountId,
          product_id: productId
        });
        return { isAdded: true };
      }
    } catch (error) {
      console.error('❌ Lỗi khi toggle yêu thích:', error);
      throw new Error('Không thể cập nhật danh sách yêu thích');
    }
  }

  async getCartItems(): Promise<CartItem[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/GetAllCarts`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy giỏ hàng:', error);
      throw new Error('Lỗi khi tải giỏ hàng');
    }
  }

  async addToCart(accountId: string, productId: string, sizeId: string, quantity: number): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/addtocarts`, {
        Account_id: accountId,
        product_id: productId,
        size_id: sizeId,
        quantity
      });
    } catch (error) {
      console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
      throw new Error('Không thể thêm vào giỏ hàng');
    }
  }

  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<void> {
    try {
      await axios.put(`${this.baseUrl}/carts/${cartItemId}`, { quantity });
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật giỏ hàng:', error);
      throw new Error('Không thể cập nhật giỏ hàng');
    }
  }

  async handleAddToCart(accountId: string, productId: string, sizeId: string, quantity: number): Promise<{ isUpdate: boolean; totalQuantity: number }> {
    try {
      const cartItems = await this.getCartItems();
      const existingCartItem = cartItems.find(
        (item: CartItem) => item.Account_id === accountId && item.product_id?._id === productId && item.size_id?._id === sizeId
      );
      if (existingCartItem) {
        const updatedQuantity = existingCartItem.quantity + quantity;
        await this.updateCartItemQuantity(existingCartItem._id, updatedQuantity);
        return { isUpdate: true, totalQuantity: updatedQuantity };
      } else {
        await this.addToCart(accountId, productId, sizeId, quantity);
        return { isUpdate: false, totalQuantity: quantity };
      }
    } catch (error) {
      console.error('❌ Lỗi khi xử lý giỏ hàng:', error);
      throw new Error('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  }

  async getAllReviews(forceRefresh: boolean = false): Promise<Review[]> {
    const now = Date.now();
    if (!forceRefresh && this.allReviewsCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.allReviewsCache;
    }
    try {
      const response = await axios.get(`${this.baseUrl}/GetAllReview`);
      const allReviews = response.data.data || [];
      this.allReviewsCache = allReviews;
      this.cacheTimestamp = now;
      return allReviews;
    } catch (error) {
      console.error('❌ Lỗi khi lấy tất cả đánh giá:', error);
      return this.allReviewsCache || [];
    }
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    try {
      if (this.reviewsCache[productId]) {
        return this.reviewsCache[productId];
      }
      const allReviews = await this.getAllReviews();
      const productReviews = allReviews.filter(review => {
        const reviewProductId = typeof review.product_id === 'object' ? review.product_id._id : review.product_id;
        return reviewProductId === productId;
      });
      this.reviewsCache[productId] = productReviews;
      return productReviews;
    } catch (error) {
      console.error('❌ Lỗi khi lấy đánh giá sản phẩm:', error);
      throw new Error('Lỗi khi tải đánh giá sản phẩm');
    }
  }

  async getUserInfo(accountId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/accounts/${accountId}`);
      return response.data.data?.email || 'Người dùng';
    } catch (error) {
      console.error('❌ Lỗi khi lấy thông tin user:', error);
      return 'Người dùng';
    }
  }

  async getReviewSummary(productId: string): Promise<ReviewSummary> {
    try {
      const reviews = await this.getProductReviews(productId);
      if (reviews.length === 0) {
        return { averageRating: 0, totalReviews: 0, reviews: [] };
      }
      const avg = reviews.reduce((sum, r) => sum + r.star_rating, 0) / reviews.length;
      return {
        averageRating: Math.round(avg * 10) / 10,
        totalReviews: reviews.length,
        reviews,
      };
    } catch (error) {
      console.error('❌ Lỗi khi tính toán tóm tắt đánh giá:', error);
      return { averageRating: 0, totalReviews: 0, reviews: [] };
    }
  }

  async getReviewsWithUserInfo(productId: string): Promise<Review[]> {
    try {
      const reviews = await this.getProductReviews(productId);
      const enrichedReviews = await Promise.all(
        reviews.map(async (review) => {
          if (typeof review.Account_id === 'string') {
            const name = await this.getUserInfo(review.Account_id);
            return {
              ...review,
              Account_id: {
                _id: review.Account_id,
                name: name,
              },
            };
          }
          return review;
        })
      );
      return enrichedReviews;
    } catch (error) {
      console.error('❌ Lỗi khi enrich review:', error);
      throw new Error('Không thể enrich đánh giá');
    }
  }

  clearCache(): void {
    this.reviewsCache = {};
    this.allReviewsCache = null;
    this.cacheTimestamp = 0;
  }

  async refreshCache(): Promise<void> {
    await this.getAllReviews(true);
  }
}

export const detailService = new DetailService();
export default detailService;
