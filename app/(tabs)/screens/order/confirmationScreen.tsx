import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
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
import { BASE_URL } from '../../services/api';
import checkoutService, { PendingOrder } from '../../services/checkoutService';
import { registerForPushNotificationsAsync } from '../notification/PushTokenService';
import { getUserData } from '../utils/storage';

interface PaymentConfirmationProps {
  navigation: any;
  route: {
    params: {
      pendingOrder: PendingOrder;
      selectedItemIds: string[];
      sizeQuantityList: [];
      voucher_User: string;
    };
  };
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const ConfirmationScreen: React.FC<PaymentConfirmationProps> = ({
  navigation,
  route
}) => {
  const { pendingOrder } = route.params;
  const { sizeQuantityList } = route.params;
  const { voucher_User } = route.params;

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 phút
  const [isTimeoutHandled, setIsTimeoutHandled] = useState(false);
  const timerRef = useRef<number | null>(null);
  const [pushToken, setPushToken] = useState('')

  useEffect(() => {
    console.log("pendingOrder:", pendingOrder);
    console.log("sizeQuantityList:", sizeQuantityList);
    console.log("voucher_User:", voucher_User);
    fetchDatatoken();
  }, []);

  const fetchDatatoken = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setPushToken(token);
        console.log('🔐 Token:', token);
        console.log("V")
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy push token:', error);
    }
  };

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
            clearInterval(timerRef.current!);
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

  // ✅ FIX: Xử lý safe cho formatPrice
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined || isNaN(price)) {
      return '0đ';
    }
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
      
      await checkoutService.clearSelectedCartItems(pendingOrder.orderData.items.map(item => item.id));
      console.log("Dữ liệu data: ", pendingOrder.orderData.items);
      
      const userId = await getUserData('accountId');
      console.log("userid :", userId);

      // 🔍 DEBUG: Kiểm tra các giá trị voucher trước khi xử lý
      console.log("🔍 DEBUG VOUCHER:");
      console.log("- pendingOrder.orderData.voucherCode:", pendingOrder.orderData.voucherCode);
      console.log("- voucher_User:", voucher_User);
      console.log("- voucher_User type:", typeof voucher_User);

      // ✅ CHỈ GỌI API UPDATE VOUCHER KHI THỰC SỰ CÓ SỬ DỤNG VOUCHER
      // ❌ KHÔNG CẦN gọi markVoucherAsUsed ở đây vì:
      // - COD: Voucher đã được mark "in_use" khi tạo đơn hàng
      // - Voucher sẽ được mark "used" khi shipper hoàn thành đơn hàng
      if (pendingOrder.orderData.voucherCode && voucher_User) {
        console.log("ℹ️ Đơn COD có voucher - voucher đã được mark 'in_use' khi tạo đơn");
        console.log("ℹ️ Voucher sẽ được mark 'used' khi shipper hoàn thành giao hàng");
      } else {
        console.log("ℹ️ Không có voucher được sử dụng");
      }

      // Giảm số lượng sản phẩm trong kho
      for (const item of sizeQuantityList) {
        const payload = {
          sizeId: item.sizeId,
          quantityToDecrease: item.quantity,
        };

        try {
          const res = await axios.post(`${BASE_URL}/decrease-quantity`, payload);
          console.log("✔️ Giảm thành công:", res.data);
        } catch (err) {
          console.error("❌ Giảm thất bại:", err.response?.data || err.message);
          console.error("❌ Payload sent:", payload); // Log payload for debugging
        }
      }

      // Gửi thông báo push notification
      await Notifications.scheduleNotificationAsync({
        content: {
          to: `${pushToken}`,
          sound: "custom",
          title: "Đặt hàng thành công !",
          body: "Vui lòng chờ Admin xác nhận đơn hàng",
          data: { "foo": "bar" },
          android: {
            channelId: "orders",
            icon: "notification-icon", 
            color: "#5C4033",
          }
        },
        trigger: null,
      });
      // Điều hướng và thông báo thành công
       try {
          const userId = await getUserData('userId');
                console.log('👤 UserID:', userId);
          const payload = {
            title: "Đặt hàng thành công",
            content: `Bạn vừa đặt thành công đơn hàng ${pendingOrder.billId.slice(-8).toUpperCase()}.`,
            user_id: userId, // Gửi notification đến user hiện tại
          };
          console.log('Notification payload:', payload);
          const res = await axios.post(`${BASE_URL}/notifications`, payload);
          console.log('Notification sent:', res.data);         

        } catch (error) {
          console.error('Error sending notification:', error);
        }

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
        billId: pendingOrder.billId,
        sizeQuantityList,
        pendingOrder
      });
    } else {
      // COD or other methods - confirm directly
      handleConfirmPayment();
    }
  };

  // ✅ FIX: Tính phí ship chính xác từ orderData
  const shippingFee = pendingOrder.orderData.shippingFee || 0;

  // ✅ FIX: Chuẩn hóa hiển thị phương thức thanh toán
  const getDisplayPaymentMethod = (paymentMethod: string) => {
    const method = paymentMethod?.toLowerCase() || '';
    
    if (method.includes('cod') || method.includes('tiền mặt') || method.includes('khi nhận')) {
      return 'Thanh toán khi nhận hàng (COD)';
    }
    if (method.includes('momo')) {
      return 'Ví MoMo';
    }
    if (method.includes('vnpay')) {
      return 'VNPAY';
    }
    if (method.includes('zalopay')) {
      return 'ZaloPay';
    }
    if (method.includes('chuyển khoản')) {
      return 'Chuyển khoản ngân hàng';
    }
    
    return paymentMethod;
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
            <Ionicons name="storefront-outline" size={60} color="#5C4033" />
          </View>
          <Text style={styles.title}>Xác nhận đơn hàng</Text>
          <Text style={styles.subtitle}>
            🧁 Cảm ơn bạn đã đặt bánh! Vui lòng xác nhận đơn hàng
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
          <Text style={styles.sectionTitle}>🧾 Thông tin đơn hàng</Text>

          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
              <Text style={styles.infoValue}>#{pendingOrder.billId.slice(-8).toUpperCase()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thanh toán:</Text>
              <Text style={styles.infoValue}>
                {getDisplayPaymentMethod(pendingOrder.orderData.paymentMethod)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vận chuyển:</Text>
              <Text style={styles.infoValue}>{pendingOrder.orderData.shippingMethod}</Text>
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Địa chỉ giao hàng</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons name="person" size={16} color="#5C4033" />
              <Text style={styles.addressName}>{pendingOrder.orderData.address?.name}</Text>
            </View>
            <View style={styles.addressRow}>
              <Ionicons name="call" size={14} color="#666" />
              <Text style={styles.addressPhone}>{pendingOrder.orderData.address?.phone}</Text>
            </View>
            <View style={styles.addressRow}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.addressText}>
                {`${pendingOrder.orderData.address?.detail_address}, ${pendingOrder.orderData.address?.ward}, ${pendingOrder.orderData.address?.district}, ${pendingOrder.orderData.address?.city}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧁 Sản phẩm đã đặt ({pendingOrder.orderData.items.length})</Text>
          {pendingOrder.orderData.items.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.title}</Text>
                <View style={styles.productDetails}>
                  <Text style={styles.productVariant}>Size: {item.Size}</Text>
                  <Text style={styles.productQuantity}>SL: {item.quantity}</Text>
                </View>
                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
              </View>
              <View style={styles.productTotal}>
                <Text style={styles.productTotalText}>
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Chi tiết thanh toán</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính:</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(pendingOrder.orderData.originalTotal)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng:</Text>
            <Text style={styles.summaryValue}>
              {shippingFee > 0 ? formatPrice(shippingFee) : 'Miễn phí'}
            </Text>
          </View>

          {(pendingOrder.orderData.discountAmount || 0) > 0 && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm giá:</Text>
                <Text style={[styles.summaryValue, { color: '#34C759' }]}>
                  -{formatPrice(pendingOrder.orderData.discountAmount || 0)}
                </Text>
              </View>

              {pendingOrder.orderData.voucherCode && (
                <View style={styles.voucherRow}>
                  <Ionicons name="ticket" size={16} color="#5C4033" />
                  <Text style={styles.voucherCode}>
                    Mã: {pendingOrder.orderData.voucherCode}
                  </Text>
                </View>
              )}
            </>
          )}

          <View style={styles.divider} />

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
            <Text style={styles.sectionTitle}>📝 Ghi chú</Text>
            <View style={styles.noteContainer}>
              <Ionicons name="chatbubble-outline" size={16} color="#5C4033" />
              <Text style={styles.noteText}>"{pendingOrder.orderData.note}"</Text>
            </View>
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
            {pendingOrder.orderData.paymentMethod === 'VNPAY' ? 'Thanh toán' : 'Xác nhận đặt bánh'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F3',
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
    borderBottomColor: '#F0E6D6',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF8F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F0E6D6',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5C4033',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B6914',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97706',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0E6D6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5C4033',
    marginBottom: 16,
  },
  orderInfo: {
    backgroundColor: '#FFF8F3',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E6D6',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8B5A2B',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C4033',
    flex: 1,
    textAlign: 'right',
  },
  addressCard: {
    backgroundColor: '#FFF8F3',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E6D6',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C4033',
    marginLeft: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  addressPhone: {
    fontSize: 14,
    color: '#8B5A2B',
    marginLeft: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#8B5A2B',
    lineHeight: 20,
    marginLeft: 6,
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D6',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F9F9F9',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C4033',
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productVariant: {
    fontSize: 12,
    color: '#8B5A2B',
  },
  productQuantity: {
    fontSize: 12,
    color: '#8B5A2B',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D97706',
  },
  productTotal: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  productTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C4033',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8B5A2B',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5C4033',
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
    color: '#15803D',
    marginLeft: 6,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E6D6',
    marginVertical: 12,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#D97706',
    paddingTop: 12,
    marginTop: 8,
    backgroundColor: '#FEF3C7',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C4033',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D97706',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8F3',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0E6D6',
  },
  noteText: {
    fontSize: 14,
    color: '#8B5A2B',
    fontStyle: 'italic',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  sweetMessage: {
    margin: 16,
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
  },
  sweetMessageText: {
    fontSize: 14,
    color: '#D97706',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0E6D6',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
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