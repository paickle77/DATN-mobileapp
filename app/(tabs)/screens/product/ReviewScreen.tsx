import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DetailedReview from '../../component/DetailedReview';
import ProductCard from '../../component/ProductCard';
import StarRating from '../../component/StarRating';

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
    // Alert.alert('Đã hủy đánh giá!');
    navigation.goBack()
  };

  return (
    <ScrollView style={styles.container}>
      <ProductCard
        imageUrl={'https://moderncook.com.vn/recipes/wp-content/uploads/2022/03/e768118c3024fc7aa535-1024x682.jpg'}
        name={'Bánh gato kiểu pháp'}
        category={'Bánh sinh nhật'}
        description={'Spider Plant |'}
        price={'515.000'}
      />

      <StarRating rating={rating} setRating={setRating} />

      <DetailedReview
        onImageAdd={pickImage}
        onTextChange={setReviewText}
        image={image}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
