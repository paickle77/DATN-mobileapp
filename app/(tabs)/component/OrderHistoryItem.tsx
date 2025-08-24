// OrderHistoryItem.tsx
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import React from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getUserData } from '../screens/utils/storage';

const { width } = Dimensions.get('window');

type OrderType = {
  __v?: number;
  _id: string;
  Account_id: string | { _id: string };
  address_id?: string | null;
  address_snapshot?: {
    name?: string;
    phone?: string;
    detail?: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  createdAt?: string;
  created_at: string;
  note?: string;
  payment_method?: string;
  shipping_method?: string;
  status: 'pending' | 'confirmed' | 'ready' | 'shipping' | 'done' | 'cancelled' | 'failed' | 'refund_pending' | 'refunded';
  total: number;
  original_total?: number;
  discount_amount?: number;
  voucher_code?: string;
  shipping_fee?: number;
  payment_confirmed_at?: string;
  delivered_at?: string;
  updatedAt?: string;
  user_id?: {
    _id: string;
    address_id?: string;
    created_at?: string;
    email?: string;
    facebook_id?: null | string;
    google_id?: null | string;
    image?: string;
    isDefault?: boolean;
    is_lock?: boolean;
    name?: string;
    password?: string;
    phone?: string;
    provider?: string;
    role?: string;
    updated_at?: string;
  };
};

interface OrderItemProps {
  order: OrderType;
  onPress: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  BASE_URL: string;
  onRefresh?: () => void;
}

const OrderHistoryItem: React.FC<OrderItemProps> = ({
  order,
  onPress,
  onCancel,
  onReorder,
  BASE_URL,
  onRefresh,
}) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status ? status.toLowerCase() : '';

    switch (normalizedStatus) {
      case 'pending':
        return {
          text: 'Chờ xác nhận',
          color: '#FF6B35',
          bgColor: '#FFF3E0',
          icon: 'time-outline',
        };
      case 'confirmed':
        return {
          text: 'Đang chuẩn bị',
          color: '#2196F3',
          bgColor: '#E3F2FD',
          icon: 'restaurant-outline',
        };
      case 'ready':
        return {
          text: 'Sẵn sàng giao',
          color: '#9C27B0',
          bgColor: '#F3E5F5',
          icon: 'checkmark-circle-outline',
        };
      case 'shipping':
        return {
          text: 'Đang giao',
          color: '#4CAF50',
          bgColor: '#E8F5E9',
          icon: 'bicycle-outline',
        };
      case 'done':
        return {
          text: 'Hoàn thành',
          color: '#4CAF50',
          bgColor: '#E8F5E9',
          icon: 'checkmark-done-outline',
        };
      case 'cancelled':
        return {
          text: 'Đã hủy',
          color: '#F44336',
          bgColor: '#FFEBEE',
          icon: 'close-circle-outline',
        };
      case 'failed':
        return {
          text: 'Hoàn trả',
          color: '#F44336',
          bgColor: '#FFEBEE',
          icon: 'return-up-back-outline',
        };
      case 'refund_pending':
        return {
          text: 'Chờ hoàn tiền',
          color: '#FF9800',
          bgColor: '#FFF3E0',
          icon: 'hourglass-outline',
        };
      case 'refunded':
        return {
          text: 'Đã hoàn tiền',
          color: '#4CAF50',
          bgColor: '#E8F5E9',
          icon: 'checkmark-done-circle-outline',
        };
      default:
        return {
          text: status || 'N/A',
          color: '#757575',
          bgColor: '#F5F5F5',
          icon: 'help-circle-outline',
        };
    }
  };

  const formatPrice = (price?: number | null): string => {
    if (price === null || price === undefined || isNaN(Number(price))) {
      return '0đ';
    }
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
      return '0đ';
    }
    return numPrice.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayPaymentMethod = (paymentMethod?: string): string => {
    if (!paymentMethod) return 'N/A';
    const method = String(paymentMethod).toLowerCase();

    if (method.includes('cod') || method.includes('tiền mặt') || method.includes('khi nhận')) {
      return 'Tiền mặt';
    }
    if (method.includes('momo')) return 'MoMo';
    if (method.includes('vnpay')) return 'VNPAY';
    if (method.includes('zalopay')) return 'ZaloPay';
    if (method.includes('chuyển khoản') || method.includes('banking')) {
      return 'Chuyển khoản';
    }
    return paymentMethod;
  };

  const getPaymentIcon = (paymentMethod?: string): string => {
    if (!paymentMethod) return 'help-circle-outline';
    const method = String(paymentMethod).toLowerCase();

    if (method.includes('cod') || method.includes('tiền mặt') || method.includes('khi nhận')) {
      return 'cash-outline';
    }
    if (method.includes('momo') || method.includes('vnpay') || method.includes('zalopay')) {
      return 'wallet-outline';
    }
    if (method.includes('chuyển khoản') || method.includes('banking')) {
      return 'card-outline';
    }
    return 'wallet-outline';
  };

  const canCancelOrder = (status: string): boolean => {
    return status.toLowerCase() === 'pending'; // ✅ Chỉ cho hủy khi pending
  };

  const canReview = (status: string): boolean => {
    return status.toLowerCase() === 'done';
  };

  const canReorder = (status: string): boolean => {
    return ['done', 'cancelled'].includes(status.toLowerCase());
  };

  const handleCancelOrder = (): void => {
    Alert.alert(
      'Hủy đơn bánh? 🥺',
      'Bạn có chắc chắn muốn hủy đơn bánh này không? Lưu ý: Chỉ có thể hủy đơn khi chưa được xác nhận. Nếu đã thanh toán online, chúng tôi sẽ hoàn tiền cho bạn.',
      [
        { 
          text: 'Không hủy', 
          style: 'cancel',
          onPress: () => console.log('Không hủy')
        },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              // ✅ Gọi API hủy đơn từ phía khách hàng
              const accountId = await getUserData('accountId');
              await axios.post(`${BASE_URL}/bills/cancel-by-customer`, { 
                orderId: order._id,
                Account_id: accountId,
                reason: 'Khách hàng hủy đơn'
              });
              
              if (onRefresh) onRefresh();
              
              // Kiểm tra xem có phải thanh toán online không
              const isOnlinePayment = order.payment_method && 
                (order.payment_method.toLowerCase().includes('vnpay') ||
                 order.payment_method.toLowerCase().includes('momo') ||
                 order.payment_method.toLowerCase().includes('zalopay') ||
                 order.payment_method.toLowerCase().includes('online'));

              const isPaid = order.payment_confirmed_at != null;
              
              if (isOnlinePayment && isPaid) {
                Alert.alert('✅ Đã hủy', 'Đơn bánh đã được hủy và đang chờ xử lý hoàn tiền. Chúng tôi sẽ hoàn tiền trong 3-5 ngày làm việc.');
              } else {
                Alert.alert('✅ Đã hủy', 'Đơn bánh đã được hủy thành công!');
              }
            } catch (error: any) {
              console.error('Error cancelling order:', error);
              const errorMessage = error?.response?.data?.message || 'Không thể hủy đơn hàng';
              Alert.alert('❌ Lỗi', errorMessage);
            }
          }
        }
      ]
    );
  };

  const handleReorder = (): void => {
    if (onReorder) {
      onReorder(order._id);
    }
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => onPress(order._id)}
      activeOpacity={0.95}
    >
      <View style={[styles.statusBanner, { backgroundColor: statusConfig.bgColor }]}>
        <View style={styles.statusBannerContent}>
          <View style={styles.statusLeft}>
            <Ionicons name={statusConfig.icon as any} size={20} color={statusConfig.color} />
            <Text style={[styles.statusBannerText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
          <View style={styles.orderIdBadge}>
            <Text style={styles.orderIdText}>
              #{order._id?.slice(-6)?.toUpperCase() || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.infoSection}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.dateText}>
              {formatDate(order.created_at)}
            </Text>
          </View>

          {order.address_snapshot && order.address_snapshot.name && (
            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={14} color="#FF6B35" />
              <Text style={styles.addressText} numberOfLines={2}>
                <Text style={styles.addressName}>{order.address_snapshot.name || ''}</Text>
                {(order.address_snapshot.district || order.address_snapshot.city) && (
                  <Text style={styles.addressDetail}>
                    {'\n'}{order.address_snapshot.district || ''}{order.address_snapshot.district && order.address_snapshot.city ? ', ' : ''}{order.address_snapshot.city || ''}
                  </Text>
                )}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.priceSection}>
          <View style={styles.priceBreakdown}>
            {order.original_total !== undefined && order.original_total > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Tiền bánh:</Text>
                <Text style={styles.priceValue}>{formatPrice(order.original_total)}</Text>
              </View>
            )}
            
            {order.shipping_fee !== undefined && order.shipping_fee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Phí giao:</Text>
                <Text style={styles.priceValue}>{formatPrice(order.shipping_fee)}</Text>
              </View>
            )}
            
            {order.discount_amount !== undefined && order.discount_amount > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Giảm giá:</Text>
                <Text style={[styles.priceValue, styles.discountText]}>
                  -{formatPrice(order.discount_amount)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.totalSection}>
            <View style={styles.paymentInfo}>
              <Ionicons
                name={getPaymentIcon(order.payment_method) as any}
                size={16}
                color="#4A90E2"
              />
              <Text style={styles.paymentMethodText}>
                {getDisplayPaymentMethod(order.payment_method)}
              </Text>
            </View>
            <Text style={styles.totalAmount}>{formatPrice(order.total)}</Text>
          </View>
        </View>

        {order.voucher_code && (
          <View style={styles.voucherContainer}>
            <Ionicons name="pricetag-outline" size={14} color="#28A745" />
            <Text style={styles.voucherText}>
              Đã dùng mã: {order.voucher_code || 'N/A'}
            </Text>
          </View>
        )}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.viewDetailButton}
            onPress={() => onPress(order._id)}
          >
            <Ionicons name="eye-outline" size={16} color="#4A90E2" />
            <Text style={styles.viewDetailText}>Chi tiết</Text>
          </TouchableOpacity>

          {canReview(order.status) && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => onPress(order._id)}
            >
              <Ionicons name="star-outline" size={16} color="#FFD700" />
              <Text style={styles.reviewText}>Đánh giá</Text>
            </TouchableOpacity>
          )}

          {canReorder(order.status) && (
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={handleReorder}
            >
              <Ionicons name="refresh-outline" size={16} color="#28A745" />
              <Text style={styles.reorderText}>Đặt lại</Text>
            </TouchableOpacity>
          )}

          {canCancelOrder(order.status) && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <Ionicons name="close-outline" size={16} color="#E74C3C" />
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statusBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  statusBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusBannerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  orderIdBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  orderIdText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF007FFF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
  },
  addressText: {
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  addressDetail: {
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '400',
  },
  priceSection: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  priceBreakdown: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 13,
    color: '#2C3E50',
    fontWeight: '600',
  },
  discountText: {
    color: '#28A745',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E74C3C',
  },
  voucherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C3E6C3',
  },
  voucherText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#28A745',
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  viewDetailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  viewDetailText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBF0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  reviewText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '600',
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FFF0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#28A745',
  },
  reorderText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#28A745',
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  cancelText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
});

export default OrderHistoryItem;