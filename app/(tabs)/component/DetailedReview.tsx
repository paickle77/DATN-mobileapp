import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

type DetailedReviewProps = {
  reviewText: string;
  onImageAdd: () => void;
  onTextChange: (text: string) => void;
  uploadedImage?: string | null;
};

const DetailedReview: React.FC<DetailedReviewProps> = ({ 
  reviewText, 
  onImageAdd, 
  onTextChange, 
  uploadedImage 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(reviewText.length);

  const handleTextChange = (text: string) => {
    setCharCount(text.length);
    onTextChange(text);
  };

  const getPlaceholderText = () => {
    const placeholders = [
      "Chia sẻ trải nghiệm của bạn về sản phẩm này...",
      "Sản phẩm có đúng như mong đợi không?",
      "Chất lượng, thiết kế, tính năng như thế nào?",
      "Bạn có giới thiệu sản phẩm này cho bạn bè không?"
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  const getSuggestions = () => [
    { icon: "checkmark-circle", text: "Chất lượng tốt", color: "#4CAF50" },
    { icon: "heart", text: "Thiết kế đẹp", color: "#E91E63" },
    { icon: "flash", text: "Giao hàng nhanh", color: "#FF9800" },
    { icon: "shield-checkmark", text: "Đáng tin cậy", color: "#2196F3" }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#5C4033', '#72604bff']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Icon name="create-outline" size={20} color="#FFF" />
          <Text style={styles.headerTitle}>Viết đánh giá chi tiết</Text>
        </LinearGradient>
      </View>

      {/* Text Input Container */}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused
      ]}>
        {/* Input Header */}
        <View style={styles.inputHeader}>
          <Text style={styles.inputLabel}>Nội dung đánh giá</Text>
          <View style={styles.charCountContainer}>
            <Text style={[
              styles.charCount,
              charCount > 450 && styles.charCountWarning,
              charCount >= 500 && styles.charCountError
            ]}>
              {charCount}/500
            </Text>
          </View>
        </View>

        {/* Text Input */}
        <TextInput
          style={[
            styles.textInput,
            isFocused && styles.textInputFocused
          ]}
          placeholder={getPlaceholderText()}
          placeholderTextColor="#A0AEC0"
          value={reviewText}
          onChangeText={handleTextChange}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={500}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Quick Suggestions */}
        {reviewText.length === 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Gợi ý nhanh:</Text>
            <View style={styles.suggestionsRow}>
              {getSuggestions().map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleTextChange(reviewText + suggestion.text + " ")}
                >
                  <Icon name={suggestion.icon} size={14} color={suggestion.color} />
                  <Text style={[styles.suggestionText, { color: suggestion.color }]}>
                    {suggestion.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Image Upload Section */}
      <View style={styles.imageSection}>
        <View style={styles.imageSectionHeader}>
          <Icon name="images-outline" size={18} color="#5C4033" />
          <Text style={styles.imageSectionTitle}>Thêm hình ảnh</Text>
          <Text style={styles.imageSectionSubtitle}>(tùy chọn)</Text>
        </View>

        {uploadedImage ? (
          // Image Preview
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: uploadedImage }} style={styles.imagePreview} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            >
              <TouchableOpacity style={styles.changeImageButton} onPress={onImageAdd}>
                <Icon name="camera" size={16} color="#FFF" />
                <Text style={styles.changeImageText}>Thay đổi</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          // Upload Button
          <TouchableOpacity style={styles.uploadButton} onPress={onImageAdd}>
            <LinearGradient
              colors={['rgba(255, 107, 53, 0.1)', 'rgba(247, 147, 30, 0.1)']}
              style={styles.uploadButtonGradient}
            >
              <View style={styles.uploadIconContainer}>
                <Icon name="camera-outline" size={32} color="#5C4033" />
              </View>
              <Text style={styles.uploadButtonTitle}>Chọn ảnh từ thư viện</Text>
              <Text style={styles.uploadButtonSubtitle}>
                Hình ảnh thật sẽ giúp đánh giá của bạn hữu ích hơn
              </Text>
              
              {/* Upload Features */}
              <View style={styles.uploadFeatures}>
                <View style={styles.uploadFeature}>
                  <Icon name="shield-checkmark" size={14} color="#4CAF50" />
                  <Text style={styles.uploadFeatureText}>An toàn</Text>
                </View>
                <View style={styles.uploadFeature}>
                  <Icon name="flash" size={14} color="#FF9800" />
                  <Text style={styles.uploadFeatureText}>Nhanh chóng</Text>
                </View>
                <View style={styles.uploadFeature}>
                  <Icon name="resize" size={14} color="#2196F3" />
                  <Text style={styles.uploadFeatureText}>Tự động tối ưu</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 16,
  },

  // Header
  header: {
    marginBottom: 20,
  },

  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 8,
  },

  // Input Container
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  inputContainerFocused: {
    borderColor: '#FF6B35',
    elevation: 8,
    shadowColor: '#5C4033',
    shadowOpacity: 0.15,
  },

  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },

  charCountContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  charCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7F8C8D',
  },

  charCountWarning: {
    color: '#F39C12',
  },

  charCountError: {
    color: '#E74C3C',
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#FAFAFA',
    minHeight: 140,
    lineHeight: 24,
  },

  textInputFocused: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF',
  },

  // Suggestions
  suggestionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
  },

  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  suggestionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Image Section
  imageSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  imageSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  imageSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },

  imageSectionSubtitle: {
    fontSize: 12,
    color: '#95A5A6',
    marginLeft: 4,
    fontStyle: 'italic',
  },

  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  uploadButtonGradient: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.2)',
    borderStyle: 'dashed',
    borderRadius: 12,
  },

  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  uploadButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C4033',
    marginBottom: 4,
  },

  uploadButtonSubtitle: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },

  uploadFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },

  uploadFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  uploadFeatureText: {
    fontSize: 11,
    color: '#7F8C8D',
    marginLeft: 4,
    fontWeight: '500',
  },

  // Image Preview
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },

  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },

  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-end',
  },

  changeImageText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },


 
})

export default DetailedReview;
