import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import checkoutService, { PendingOrder } from '../../services/checkoutService';

interface PaymentConfirmationProps {
  navigation: any;
  route: {
    params: {
      pendingOrder: PendingOrder;
    };
  };
}

const ConfirmationScreen: React.FC<PaymentConfirmationProps> = ({
  navigation,
  route
}) => {
  const { pendingOrder } = route.params;
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 phút
  const [isTimeoutHandled, setIsTimeoutHandled] = useState(false);
  const timerRef = useRef<number | null>(null);




  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Xác nhận',
        'Bạn có muốn hủy đơn hàng này không?',
        [
          { text: 'Không', style: 'cancel' },
          {
            text: 'Hủy đơn',
            style: 'destructive',
            onPress: handleCancelOrder,
          }
        ]

      );
      setIsTimeoutHandled(false)
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Countdown timer
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (!isTimeoutHandled) {
            setIsTimeoutHandled(true);
            clearInterval(timerRef.current!); // dừng timer khi hết giờ
            handleTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      backHandler.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimeoutHandled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const handleTimeout = async () => {
    try {
      await checkoutService.cancelPendingBill(pendingOrder.billId);
      return (
        Alert.alert(
          'Hết thời gian',
          'Đơn hàng đã bị hủy do quá thời gian thanh toán.',
          [{ text: 'OK', onPress: () => navigation.navigate('TabNavigator', { screen: 'Home' }) }]
        )
      )
    } catch (error) {
      console.error('Lỗi hủy đơn hàng:', error);
    }
  };

  const handleCancelOrder = async () => {
  if (timerRef.current !== null) clearInterval(timerRef.current);
  setIsTimeoutHandled(true);

  try {
    setLoading(true);
    await checkoutService.cancelPendingBill(pendingOrder.billId);
    navigation.navigate('TabNavigator', { screen: 'Home' });
  } catch (error) {
    Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
  } finally {
    setLoading(false);
  }
};

  const handleConfirmPayment = async () => {
  if (timerRef.current !== null) clearInterval(timerRef.current);
  setIsTimeoutHandled(true);

  try {
    setLoading(true);
    await checkoutService.confirmPayment(
      pendingOrder.billId,
      pendingOrder.orderData.items
    );

    Alert.alert(
      'Thành công!',
      'Đơn hàng đã được xác nhận thành công.',
      [
        {
          text: 'Xem đơn hàng',
          onPress: () => navigation.navigate('OrderHistoryScreen')
        },
        {
          text: 'OK',
          onPress: () => navigation.navigate('TabNavigator', { screen: 'Home' })
        }
      ]
    );
  } catch (error) {
    Alert.alert('Lỗi', error.message || 'Không thể xác nhận đơn hàng');
  } finally {
    setLoading(false);
  }
};

  const handlePaymentMethod = () => {
    const { paymentMethod } = pendingOrder.orderData;

    if (paymentMethod === 'VNPAY') {
      // Redirect to VNPAY payment
      navigation.navigate('payment', {
        total: pendingOrder.orderData.total,
        billId: pendingOrder.billId
      });
    } else {
      // COD or other methods - confirm directly
      handleConfirmPayment();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5C4033" />
        <Text style={styles.loadingText}>Đang xử lý...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="card-outline" size={60} color="#5C4033" />
          </View>
          <Text style={styles.title}>Đang chờ thanh toán</Text>
          <Text style={styles.subtitle}>
            Vui lòng hoàn tất thanh toán trong thời gian quy định
          </Text>

          {/* Countdown */}
          <View style={styles.countdownContainer}>
            <Ionicons name="time-outline" size={20} color="#FF6B35" />
            <Text style={styles.countdownText}>
              Thời gian còn lại: {formatTime(countdown)}
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>

          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
              <Text style={styles.infoValue}>#{pendingOrder.billId.slice(-8).toUpperCase()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phương thức thanh toán:</Text>
              <Text style={styles.infoValue}>{pendingOrder.orderData.paymentMethod}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phương thức vận chuyển:</Text>
              <Text style={styles.infoValue}>{pendingOrder.orderData.shippingMethod}</Text>
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{pendingOrder.orderData.address?.name}</Text>
            <Text style={styles.addressPhone}>{pendingOrder.orderData.address?.phone}</Text>
            <Text style={styles.addressText}>
              {`${pendingOrder.orderData.address?.detail_address}, ${pendingOrder.orderData.address?.ward}, ${pendingOrder.orderData.address?.district}, ${pendingOrder.orderData.address?.city}`}
            </Text>
          </View>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm ({pendingOrder.orderData.items.length})</Text>
          {pendingOrder.orderData.items.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.title}</Text>
                <Text style={styles.productVariant}>{item.Size}</Text>
                <View style={styles.productBottom}>
                  <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                  <Text style={styles.productQuantity}>x{item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng tiền hàng:</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(pendingOrder.orderData.originalTotal)}
            </Text>
          </View>

          {pendingOrder.orderData.discountAmount > 0 && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm giá:</Text>
                <Text style={[styles.summaryValue, { color: '#34C759' }]}>
                  -{formatPrice(pendingOrder.orderData.discountAmount)}
                </Text>
              </View>

              {pendingOrder.orderData.voucherCode && (
                <View style={styles.voucherRow}>
                  <Ionicons name="pricetag" size={16} color="#5C4033" />
                  <Text style={styles.voucherCode}>
                    Mã: {pendingOrder.orderData.voucherCode}
                  </Text>
                </View>
              )}
            </>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
            <Text style={styles.totalValue}>
              {formatPrice(pendingOrder.orderData.total)}
            </Text>
          </View>
        </View>

        {/* Note */}
        {pendingOrder.orderData.note && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <Text style={styles.noteText}>"{pendingOrder.orderData.note}"</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelOrder}
          disabled={loading}
        >
          <Ionicons name="close-circle-outline" size={20} color="#FF3B30" />
          <Text style={styles.cancelButtonText}>Hủy đơn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handlePaymentMethod}
          disabled={loading}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.confirmButtonText}>
            {pendingOrder.orderData.paymentMethod === 'VNPAY' ? 'Thanh toán' : 'Xác nhận'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F6F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  orderInfo: {
    backgroundColor: '#F8F6F3',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  addressCard: {
    backgroundColor: '#F8F6F3',
    borderRadius: 12,
    padding: 16,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  productCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productVariant: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C4033',
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  voucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F0F8F0',
    padding: 8,
    borderRadius: 6,
  },
  voucherCode: {
    fontSize: 12,
    color: '#5C4033',
    marginLeft: 6,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5C4033',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    backgroundColor: '#F8F6F3',
    padding: 12,
    borderRadius: 8,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5C4033',
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default ConfirmationScreen;