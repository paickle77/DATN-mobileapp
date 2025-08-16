import detailService, { Review, ReviewSummary } from './DetailService';

class CommentService {
  /**
   * Lấy tất cả đánh giá của sản phẩm với thông tin user
   */
  async getProductReviewsWithUsers(productId: string, forceRefresh: boolean = false): Promise<Review[]> {
    if (forceRefresh) {
      // Clear cache trước khi lấy dữ liệu mới
      detailService.clearCache();
    }
    return await detailService.getReviewsWithUserInfo(productId);
  }

  /**
   * Lấy tóm tắt đánh giá sản phẩm
   */
  async getReviewSummary(productId: string, forceRefresh: boolean = false): Promise<ReviewSummary> {
    if (forceRefresh) {
      // Clear cache trước khi lấy dữ liệu mới
      detailService.clearCache();
    }
    return await detailService.getReviewSummary(productId);
  }

  /**
   * Refresh tất cả dữ liệu đánh giá cho một sản phẩm
   */
  async refreshProductReviews(productId: string): Promise<{ reviews: Review[], summary: ReviewSummary }> {
    try {
      // Force refresh cache
      await detailService.refreshCache();
      
      // Lấy dữ liệu mới
      const [reviews, summary] = await Promise.all([
        this.getProductReviewsWithUsers(productId, true),
        this.getReviewSummary(productId, true)
      ]);

      return { reviews, summary };
    } catch (error) {
      console.error('❌ Lỗi khi refresh đánh giá sản phẩm:', error);
      throw error;
    }
  }

  /**
   * Lấy tên user theo ID (với cache)
   */
async getUserName(userId: string): Promise<string> {
  const name = await detailService.getUserInfo(userId);
  return name; // không fallback ở đây nữa, đã xử lý ở DetailService
}

  /**
   * Xử lý hiển thị tên user từ review object
   */
 getUserDisplayName(review: Review): string {
  console.log("Username@@:", review);

  if (typeof review.Account_id === 'object' && review.Account_id.email) {
    // Lấy phần trước dấu @
    return review.Account_id.email.split('@')[0];
  }
  return 'Khách hàng';
}


  /**
   * Format ngày tháng cho đánh giá
   */
  formatReviewDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return 'Hôm qua';
      } else if (diffDays <= 7) {
        return `${diffDays} ngày trước`;
      } else if (diffDays <= 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} tuần trước`;
      } else {
        return date.toLocaleDateString('vi-VN');
      }
    } catch (error) {
      return 'Không xác định';
    }
  }

  /**
   * Tính toán phần trăm cho mỗi mức sao
   */
  calculateRatingDistribution(reviews: Review[]): {
    [key: number]: { count: number; percentage: number }
  } {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const total = reviews.length;

    if (total === 0) {
      return {
        1: { count: 0, percentage: 0 },
        2: { count: 0, percentage: 0 },
        3: { count: 0, percentage: 0 },
        4: { count: 0, percentage: 0 },
        5: { count: 0, percentage: 0 },
      };
    }

    reviews.forEach(review => {
      if (review.star_rating >= 1 && review.star_rating <= 5) {
        distribution[review.star_rating]++;
      }
    });

    return {
      1: { count: distribution[1], percentage: Math.round((distribution[1] / total) * 100) },
      2: { count: distribution[2], percentage: Math.round((distribution[2] / total) * 100) },
      3: { count: distribution[3], percentage: Math.round((distribution[3] / total) * 100) },
      4: { count: distribution[4], percentage: Math.round((distribution[4] / total) * 100) },
      5: { count: distribution[5], percentage: Math.round((distribution[5] / total) * 100) },
    };
  }

  /**
   * Lấy text mô tả cho rating
   */
  getRatingDescription(rating: number): string {
    switch (rating) {
      case 1: return 'Rất tệ';
      case 2: return 'Tệ';
      case 3: return 'Trung bình';
      case 4: return 'Tốt';
      case 5: return 'Xuất sắc';
      default: return 'Chưa đánh giá';
    }
  }

  /**
   * Kiểm tra review có hình ảnh không
   */
  hasImage(review: Review): boolean {
    return !!(review.image && review.image.trim() !== '');
  }

  /**
   * Lấy URL hình ảnh review
   */
  getReviewImageUri(review: Review): string | null {
    if (this.hasImage(review)) {
      return `data:image/jpeg;base64,${review.image}`;
    }
    return null;
  }

  /**
   * Sắp xếp reviews theo tiêu chí
   */
  sortReviews(reviews: Review[], sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest'): Review[] {
    const sorted = [...reviews];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.review_date).getTime() - new Date(b.review_date).getTime());
      case 'highest':
        return sorted.sort((a, b) => b.star_rating - a.star_rating);
      case 'lowest':
        return sorted.sort((a, b) => a.star_rating - b.star_rating);
      default:
        return sorted;
    }
  }

  /**
   * Lọc reviews theo rating
   */
  filterReviewsByRating(reviews: Review[], rating: number): Review[] {
    if (rating === 0) return reviews; // 0 = all ratings
    return reviews.filter(review => review.star_rating === rating);
  }

  /**
   * Lọc reviews có hình ảnh
   */
  getReviewsWithImages(reviews: Review[]): Review[] {
    return reviews.filter(review => this.hasImage(review));
  }

  /**
   * Tính phần trăm reviews tích cực (4-5 sao)
   */
  getPositiveReviewPercentage(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const positiveReviews = reviews.filter(review => review.star_rating >= 4);
    return Math.round((positiveReviews.length / reviews.length) * 100);
  }

  /**
   * Clear toàn bộ cache
   */
  clearCache(): void {
    detailService.clearCache();
    console.log('🗑️ CommentService: Đã xóa cache');
  }

  /**
   * Refresh cache
   */
  async refreshCache(): Promise<void> {
    await detailService.refreshCache();
    console.log('🔄 CommentService: Đã refresh cache');
  }
}

// Export instance
export const commentService = new CommentService();
export default commentService;