import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CheckoutBottomBarProps {
  finalTotal: number;
  loading: boolean;
  onPlaceOrder: () => void;
  formatPrice: (price: number) => string;
}

const CheckoutBottomBar: React.FC<CheckoutBottomBarProps> = ({ 
  finalTotal, 
  loading, 
  onPlaceOrder, 
  formatPrice 
}) => {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Tổng: {formatPrice(finalTotal)}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.orderButton, loading && styles.orderButtonDisabled]}
        onPress={onPlaceOrder}
        disabled={loading}
      >
        <Text style={styles.orderButtonText}>
          {loading ? 'Đang xử lý...' : 'Đặt hàng'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flex: 1,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  orderButton: {
    backgroundColor: '#5C4033',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  orderButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
});
export default CheckoutBottomBar;