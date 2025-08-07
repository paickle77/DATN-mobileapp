import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface OrderSummarySectionProps {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  finalTotal: number;
  formatPrice: (price: number) => string;
}

const SummaryRow: React.FC<{
  label: string;
  value: string;
  isTotal?: boolean;
  isDiscount?: boolean;
}> = ({ label, value, isTotal = false, isDiscount = false }) => (
  <View style={[styles.summaryRow, isTotal && styles.totalRow]}>
    <Text style={isTotal ? styles.totalLabel : styles.summaryLabel}>
      {label}
    </Text>
    <Text style={[
      isTotal ? styles.totalValue : styles.summaryValue,
      isDiscount && { color: '#34C759' }
    ]}>
      {isDiscount ? `-${value}` : value}
    </Text>
  </View>
);

const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({ 
  subtotal, 
  shippingFee, 
  discountAmount, 
  finalTotal, 
  formatPrice 
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
      <SummaryRow 
        label="Giá trị đơn hàng" 
        value={formatPrice(subtotal)} 
      />
      <SummaryRow 
        label="Phí vận chuyển" 
        value={formatPrice(shippingFee)} 
      />
      <SummaryRow 
        label="Giảm giá" 
        value={formatPrice(discountAmount)}
        isDiscount
      />
      <SummaryRow 
        label="Tổng cộng" 
        value={formatPrice(finalTotal)}
        isTotal
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default OrderSummarySection;