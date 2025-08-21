import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

type ProductCardProps = {
  imageUrl: string;
  category: string;
  name: string;
  price: number;
};

const ProductCard: React.FC<ProductCardProps> = ({ imageUrl, category, name, price }) => {
  return (
    <View style={styles.container}>
      {/* Product Image with overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.1)']}
          style={styles.imageOverlay}
        />
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.contentContainer}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {name}
          </Text>
          
        </View>

        {/* Review indicator */}
        <View style={styles.reviewIndicator}>
          <Icon name="star" size={12} color="#FFD700" />
          <Text style={styles.reviewText}>Đánh giá sản phẩm này</Text>
        </View>
      </View>

      {/* Decorative elements */}
      <View style={styles.decorativeCorner}>
        <Icon name="checkmark-circle" size={16} color="#4CAF50" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    elevation: 8,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 107, 53, 0.1)',
  },
  
  imageContainer: {
    position: 'relative',
    height: 120,
    width: '100%',
  },
  
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C4033',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  contentContainer: {
    padding: 16,
  },
  
  productInfo: {
    marginBottom: 12,
  },
  
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    lineHeight: 22,
    marginBottom: 8,
  },
  
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  
  reviewIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  
  reviewText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5C4033',
    marginLeft: 4,
  },
  
  decorativeCorner: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 4,
    elevation: 2,
  },
});

export default ProductCard;