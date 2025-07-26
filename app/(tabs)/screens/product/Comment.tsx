import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import commentService from '../../services/CommentService';
import { Review, ReviewSummary } from '../../services/DetailService';
import { getUserData } from '../utils/storage';

const { width } = Dimensions.get('window');

const CommentScreen = () => {
  const navigation = useNavigation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
    averageRating: 0,
    totalReviews: 0,
    reviews: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      const productID = await getUserData('productID');
      
      if (!productID) {
        setError('Không tìm thấy ID sản phẩm');
        return;
      }

      await Promise.all([
        fetchReviews(productID),
        fetchReviewSummary(productID)
      ]);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const reviewsData = await commentService.getProductReviewsWithUsers(productId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Lỗi khi tải đánh giá:', error);
      throw error;
    }
  };

  const fetchReviewSummary = async (productId: string) => {
    try {
      const summary = await commentService.getReviewSummary(productId);
      setReviewSummary(summary);
    } catch (error) {
      console.error('Lỗi khi tải tóm tắt đánh giá:', error);
      throw error;
    }
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FontAwesome
        key={i}
        name={i < count ? 'star' : 'star-o'}
        size={18}
        color={i < count ? '#FF6B35' : '#E0E0E0'}
        style={{ marginRight: 3 }}
      />
    ));
  };

  const renderRatingDistribution = () => {
    const distribution = commentService.calculateRatingDistribution(reviews);
    
    return (
      <View style={styles.distributionContainer}>
        {[5, 4, 3, 2, 1].map(star => (
          <View key={star} style={styles.distributionRow}>
            <Text style={styles.starLabel}>{star}</Text>
            <FontAwesome name="star" size={12} color="#FF6B35" />
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${distribution[star].percentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.countLabel}>({distribution[star].count})</Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome name="exclamation-triangle" size={64} color="#FF6B35" />
        <Text style={styles.emptyTitle}>Có lỗi xảy ra</Text>
        <Text style={styles.emptySubtitle}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={initializeData}>
          <FontAwesome name="refresh" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome name="comments-o" size={64} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>Chưa có đánh giá nào</Text>
        <Text style={styles.emptySubtitle}>Hãy là người đầu tiên đánh giá sản phẩm này!</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.ratingOverview}>
          <Text style={styles.averageRating}>
            {reviewSummary.averageRating.toFixed(1)}
          </Text>
          <View style={styles.averageStars}>
            {renderStars(Math.round(reviewSummary.averageRating))}
          </View>
          <Text style={styles.totalReviews}>
            ({reviewSummary.totalReviews} đánh giá)
          </Text>
        </View>
        
        {/* Rating Distribution */}
        {renderRatingDistribution()}
      </View>

      {/* Reviews List */}
      <ScrollView 
        style={styles.reviewsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.reviewsContent}
      >
        {reviews.map((item, index) => (
          <View key={item._id} style={[
            styles.reviewCard,
            { marginTop: index === 0 ? 0 : 16 }
          ]}>
            {/* Review Header */}
            <View style={styles.reviewHeader}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {commentService.getUserDisplayName(item).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.username}>
                    {commentService.getUserDisplayName(item)}
                  </Text>
                  <Text style={styles.reviewDate}>
                    {commentService.formatReviewDate(item.review_date)}
                  </Text>
                </View>
              </View>
              <View style={styles.rating}>
                {renderStars(item.star_rating)}
              </View>
            </View>

            {/* Review Content */}
            <Text style={styles.reviewText}>{item.content}</Text>

            {/* Review Image */}
            {item.image && (
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: `data:image/jpeg;base64,${item.image}`,
                  }}
                  style={styles.reviewImage}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  // Summary Styles
  summaryContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  ratingOverview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
  },
  averageStars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
  },

  // Distribution Styles
  distributionContainer: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    width: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4,
  },
  countLabel: {
    fontSize: 12,
    color: '#666',
    width: 30,
    textAlign: 'right',
  },

  // Reviews List Styles
  reviewsList: {
    flex: 1,
    marginTop: 16,
  },
  reviewsContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  rating: {
    flexDirection: 'row',
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginBottom: 12,
  },
  imageContainer: {
    marginTop: 8,
  },
  reviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },

  // Loading & Empty States
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CommentScreen;