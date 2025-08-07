import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaymentSectionProps {
  selectedPaymentMethod: string;
  selectedPaymentName: string;
  onPress: () => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ 
  selectedPaymentMethod, 
  selectedPaymentName, 
  onPress 
}) => {
  const getPaymentIcon = () => {
    if (!selectedPaymentMethod) return null;

    if (selectedPaymentMethod === 'cod') return 'cash-outline';
    if (selectedPaymentMethod.includes('momo')) return 'wallet-outline';
    if (selectedPaymentMethod.includes('zalopay')) return 'wallet-outline';
    if (selectedPaymentMethod.includes('vnpay')) return 'wallet-outline';
    if (selectedPaymentMethod.includes('card')) return 'card-outline';

    return 'wallet-outline';
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="card-outline" size={20} color="#e74c3c" />
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
      </View>
      <TouchableOpacity style={styles.paymentCard} onPress={onPress}>
        <View style={styles.paymentInfo}>
          {selectedPaymentMethod ? (
            <>
              <Ionicons
                name={getPaymentIcon() as keyof typeof Ionicons.glyphMap}
                size={20}
                color="#007AFF"
              />
              <Text style={styles.paymentText}>
                {selectedPaymentName}
              </Text>
            </>
          ) : (
            <Text style={styles.paymentPlaceholder}>
              Chọn phương thức thanh toán
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
  },
  paymentPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
});

export default PaymentSection;