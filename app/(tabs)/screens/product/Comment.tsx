import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

const CommentScreen = () => {
  const navigation = useNavigation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReview = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/GetAllReview`);
      const productID = await getUserData('productID');

      const allReviews = response.data.data;

      const filteredReviews = allReviews.filter((item) => {
        const itemProductId =
          typeof item.product_id === 'object' && item.product_id._id
            ? item.product_id._id
            : item.product_id;
        return itemProductId === productID;
      });

      setReviews(filteredReviews);
    } catch (error) {
      console.error('Lỗi khi gọi API bằng axios:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, []);

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FontAwesome
        key={i}
        name={i < count ? 'star' : 'star-o'}
        size={16}
        color="#FFD700"
        style={{ marginRight: 2 }}
      />
    ));
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={{ marginTop: 10 }}>Đang tải đánh giá...</Text>
      </View>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Không có dữ liệu đánh giá.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Go Back Button */}
      <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
        <FontAwesome name="arrow-left" size={18} color="#fff" />
        <Text style={styles.goBackText}>Quay lại</Text>
      </TouchableOpacity>

      {reviews.map((item) => (
        <View key={item._id} style={styles.reviewContainer}>
          {/* Left: Image */}
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.reviewImage} />
          ) : (
            <View style={[styles.reviewImage, styles.noImage]}>
              <FontAwesome name="image" size={30} color="#ccc" />
            </View>
          )}

          {/* Right: Content */}
          <View style={styles.reviewContent}>
            <View style={styles.stars}>{renderStars(item.star_rating)}</View>
            <Text style={styles.contentText} numberOfLines={2}>
              {item.content}
            </Text>
            <Text style={styles.dateText}>
              {new Date(item.review_date).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#FFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B4513',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  goBackText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  reviewContainer: {
    flexDirection: 'row',
    backgroundColor: '#FDF7EE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#EEE',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewContent: {
    flex: 1,
    flexDirection: 'column',
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 13,
    color: '#999',
  },
  button: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});

export default CommentScreen;
