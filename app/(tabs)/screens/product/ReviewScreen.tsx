import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DetailedReview from '../../component/DetailedReview';
import ProductCard from '../../component/ProductCard';
import StarRating from '../../component/StarRating';

const { width } = Dimensions.get('window');

const ReviewScreen = () => {
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (rating === 0 || reviewText === '') {
      Alert.alert('Vui lòng nhập đầy đủ đánh giá và chọn số sao!');
      return;
    }

    console.log('Đánh giá:', { rating, reviewText, image });
    Alert.alert('Đánh giá của bạn đã được gửi thành công!');
  };

  const handleCancel = () => {
    setRating(0);
    setReviewText('');
    setImage(null);
    navigation.goBack()
  };

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
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
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
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
});