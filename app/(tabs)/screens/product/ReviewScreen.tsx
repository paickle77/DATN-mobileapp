import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'expo-router'; // Assuming you are using Expo Router
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DetailedReview from '../../component/DetailedReview';
import ProductCard from '../../component/ProductCard';
import StarRating from '../../component/StarRating';

const { width } = Dimensions.get('window');
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

// Define types for product data for better clarity
type ProductDataType = {
  _id: string;
  name: string;
  description: string; // Assuming product data has a description field
  image_url: string;
  price: number;
  category_id: {
    _id: string;
    name: string;
  };
  // Add other product fields as needed
};

const ReviewScreen = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null); // NEW state for base64
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [image, setImage] = useState<string | null>(null); // Explicitly type as string | null
  const [data, setData] = useState<ProductDataType | null>(null); // Type for product data
  const route = useRoute();
  // Ensure ProductId is typed correctly from route params
  const { ProductId } = route.params as { ProductId: string };

  console.log('ProductId from params:', ProductId);

  useEffect(() => {
    // Fetch product data if ProductId exists
    if (ProductId) {
      fetchProductData();
    }
  }, [ProductId]); // Dependency array to refetch if ProductId changes

  const fetchProductData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/productbyID/${ProductId}`);
      const productData: ProductDataType = response.data.data; // Cast to ProductDataType
      setData(productData);
      console.log('Product data fetched:', productData);
    } catch (error) {
      console.error('Error fetching product data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7, // Slightly reduced quality for faster upload/processing, can be adjusted
      allowsMultipleSelection: false, // Only allow one image for a review
      base64: true,
    });

   if (!result.canceled && result.assets && result.assets.length > 0) {
    const asset = result.assets[0];
    setImage(asset.uri);              // Để hiển thị ảnh
    setImageBase64(asset.base64 ?? null);    // 🟢 Lưu base64 để gửi lên server
    console.log('Base64:', asset.base64?.slice(0, 50)); // Xem thử 50 ký tự đầu
  }
  };

  const handleSubmit = async () => {
    if (rating === 0 || reviewText.trim() === '') { // Use .trim() to check for empty string
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ đánh giá và chọn số sao!');
      return;
    } else {
      try {
        const userData = await getUserData('userData');
        const payload = {
          product_id: ProductId,
          star_rating: rating,
          content: reviewText,
          image: imageBase64, // This should be a URL if you upload the image first
          user_id: userData, // Replace with actual user ID
        }

        const response = await axios.post(`${BASE_URL}/reviews`, payload);
        console.log('Review submitted:', response.data);
        Alert.alert('Thành công', 'Đánh giá của bạn đã được gửi thành công!');

        // Optionally reset fields and go back after successful submission
        setRating(0);
        setReviewText('');
        setImage(null);
        navigation.goBack(); // Navigate back after successful submission
      } catch (error) {
        console.error('Error submitting review:', error);
        Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
      }
    }
  };

  const handleCancel = () => {
    setRating(0);
    setReviewText('');
    setImage(null);
    navigation.goBack()
    Alert.alert('Thông báo', 'Bạn đã hủy đánh giá.'); // More descriptive alert
    navigation.goBack();
  };

  // Basic loading state for product card
  if (!data && ProductId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải thông tin sản phẩm...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF8E7', '#FFFFFF']}
        style={styles.backgroundGradient}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
          <Text style={styles.headerSubtitle}>Chia sẻ trải nghiệm của bạn</Text>
        </View>

        {/* Product Card Container */}
        <View style={styles.productCardContainer}>
          <ProductCard
            imageUrl={'https://moderncook.com.vn/recipes/wp-content/uploads/2022/03/e768118c3024fc7aa535-1024x682.jpg'}
            name={'Bánh gato kiểu pháp'}
            category={'Bánh sinh nhật'}
            description={'Spider Plant |'}
            price={'515.000'}
          />
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
          <View style={styles.ratingContainer}>
            <StarRating rating={rating} setRating={setRating} />
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 ? 'Rất tệ' : 
                 rating === 2 ? 'Tệ' : 
                 rating === 3 ? 'Bình thường' : 
                 rating === 4 ? 'Tốt' : 'Xuất sắc'}
              </Text>
            )}
          </View>
        </View>

        {/* Review Content Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Chi tiết đánh giá</Text>
          <DetailedReview
            onImageAdd={pickImage}
            onTextChange={setReviewText}
            image={image}
          />
        </View>
      </ScrollView>
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* New Header Container */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={25} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viết Đánh Giá Sản Phẩm</Text>
        {/* An empty view to push the title to center if needed, or for symmetry */}
        <View style={{ width: 25 }} /> 
      </View>

      {data ? (
        <ProductCard
          imageUrl={data.image_url}
          name={data.name}
          category={data.category_id?.name || 'Chưa phân loại'}
          price={data.price}
          description={data.description} // Pass description to ProductCard
        />
      ) : (
        <Text style={styles.productNotFound}>Không tìm thấy thông tin sản phẩm.</Text>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chất lượng sản phẩm:</Text>
      </View>
      <StarRating rating={rating} setRating={setRating} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chi tiết đánh giá của bạn:</Text>
      </View>
      <DetailedReview
        onImageAdd={pickImage}
        onTextChange={setReviewText}
        image={image}
        reviewText={reviewText} // Pass reviewText to DetailedReview for controlled input
      />

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <LinearGradient
              colors={['#D2691E', '#8B4513']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for fixed bottom buttons
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  productCardContainer: {
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  ratingSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  reviewSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 16,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#D2691E',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    backgroundColor: '#f5f5f5', // Light background
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30, // Extra padding at the bottom
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  productNotFound: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  // New Styles for Header Alignment
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribute space between items
    marginBottom: 20, // Keep existing margin
    marginTop: 10, // Adjust top margin as needed
  },
  headerTitle: {
    fontSize: 20, // Slightly reduce font size to fit better
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Allow title to take available space
    textAlign: 'center', // Center the text within its flex container
  },
  backButton: {
    paddingRight: 10, // Add some padding to the right of the icon
    // marginLeft: 15, // This margin might push it too far, let flexbox handle it
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 30, // More space above buttons
    marginBottom: 20, // Space at the bottom before end of scroll view
  },
  submitButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745', // Green for submit
    paddingVertical: 14, // Slightly less padding for better fit
    paddingHorizontal: 20,
    borderRadius: 8, // Softer corners
    flex: 1,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#dc3545', // Red for cancel
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});