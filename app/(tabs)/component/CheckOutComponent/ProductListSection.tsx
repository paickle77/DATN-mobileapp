import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CartItem } from '../../services/checkoutService';

interface ProductListSectionProps {
  listCart: CartItem[];
  onBackToCart: () => void;
  formatPrice: (price: number) => string;
}

const ProductCard: React.FC<{ 
  item: CartItem; 
  formatPrice: (price: number) => string; 
}> = ({ item, formatPrice }) => (
  <View style={styles.productCard}>
    <Image source={{ uri: item.image }} style={styles.productImage} />
    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.productVariant}>Size: {item.Size}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
      </View>
    </View>
    <View style={styles.totalSection}>
      <Text style={styles.totalPrice}>
        {formatPrice(item.price * item.quantity)}
      </Text>
      <Text style={styles.productQuantity}>SL: {item.quantity}</Text>
    </View>
  </View>
);

const ProductListSection: React.FC<ProductListSectionProps> = ({ 
  listCart, 
  onBackToCart, 
  formatPrice 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bag-outline" size={20} color="#e74c3c" />
          <Text style={styles.headerTitle}>
            Sản phẩm đã chọn ({listCart.length})
          </Text>
        </View>
      </View>
      
      {listCart.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="basket-outline" size={48} color="#bdc3c7" />
          <Text style={styles.emptyText}>
            Không có sản phẩm nào được chọn
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackToCart}
          >
            <Text style={styles.backButtonText}>Quay lại giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.productList}>
          {listCart.map((item, index) => (
            <ProductCard 
              key={`${item.id}-${index}`} 
              item={item} 
              formatPrice={formatPrice} 
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  productList: {
    paddingHorizontal: 12,
  },
  productCard: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    lineHeight: 18,
    marginBottom: 6,
  },
  productVariant: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  
  totalSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e74c3c',
    textAlign: 'right',
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
export default ProductListSection;