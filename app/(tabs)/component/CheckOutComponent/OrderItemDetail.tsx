import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type BillDetailItemType = {
  _id: string;
  bill_id: {
    _id: string;
    status?: string;
  };
  product_id: {
    _id: string;
    name: string;
    price: number;
    image_url: string;
  };
  size: string;
  quantity: number;
  price: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

interface OrderItemDetailProps {
  orderItem: BillDetailItemType;
  onPress?: () => void;
  showReviewButton?: boolean;
  onReview?: () => void;
}

const OrderItemDetail: React.FC<OrderItemDetailProps> = ({ 
  orderItem, 
  onPress, 
  showReviewButton = false,
  onReview 
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const calculateDiscount = () => {
    const originalTotal = orderItem.product_id.price * orderItem.quantity;
    const actualTotal = orderItem.total;
    return originalTotal - actualTotal;
  };

  const discountAmount = calculateDiscount();
  const hasDiscount = discountAmount > 0;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.productCard}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ 
              uri: orderItem.product_id.image_url || 'https://via.placeholder.com/100x100?text=No+Image' 
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>SALE</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {orderItem.product_id.name}
          </Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.sizeContainer}>
              <Icon name="resize-outline" size={14} color="#666" />
              <Text style={styles.sizeText}>Size: {orderItem.size}</Text>
            </View>
            <View style={styles.quantityContainer}>
              <Icon name="cube-outline" size={14} color="#666" />
              <Text style={styles.quantityText}>SL: {orderItem.quantity}</Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.unitPriceLabel}>Đơn giá:</Text>
              <View style={styles.priceContainer}>
                {hasDiscount && (
                  <Text style={styles.originalPrice}>
                    {formatPrice(orderItem.product_id.price)}
                  </Text>
                )}
                <Text style={styles.currentPrice}>
                  {formatPrice(orderItem.price)}
                </Text>
              </View>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Thành tiền:</Text>
              <Text style={styles.totalPrice}>
                {formatPrice(orderItem.total)}
              </Text>
            </View>
            
            {hasDiscount && (
              <View style={styles.savingsRow}>
                <Icon name="pricetag" size={14} color="#34C759" />
                <Text style={styles.savingsText}>
                  Tiết kiệm {formatPrice(discountAmount)}
                </Text>
              </View>
            )}
          </View>

          {/* Review Button */}
          {showReviewButton && (
            <TouchableOpacity 
              style={styles.reviewButton}
              onPress={onReview}
            >
              <Icon name="star-outline" size={16} color="#5C4033" />
              <Text style={styles.reviewButtonText}>Đánh giá</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Info Bar */}
      <View style={styles.quickInfoBar}>
        <View style={styles.infoItem}>
          <Icon name="checkmark-circle" size={16} color="#34C759" />
          <Text style={styles.infoText}>Chính hãng</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="shield-checkmark" size={16} color="#007AFF" />
          <Text style={styles.infoText}>Bảo hành</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="refresh" size={16} color="#FF9500" />
          <Text style={styles.infoText}>Đổi trả 7 ngày</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  productCard: {
    flexDirection: 'row',
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  discountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sizeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  priceSection: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  unitPriceLabel: {
    fontSize: 13,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  currentPrice: {
    fontSize: 14,
    color: '#5C4033',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 18,
    color: '#5C4033',
    fontWeight: '700',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  savingsText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F6F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5C4033',
    marginTop: 8,
  },
  reviewButtonText: {
    color: '#5C4033',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  quickInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default OrderItemDetail;