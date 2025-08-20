import axios from 'axios';
import { BASE_URL } from './api';

export interface RatingData {
  averageRating: number;
  totalReviews: number;
}

export interface BatchRatingsResponse {
  [productId: string]: RatingData;
}

class RatingService {
  private baseUrl = BASE_URL;
  private ratingsCache: { [key: string]: RatingData } = {};
  private cacheTimestamp: { [key: string]: number } = {};
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 phút cache

  // Lấy rating cho nhiều sản phẩm cùng lúc (batch)
  async getBatchRatings(productIds: string[]): Promise<BatchRatingsResponse> {
    try {
      const now = Date.now();
      const uncachedIds: string[] = [];
      const result: BatchRatingsResponse = {};

      // Check cache trước
      productIds.forEach(id => {
        const cached = this.ratingsCache[id];
        const timestamp = this.cacheTimestamp[id] || 0;
        
        if (cached && (now - timestamp) < this.CACHE_DURATION) {
          result[id] = cached;
        } else {
          uncachedIds.push(id);
        }
      });

      // Gọi API cho những sản phẩm chưa có cache
      if (uncachedIds.length > 0) {
        const response = await axios.post(`${this.baseUrl}/batch-ratings`, {
          productIds: uncachedIds
        });

        const newRatings = response.data.data || {};
        
        // Update cache và result
        Object.keys(newRatings).forEach(productId => {
          this.ratingsCache[productId] = newRatings[productId];
          this.cacheTimestamp[productId] = now;
          result[productId] = newRatings[productId];
        });
      }

      return result;
    } catch (error) {
      console.error('Error getting batch ratings:', error);
      // Fallback: return empty ratings
      const fallback: BatchRatingsResponse = {};
      productIds.forEach(id => {
        fallback[id] = { averageRating: 0, totalReviews: 0 };
      });
      return fallback;
    }
  }

  // Lấy rating cho một sản phẩm
  async getProductRating(productId: string): Promise<RatingData> {
    try {
      const now = Date.now();
      const cached = this.ratingsCache[productId];
      const timestamp = this.cacheTimestamp[productId] || 0;

      // Return cache nếu còn valid
      if (cached && (now - timestamp) < this.CACHE_DURATION) {
        return cached;
      }

      const response = await axios.get(`${this.baseUrl}/product-rating/${productId}`);
      const rating = response.data.data || { averageRating: 0, totalReviews: 0 };

      // Update cache
      this.ratingsCache[productId] = rating;
      this.cacheTimestamp[productId] = now;

      return rating;
    } catch (error) {
      console.error(`Error getting rating for product ${productId}:`, error);
      return { averageRating: 0, totalReviews: 0 };
    }
  }

  // Lấy rating cho sản phẩm visible (lazy loading)
  async loadVisibleRatings(productIds: string[], callback: (ratings: BatchRatingsResponse) => void) {
    try {
      const batchSize = 10;
      
      for (let i = 0; i < productIds.length; i += batchSize) {
        const batch = productIds.slice(i, i + batchSize);
        const ratings = await this.getBatchRatings(batch);
        callback(ratings);
        
        // Delay nhỏ để không block UI
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error loading visible ratings:', error);
    }
  }

  // Clear cache
  clearCache(): void {
    this.ratingsCache = {};
    this.cacheTimestamp = {};
  }

  // Clear cache for specific product
  clearProductCache(productId: string): void {
    if (this.ratingsCache[productId]) {
      delete this.ratingsCache[productId];
    }
    if (this.cacheTimestamp[productId]) {
      delete this.cacheTimestamp[productId];
    }
  }

  // Preload ratings cho danh sách sản phẩm
  async preloadRatings(productIds: string[]): Promise<void> {
    try {
      await this.getBatchRatings(productIds);
    } catch (error) {
      console.error('Error preloading ratings:', error);
    }
  }

  // Update rating trong cache khi có review mới
  updateCachedRating(productId: string, newRating: RatingData): void {
    this.ratingsCache[productId] = newRating;
    this.cacheTimestamp[productId] = Date.now();
  }

  // Get cached rating (synchronous)
  getCachedRating(productId: string): RatingData | null {
    const now = Date.now();
    const cached = this.ratingsCache[productId];
    const timestamp = this.cacheTimestamp[productId] || 0;

    if (cached && (now - timestamp) < this.CACHE_DURATION) {
      return cached;
    }
    return null;
  }
}

export const ratingService = new RatingService();
export default ratingService;
