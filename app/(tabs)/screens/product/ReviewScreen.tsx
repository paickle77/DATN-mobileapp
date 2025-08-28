import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../services/api';
import reviewService from '../../services/ReviewService';
import { getUserData } from '../utils/storage';

// Import các component đã redesign
import DetailedReview from '../../component/DetailedReview';
import ProductCard from '../../component/ProductCard';
import StarRating from '../../component/StarRating';
import { saveUserData } from '../utils/storage';
const { width, height } = Dimensions.get('window');

type ProductDataType = {
  _id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  category_id: {
    _id: string;
    name: string;
  };
};

const ReviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Ở ReviewScreen
const { ProductID, BillID, BillDetailID } = route.params as { 
  ProductID: string; 
  BillID: string; 
  BillDetailID: string; 
};

  // States
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [data, setData] = useState<ProductDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Animation values
const fadeAnim = useRef(new Animated.Value(0)).current;
const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    console.log("ProductId123",ProductID)
    if (ProductID) {
      fetchProductData();
    }
    
  
  }, [ProductID]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/products/${ProductID}`);
      const productData: ProductDataType = response.data.data;
     console.log('✅ Product data fetched:', productData);
      setData(productData);
    } catch (error) {
      console.error('Error fetching product data:', error);
      Alert.alert('⚠️ Lỗi', 'Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('🔐 Quyền truy cập', 'Bạn cần cấp quyền truy cập thư viện ảnh để tải ảnh lên!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
      base64: true,
      aspect: [4, 3],
      allowsEditing: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImage(asset.uri);
      setImageBase64(asset.base64 ?? null);
    }
  };

  const handleSubmit = async () => {
    // Validation với UI hiện đại
    if (rating === 0) {
      Alert.alert(
        '⭐ Thiếu đánh giá', 
        'Vui lòng chọn số sao đánh giá trước khi gửi!',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    if (reviewText.trim() === '') {
      Alert.alert(
        '📝 Thiếu nội dung', 
        'Vui lòng chia sẻ trải nghiệm của bạn về sản phẩm!',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      setSubmitting(true);
      const userData = await getUserData('userData');
      
      const payload = {
        product_id: ProductID,
        star_rating: rating,
        content: reviewText.trim(),
        image: imageBase64,
        Account_id: userData,
        bill_id: BillID, 
        billDetail_id: BillDetailID,
      };


      // Sử dụng ReviewService để submit (đã handle cache clearing internally)
      await reviewService.submitReview(payload);
      console.log('Review submitted successfully - all caches cleared automatically');
      
      await saveUserData({ key: 'productID', value: ProductID });
      
      Alert.alert(
        '🎉 Thành công!', 
        'Cảm ơn bạn đã chia sẻ! Đánh giá của bạn đã được gửi thành công và sẽ giúp người khác có thêm thông tin hữu ích.',
        [
          {
            text: '✨ Tuyệt vời!',
            style: 'default',
            onPress: () => {
              // Reset form với animation
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start(() => {
                setRating(0);
                setReviewText('');
                setImage(null);
                setImageBase64(null);
                navigation.goBack();
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert(
        '❌ Lỗi kết nối', 
        'Không thể gửi đánh giá lúc này. Vui lòng kiểm tra kết nối mạng và thử lại.',
        [{ text: 'Thử lại', style: 'default' }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#5C4033', '#a78661ff']}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Đang tải thông tin sản phẩm...</Text>
          <Text style={styles.loadingSubText}>Vui lòng chờ trong giây lát</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      {/* Modern Header */}
      <LinearGradient
        colors={['#4b3d36ff', '#9b764fff']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Viết Đánh Giá</Text>
            <Text style={styles.headerSubtitle}>Chia sẻ trải nghiệm của bạn</Text>
          </View>
          
          <View style={styles.headerIcon}>
            <Icon name="star" size={20} color="#FFD700" />
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Product Card */}
          {data && (
            <View style={[
              styles.sectionContainer
            ]}>
              <ProductCard
                imageUrl={data.image_url}
                category={data.category_id?.name || 'Chưa phân loại'}
                name={data.name}
                price={data.price}
              />
            </View>
          )}

          {/* Star Rating */}
          <View style={[
            styles.sectionContainer
          ]}>
            <StarRating
              rating={rating}
              setRating={setRating}
            />
          </View>

          {/* Detailed Review */}
          <View style={[
            styles.sectionContainer
          ]}>
            <DetailedReview
              reviewText={reviewText}
              onTextChange={setReviewText}
              onImageAdd={pickImage}
              uploadedImage={image}
            />
          </View>

          {/* Submit Button */}
          <View style={[
            styles.submitContainer
          ]}>
            <TouchableOpacity 
              style={[
                styles.submitButton,
                (submitting || rating === 0 || reviewText.trim() === '') && styles.submitButtonDisabled
              ]} 
              onPress={handleSubmit}
              disabled={submitting || rating === 0 || reviewText.trim() === ''}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={
                  (submitting || rating === 0 || reviewText.trim() === '') 
                    ? ['#BDC3C7', '#95A5A6'] 
                    : ['#FF6B35', '#F7931E', '#E67E22']
                }
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {submitting ? (
                  <>
                    <ActivityIndicator color="#FFF" size="small" />
                    <Text style={styles.submitButtonText}>Đang gửi...</Text>
                  </>
                ) : (
                  <>
                    <Icon name="send" size={18} color="#FFF" />
                    <Text style={styles.submitButtonText}>Gửi Đánh Giá</Text>
                    <Icon name="arrow-forward" size={16} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Submit Info */}
            <View style={styles.submitInfo}>
              <Icon name="shield-checkmark" size={14} color="#4CAF50" />
              <Text style={styles.submitInfoText}>
                Đánh giá của bạn sẽ được kiểm duyệt và hiển thị công khai
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 40,
  },

  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 20,
    elevation: 12,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Keyboard Container
  keyboardContainer: {
    flex: 1,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  sectionContainer: {
    marginBottom: 8,
  },

  // Submit Section
  submitContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },

  submitButton: {
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    marginBottom: 12,
  },

  submitButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },

  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    gap: 8,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  submitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  submitInfoText: {
    fontSize: 11,
    color: '#7F8C8D',
    marginLeft: 6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ReviewScreen;