import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
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
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

const { width } = Dimensions.get('window');

type Review = {
  _id: string;
  user_id: string;
  review_date: string;
  star_rating: number;
  content: string;
  image?: string;
};

const CommentScreen = () => {
  const navigation = useNavigation();
 const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

  // Hàm lấy thông tin user theo ID
  const fetchUserName = async (userId: any) => {
    try {
      if (userNames[userId]) {
        return userNames[userId]; // Return from cache
      }
      
      const response = await axios.get(`${BASE_URL}/users/${userId}`);
      const userName = response.data.data?.name || 'Khách hàng';
      
      // Cache the result
      setUserNames(prev => ({
        ...prev,
        [userId]: userName
      }));
      
      return userName;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error);
      return 'Khách hàng';
    }
  };

  const fetchReview = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/GetAllReview`);
      const productID = await getUserData('productID');

      const allReviews = response.data.data;

      const filteredReviews = allReviews.filter((item: any) => {
        const itemProductId =
          typeof item.product_id === 'object' && item.product_id._id
            ? item.product_id._id
            : item.product_id;
        return itemProductId === productID;
      });

      setReviews(filteredReviews);
      
      // Fetch user names for all reviews
      const userIds = [...new Set(filteredReviews.map((review: Review) => review.user_id))];
      const userNamePromises = userIds.map(async (userId) => {
        const userName = await fetchUserName(userId);
        return { [userId]: userName };
      });
      
      const userNameResults = await Promise.all(userNamePromises);
      const userNamesMap = Object.assign({}, ...userNameResults);
      setUserNames(userNamesMap);
      
    } catch (error) {
      console.error('Lỗi khi gọi API bằng axios:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, []);

  const renderStars = (count: any) => {
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

  // Hàm get tên user với fallback
  const getUserName = (item: any) => {
    if (item.user_id && typeof item.user_id === 'object' && item.user_id.name) {
      // Trường hợp đã populate trong API
      return item.user_id.name;
    } else if (userNames[item.user_id]) {
      // Trường hợp lấy từ cache
      return userNames[item.user_id];
    }
    return 'Khách hàng'; // Fallback
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
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

  // Tính toán điểm đánh giá trung bình
  const averageRating = reviews.reduce((sum, item) => sum + item.star_rating, 0) / reviews.length;

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
          <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
          <View style={styles.averageStars}>
            {renderStars(Math.round(averageRating))}
          </View>
          <Text style={styles.totalReviews}>({reviews.length} đánh giá)</Text>
        </View>
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
                    {getUserName(item).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.username}>{getUserName(item)}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(item.review_date).toLocaleDateString('vi-VN')}
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