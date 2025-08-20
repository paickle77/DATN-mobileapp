// services/ReviewService.ts
import axios from 'axios';
import { BASE_URL } from './api';
import { detailService } from './DetailService';
import { ratingService } from './RatingService';

export interface ProductReviewStatus {
  billDetailId: string;
  productId: string | null;
  productName: string;
  hasReviewed: boolean;
  reviewId: string | null;
  canReview: boolean;
}

export interface BillReviewStatus {
  billId: string;
  billStatus: string;
  canReview: boolean;
  allReviewed: boolean;
  totalProducts: number;
  reviewedProducts: number;
  products: ProductReviewStatus[];
}

class ReviewService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(billId: string, accountId: string): string {
    return `bill_review_${billId}_${accountId}`;
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  /**
   * Kiểm tra trạng thái review cho toàn bộ bill
   */
  async checkBillReviewStatus(billId: string, accountId: string): Promise<BillReviewStatus> {
    const cacheKey = this.getCacheKey(billId, accountId);
    const cached = this.cache.get(cacheKey);

    // DISABLE cache tạm thời để debug
    // if (cached && this.isValidCache(cached.timestamp)) {
    //   console.log('🔄 Using cached review status');
    //   return cached.data;
    // }

    try {
      console.log(`🔍 Fetching review status for bill ${billId}, account ${accountId}`);
      
      const response = await axios.get(
        `${BASE_URL}/bill-review-status/${billId}/${accountId}`
      );

      if (response.data && response.data.data) {
        const result = response.data.data as BillReviewStatus;
        
        console.log('✅ Review status response:', JSON.stringify(result, null, 2));
        
        // Cache result
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });

        return result;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error checking bill review status:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái review cho một sản phẩm cụ thể trong bill
   */
  async checkProductReviewInBill(
    billId: string, 
    productId: string, 
    accountId: string
  ): Promise<{
    billId: string;
    productId: string;
    hasReviewed: boolean;
    reviewId: string | null;
    canReview: boolean;
    billStatus: string;
  }> {
    try {
      const response = await axios.get(
        `${BASE_URL}/product-review-status/${billId}/${productId}/${accountId}`
      );

      if (response.data && response.data.data) {
        return response.data.data;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error checking product review status:', error);
      throw error;
    }
  }

  /**
   * Submit review mới
   */
  async submitReview(reviewData: {
    product_id: string;
    star_rating: number;
    content: string;
    image?: string | null;
    Account_id: string;
  }): Promise<any> {
    try {
      const response = await axios.post(`${BASE_URL}/reviews`, reviewData);
      
      // Xóa tất cả cache liên quan đến product này
      this.clearCacheForProduct(reviewData.product_id);
      
      console.log(`✅ Review submitted và cache cleared cho product ${reviewData.product_id}`);
      
      return response.data;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }

  /**
   * Xóa cache cho một sản phẩm cụ thể
   */
  private clearCacheForProduct(productId: string): void {
    // 1. Xóa cache trong ReviewService
    const keysToDelete: string[] = [];
    
    for (const [key, value] of this.cache.entries()) {
      // Kiểm tra nếu cache này liên quan đến productId
      if (key.includes(productId) || 
          (value.data && value.data.products && 
           value.data.products.some((p: any) => p.productId === productId))) {
        keysToDelete.push(key);
      }
    }
    
    // Xóa các cache entries trong ReviewService
    keysToDelete.forEach(key => {
      console.log(`🗑️ [ReviewService] Clearing cache key: ${key}`);
      this.cache.delete(key);
    });
    
    // 2. Xóa cache trong DetailService
    try {
      detailService.clearProductCache(productId);
      console.log(`�️ [DetailService] Cleared cache for product ${productId}`);
    } catch (error) {
      console.error(`❌ Error clearing DetailService cache for product ${productId}:`, error);
    }
    
    // 3. Xóa cache trong RatingService
    try {
      ratingService.clearProductCache(productId);
      console.log(`🗑️ [RatingService] Cleared cache for product ${productId}`);
    } catch (error) {
      console.error(`❌ Error clearing RatingService cache for product ${productId}:`, error);
    }
    
    console.log(`🔄 Cleared caches for product ${productId} across all services`);
  }

  /**
   * Xóa cache cho một bill cụ thể
   */
  clearCacheForBill(billId: string): void {
    for (const [key] of this.cache.entries()) {
      if (key.includes(`bill_review_${billId}_`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Xóa toàn bộ cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Refresh cache cho một bill cụ thể
   */
  async refreshBillReviewStatus(billId: string, accountId: string): Promise<BillReviewStatus> {
    const cacheKey = this.getCacheKey(billId, accountId);
    this.cache.delete(cacheKey);
    return this.checkBillReviewStatus(billId, accountId);
  }
}

export default new ReviewService();
