import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaymentSectionProps {
  selectedPaymentMethod: string;
  selectedPaymentName: string;
  onPress: () => void;
  canUseCOD?: boolean; // ✅ Thêm prop để kiểm tra COD eligibility
  codCheckLoading?: boolean; // ✅ Loading state cho COD check
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ 
  selectedPaymentMethod, 
  selectedPaymentName, 
  onPress,
  canUseCOD = true, // ✅ Mặc định cho phép COD
  codCheckLoading = false // ✅ Mặc định không loading
}) => {
  // ✅ Debug log
  console.log('💳 PaymentSection props:', {
    selectedPaymentMethod,
    selectedPaymentName,
    canUseCOD,
    codCheckLoading
  });
  const getPaymentIcon = () => {
    if (!selectedPaymentMethod) return null;

    // ✅ FIX: Cập nhật logic hiển thị phương thức thanh toán
    if (selectedPaymentMethod === 'cod' || selectedPaymentName?.toLowerCase().includes('tiền mặt') || selectedPaymentName?.toLowerCase().includes('khi nhận')) {
      return 'cash-outline';
    }
    if (selectedPaymentMethod.includes('momo') || selectedPaymentName?.toLowerCase().includes('momo')) {
      return 'wallet-outline';
    }
    if (selectedPaymentMethod.includes('zalopay') || selectedPaymentName?.toLowerCase().includes('zalopay')) {
      return 'wallet-outline';
    }
    if (selectedPaymentMethod.includes('vnpay') || selectedPaymentName?.toLowerCase().includes('vnpay')) {
      return 'wallet-outline';
    }
    if (selectedPaymentMethod.includes('card') || selectedPaymentName?.toLowerCase().includes('chuyển khoản')) {
      return 'card-outline';
    }

    return 'wallet-outline';
  };

  // ✅ FIX: Chuẩn hóa tên hiển thị
  const getDisplayPaymentName = () => {
    if (!selectedPaymentName) return 'Chọn phương thức thanh toán';

    // Chuẩn hóa tên hiển thị
    const name = selectedPaymentName.toLowerCase();
    
    if (name.includes('cod') || name.includes('tiền mặt') || name.includes('khi nhận')) {
      return 'Thanh toán khi nhận hàng';
    }
    if (name.includes('momo')) {
      return 'Ví MoMo';
    }
    if (name.includes('vnpay')) {
      return 'VNPAY';
    }
    if (name.includes('zalopay')) {
      return 'ZaloPay';
    }
    if (name.includes('chuyển khoản')) {
      return 'Chuyển khoản ngân hàng';
    }

    return selectedPaymentName;
  };

  const getPaymentColor = () => {
    if (!selectedPaymentMethod) return '#999';

    const method = selectedPaymentMethod.toLowerCase();
    const name = selectedPaymentName?.toLowerCase() || '';

    if (method === 'cod' || name.includes('tiền mặt') || name.includes('khi nhận')) {
      return '#34C759'; // Xanh lá cho COD
    }
    if (method.includes('momo') || name.includes('momo')) {
      return '#A50064'; // Màu MoMo
    }
    if (method.includes('vnpay') || name.includes('vnpay')) {
      return '#1E88E5'; // Màu VNPAY
    }
    if (method.includes('zalopay') || name.includes('zalopay')) {
      return '#0068FF'; // Màu ZaloPay
    }

    return '#007AFF'; // Màu mặc định
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
                color={getPaymentColor()}
              />
              <Text style={[styles.paymentText, { color: getPaymentColor() }]}>
                {getDisplayPaymentName()}
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
      
      {/* ✅ Chỉ hiển thị warning khi COD bị chặn VÀ chưa chọn phương thức online */}
      {!canUseCOD && !selectedPaymentMethod && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning-outline" size={16} color="#FF9500" />
          <Text style={styles.warningText}>
            Bạn đã từng từ chối nhận hàng khi chọn COD. Vui lòng thanh toán online để tiếp tục.
          </Text>
        </View>
      )}

      {/* ✅ Hiển thị loading state */}
      {codCheckLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang kiểm tra phương thức thanh toán...</Text>
        </View>
      )}
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
    fontWeight: '500',
    marginLeft: 8,
  },
  paymentPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  // ✅ Thêm styles cho warning và loading
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  warningText: {
    fontSize: 13,
    color: '#FF9500',
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default PaymentSection;