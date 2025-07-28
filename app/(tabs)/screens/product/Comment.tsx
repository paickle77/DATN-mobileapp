import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
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
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
    averageRating: 0,
    totalReviews: 0,
    reviews: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<number>(0); 
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Animation
const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      // Refresh data khi màn hình được focus (quay lại từ màn hình khác)
      initializeData(false);
      
      // Start animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, [])
  );

  const initializeData = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const productID = await getUserData('productID');
      console.log('🆔 ProductID lấy từ AsyncStorage:', productID);
      if (!productID) {
        setError('Không tìm thấy ID sản phẩm');
        return;
      }

      if (forceRefresh) {
        // Refresh cache trước khi load data
        await commentService.refreshCache();
      }

      await fetchReviewData(productID, forceRefresh);
      
    } catch (err) {
      setError('Lỗi khi tải dữ liệu đánh giá');
      console.error('Error initializing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewData = async (productId: string, forceRefresh: boolean = false) => {
  try {
    const { reviews: reviewsData, summary } = await commentService.refreshProductReviews(productId);

    setReviews(reviewsData);
    setReviewSummary(summary);

    // Giữ filter & sort hiện tại
    applyFiltersAndSort(reviewsData, selectedFilter, sortBy);

    console.log(`✅ Loaded ${reviewsData.length} reviews with ${forceRefresh ? 'force refresh' : 'cache'}`);
  } catch (error) {
    console.error('Error fetching review data:', error);
    throw error;
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await initializeData(true); // Force refresh
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const applyFiltersAndSort = (
  reviewsToFilter: Review[] = reviews,
  filter: number = selectedFilter,
  sort: typeof sortBy = sortBy
) => {
  let filtered = commentService.filterReviewsByRating(reviewsToFilter, filter);
  filtered = commentService.sortReviews(filtered, sort);
  setFilteredReviews(filtered);
};

  const handleFilterChange = (rating: number) => {
  const newFilter = rating === selectedFilter ? 0 : rating;
  setSelectedFilter(newFilter);
  applyFiltersAndSort(reviews, newFilter, sortBy);
};

  const handleSortChange = (newSortBy: typeof sortBy) => {
  setSortBy(newSortBy);
  applyFiltersAndSort(reviews, selectedFilter, newSortBy);
};

  const renderStars = (count: number, size: number = 18) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FontAwesome
        key={i}
        name={i < count ? 'star' : 'star-o'}
        size={size}
        color={i < count ? '#FF6B35' : '#E0E0E0'}
        style={{ marginRight: 3 }}
      />
    ));
  };

  const renderRatingDistribution = () => {
    const distribution = commentService.calculateRatingDistribution(reviews);
    
    return (
      <View style={styles.distributionContainer}>
        <Text style={styles.distributionTitle}>Phân bố đánh giá</Text>
        {[5, 4, 3, 2, 1].map(star => (
          <TouchableOpacity 
            key={star} 
            style={[
              styles.distributionRow,
              selectedFilter === star && styles.distributionRowActive
            ]}
            onPress={() => handleFilterChange(selectedFilter === star ? 0 : star)}
            activeOpacity={0.7}
          >
            <Text style={styles.starLabel}>{star}</Text>
            <FontAwesome name="star" size={12} color="#FF6B35" />
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { width: `${distribution[star].percentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.countLabel}>({distribution[star].count})</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderFilterButtons = () => {
    const filters = [
      { key: 0, label: 'Tất cả' },
      { key: 5, label: '5 ⭐' },
      { key: 4, label: '4 ⭐' },
      { key: 3, label: '3 ⭐' },
      { key: 2, label: '2 ⭐' },
      { key: 1, label: '1 ⭐' },
    ];

    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => handleFilterChange(filter.key)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter.key && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSortButtons = () => {
    const sortOptions = [
      { key: 'newest', label: 'Mới nhất' },
      { key: 'highest', label: 'Cao nhất' },
      { key: 'lowest', label: 'Thấp nhất' },
    ];

    return (
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sắp xếp: </Text>
        {sortOptions.map(option => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortButton,
              sortBy === option.key && styles.sortButtonActive
            ]}
            onPress={() => handleSortChange(option.key)}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === option.key && styles.sortButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading && !refreshing) {
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
        <TouchableOpacity style={styles.primaryButton} onPress={() => initializeData(true)}>
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
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <FontAwesome name="refresh" size={18} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
      >
        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.ratingOverview}>
            <Text style={styles.averageRating}>
              {reviewSummary.averageRating.toFixed(1)}
            </Text>
            <View style={styles.averageStars}>
              {renderStars(Math.round(reviewSummary.averageRating), 20)}
            </View>
            <Text style={styles.totalReviews}>
              ({reviewSummary.totalReviews} đánh giá)
            </Text>
            <Text style={styles.positivePercentage}>
              {commentService.getPositiveReviewPercentage(reviews)}% khách hàng hài lòng
            </Text>
          </View>
          
          {/* Rating Distribution */}
          {renderRatingDistribution()}
        </View>

        {/* Filters */}
        {renderFilterButtons()}
        
        {/* Sort Options */}
        {renderSortButtons()}

        {/* Reviews List */}
        <View style={styles.reviewsContainer}>
          <Text style={styles.reviewsTitle}>
            {selectedFilter === 0 
              ? `Tất cả đánh giá (${filteredReviews.length})`
              : `Đánh giá ${selectedFilter} sao (${filteredReviews.length})`
            }
          </Text>
          
          {filteredReviews.map((item, index) => (
            <Animated.View 
              key={item._id} 
              style={[
                styles.reviewCard,
                { 
                  marginTop: index === 0 ? 0 : 16,
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  }]
                }
              ]}
            >
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
                <View style={styles.ratingContainer}>
                  <View style={styles.rating}>
                    {renderStars(item.star_rating, 16)}
                  </View>
                  <Text style={styles.ratingText}>
                    {commentService.getRatingDescription(item.star_rating)}
                  </Text>
                </View>
              </View>

              {/* Review Content */}
              <Text style={styles.reviewText}>{item.content}</Text>

              {/* Review Image */}
              {commentService.hasImage(item) && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: commentService.getReviewImageUri(item)! }}
                    style={styles.reviewImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
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
  refreshButton: {
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
  scrollView: {
    flex: 1,
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
    marginBottom: 4,
  },
  positivePercentage: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },

  // Distribution Styles
  distributionContainer: {
    gap: 8,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  distributionRowActive: {
    backgroundColor: '#FFF5F0',
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

  // Filter Styles
  filterContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },

  // Sort Styles
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  sortButtonActive: {
    backgroundColor: '#FF6B35',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#FFF',
  },

  // Reviews List Styles
  reviewsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
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
    backgroundColor: '#5C4033',
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