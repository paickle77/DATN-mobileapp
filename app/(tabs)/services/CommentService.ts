import detailService, { Review, ReviewSummary } from './DetailService';

class CommentService {
  /**
   * Lấy tất cả đánh giá của sản phẩm với thông tin user
   */
  async getProductReviewsWithUsers(productId: string): Promise<Review[]> {
    return await detailService.getReviewsWithUserInfo(productId);
  }

  /**
   * Lấy tóm tắt đánh giá sản phẩm
   */
  async getReviewSummary(productId: string): Promise<ReviewSummary> {
    return await detailService.getReviewSummary(productId);
  }

  /**
   * Lấy tên user theo ID (với cache)
   */
  async getUserName(userId: string): Promise<string> {
    return await detailService.getUserInfo(userId);
  }

  /**
   * Xử lý hiển thị tên user từ review object
   */
  getUserDisplayName(review: Review): string {
    if (typeof review.user_id === 'object' && review.user_id.name) {
      return review.user_id.name;
    }
    return 'Khách hàng';
  }

  /**
   * Format ngày tháng cho đánh giá
   */
  formatReviewDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
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
      distribution[review.star_rating]++;
    });

    return {
      1: { count: distribution[1], percentage: (distribution[1] / total) * 100 },
      2: { count: distribution[2], percentage: (distribution[2] / total) * 100 },
      3: { count: distribution[3], percentage: (distribution[3] / total) * 100 },
      4: { count: distribution[4], percentage: (distribution[4] / total) * 100 },
      5: { count: distribution[5], percentage: (distribution[5] / total) * 100 },
    };
  }
}

// Export instance
export const commentService = new CommentService();
export default commentService;