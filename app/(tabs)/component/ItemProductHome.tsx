import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import type { Product } from '../services/ProductsService';

const { width } = Dimensions.get('window');

interface ItemProductHomeProps {
  item: Product;
  index: number;
  rating: number;
  onPress: () => void;
  onLoadRating: (productId: string) => void;
}

export default function ItemProductHome({ 
  item, 
  index,
  rating, 
  onPress, 
  onLoadRating 
}: ItemProductHomeProps) {
  const hasDiscount = item.discount_price > 0 && item.discount_price < item.price;
  const displayPrice = hasDiscount ? item.discount_price : item.price;
  const discountPercent = hasDiscount ? Math.round(((item.price - item.discount_price) / item.price) * 100) : 0;
  const [hasLoadedRating, setHasLoadedRating] = useState(false);

  useEffect(() => {
    if (rating === 0 && !hasLoadedRating) {
      setHasLoadedRating(true);
      setTimeout(() => {
        onLoadRating(item._id);
      }, Math.floor(index / 2) * 100);
    }
  }, [item._id, rating, hasLoadedRating, onLoadRating, index]);

  return (
    <View style={styles.productWrapper}>
      <TouchableOpacity
        style={styles.modernGridItem}
        onPress={onPress}
        activeOpacity={0.95}
      >
        <View style={styles.modernImageContainer}>
          <Image source={{ uri: item.image_url }} style={styles.modernCakeImage} />

          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discountPercent}%</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.modernFavoriteButton}
            onPress={() => console.log('Toggle favorite')}
          >
            <Ionicons name="heart-outline" size={18} color="#fff" />
          </TouchableOpacity>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.1)']}
            style={styles.modernImageOverlay}
          />
        </View>

        <View style={styles.modernProductInfo}>
          <Text style={styles.modernCakeName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>

          <View style={styles.modernPriceSection}>
            <View style={styles.priceColumn}>
              <View style={styles.originalPriceRow}>
                {hasDiscount ? (
                  <Text style={styles.modernOriginalPrice}>
                    {item.price.toLocaleString()}₫
                  </Text>
                ) : (
                  <View style={styles.emptyPriceSpace} />
                )}
              </View>
              <Text style={styles.modernPriceText}>
                {displayPrice.toLocaleString()}₫
              </Text>
            </View>

            <View style={styles.modernRatingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.modernRatingText}>
                {rating > 0 ? rating.toFixed(1) : '0.0'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  productWrapper: {
    width: (width - 48) / 2,
    marginBottom: 20,
  },

  modernGridItem: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
  },

  modernImageContainer: {
    position: 'relative',
    height: 160,
  },

  modernCakeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  modernImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },

  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  modernFavoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modernProductInfo: {
    padding: 16,
    position: 'relative',
  },

  modernCakeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 20,
    marginBottom: 12,
    height: 20,
  },

  modernPriceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },

  priceColumn: {
    flex: 1,
    minHeight: 36, // Đảm bảo chiều cao cố định
  },

  originalPriceRow: {
    height: 16, // Chiều cao cố định cho dòng giá gốc
    marginBottom: 2,
  },

  emptyPriceSpace: {
    height: 14, // Tương đương với chiều cao của text originalPrice
  },

  modernOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },

  modernPriceText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
    height: 20, // Chiều cao cố định
  },

  modernRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  modernRatingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});
