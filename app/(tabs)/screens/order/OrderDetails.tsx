import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import OrderItemDetail from '../../component/CheckOutComponent/OrderItemDetail';
import { BASE_URL } from '../../services/api';

type BillDetailItemType = {
  _id: string;
  bill_id: {
    _id: string;
    status: string;
    total: number;
    original_total?: number;
    discount_amount?: number;
    voucher_code?: string;
    shipping_fee?: number;
    address_snapshot?: {
      name: string;
      phone: string;
      detail: string;
      ward: string;
      district: string;
      city: string;
    };
    payment_method?: string;
    shipping_method?: string;
    note?: string;
    created_at?: string;
  };
  // Legacy structure
  product_id?: {
    _id: string;
    name: string;
    price: number;
    image_url: string;
  };
  // New structure
  product_snapshot?: {
    name: string;
    base_price: number;
    discount_price?: number;
    image_url: string;
    selected_size?: string;
    size_price_increase?: number;
    final_unit_price: number;
  };
  size: string;
  quantity: number;
  price?: number; // Legacy
  unit_price?: number; // New
  total: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

const OrderDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params as { orderId: string };

  const [data, setData] = useState<BillDetailItemType[]>([]);
  const [billInfo, setBillInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasReviewed] = useState(false);

  console.log('✅✅✅Order ID từ params:', orderId);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy thông tin bill và bill details
      const [billResponse, billDetailsResponse] = await Promise.all([
        axios.get(`${BASE_URL}/bills`),
        axios.get(`${BASE_URL}/GetAllBillDetails`)
      ]);
      
      // Tìm thông tin bill theo ID
      const currentBill = billResponse.data.data.find((bill: any) => bill._id === orderId);
      if (currentBill) {
        setBillInfo(currentBill);
      }
      
      // Lọc bill details theo order ID
      const allBillDetails: BillDetailItemType[] = billDetailsResponse.data.data;
      console.log('✅ Dữ liệu chi tiết đơn hàng:', allBillDetails);
      
      const filteredData = allBillDetails.filter(
        (item: BillDetailItemType) =>
          item?.bill_id?._id === orderId &&
          (item?.product_id !== null || item?.product_snapshot !== null)
      );

      console.log('✅ Dữ liệu chi tiết đơn hàng (đã lọc):', filteredData);
      setData(filteredData);
      
    } catch (err) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', err);
      setError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchData();
    } else {
      setLoading(false);
      setError('Không tìm thấy ID đơn hàng để hiển thị.');
    }
  }, [orderId]);

  const formatPrice = (price?: number | null) => {
    const safePrice = Number(price);
    if (isNaN(safePrice)) {
      return '0đ';
    }
    return safePrice.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateString?: string) => {
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

  const getOrderStatus = () => {
    if (billInfo) {
      return billInfo.status;
    }
    if (data.length > 0) {
      return data[0].bill_id.status;
    }
    return '';
  };

  const getStatusConfig = (status: string) => {
    const normalizedStatus = status ? status.toLowerCase() : '';
    
    switch (normalizedStatus) {
      case 'pending':
        return {
          text: 'Chờ xác nhận',
          color: '#FF9500',
          bgColor: '#FFF5E6',
          icon: 'hourglass-outline',
          description: 'Đơn bánh đang chờ xác nhận từ cửa hàng'
        };
      case 'confirmed':
        return {
          text: 'Đang chuẩn bị',
          color: '#007AFF',
          bgColor: '#E6F3FF',
          icon: 'restaurant-outline',
          description: 'Thầy bánh đang chuẩn bị nguyên liệu và làm bánh'
        };
      case 'ready':
        return {
          text: 'Sẵn sàng giao',
          color: '#5856D6',
          bgColor: '#F0F0FF',
          icon: 'checkmark-circle-outline',
          description: 'Bánh đã hoàn thành, chờ shipper đến lấy'
        };
      case 'shipping':
        return {
          text: 'Đang giao',
          color: '#34C759',
          bgColor: '#E6FFE6',
          icon: 'bicycle-outline',
          description: 'Shipper đang giao bánh đến địa chỉ của bạn'
        };
      case 'done':
        return {
          text: 'Hoàn thành',
          color: '#28A745',
          bgColor: '#E6F7E6',
          icon: 'heart-outline',
          description: 'Giao hàng thành công! Cảm ơn bạn đã tin tưởng!'
        };
      case 'cancelled':
        return {
          text: 'Đã hủy',
          color: '#FF3B30',
          bgColor: '#FFE6E6',
          icon: 'sad-outline',
          description: 'Đơn hàng đã bị hủy'
        };
      case 'failed':
        return {
          text: 'Hoàn trả',
          color: '#DC3545',
          bgColor: '#FFE6E6',
          icon: 'return-up-back-outline',
          description: 'Khách không nhận, đã hoàn trả về cửa hàng'
        };
      default:
        return {
          text: status || 'N/A',
          color: '#8E8E93',
          bgColor: '#F5F5F5',
          icon: 'help-circle-outline',
          description: ''
        };
    }
  };

  const isOrderCompleted = () => {
    const status = getOrderStatus();
    return status === 'delivered' || status === 'done';
  };

  const navigateToReview = async (productId?: string) => {
    try {
      let targetProductId = productId;
      console.log("PRODUCTID!!!: ",productId)
      if (!targetProductId && data.length > 0) {
        // Try to get product ID from either structure
        const firstItem = data[0];
        if (firstItem.product_id?._id) {
          targetProductId = firstItem.product_id._id;
        } else if (firstItem.product_snapshot) {
          // For new structure, we might need to use a different identifier
          // You may need to adjust this based on your backend implementation
          targetProductId = firstItem._id; // or another identifier
        }
      }

      if (targetProductId) {
      console.log("targetProductId", targetProductId);
navigation.navigate('Review' as never, { ProductID: targetProductId } as never);

      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin sản phẩm để đánh giá');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chuyển đến trang đánh giá');
      console.error('Error navigating to review:', error);
    }
  };

  const getProductId = (item: BillDetailItemType) => {
    console.log("item :",item.product_id)
    return item.product_id;
  };

  const renderProductItem = (item: BillDetailItemType) => (
    <View key={item._id} style={styles.productItemContainer}>
      <OrderItemDetail 
        orderItem={item}
        showReviewButton={false}
      />
      
      {/* Individual Review Button for completed orders */}
      {isOrderCompleted() && !hasReviewed && (
        <TouchableOpacity 
          style={styles.individualReviewButton}
          onPress={() => navigateToReview(item.product_id)}
        >
          <Icon name="star-outline" size={16} color="#5C4033" />
          <Text style={styles.individualReviewButtonText}>Đánh giá bánh này</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5C4033" />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn bánh...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalAmount = billInfo?.total || data.reduce((sum, item) => sum + (item.total || 0), 0);
  const originalTotal = billInfo?.original_total || 0;
  const shippingFee = billInfo?.shipping_fee || 0;
  const discountAmount = billInfo?.discount_amount || 0;
  const status = getOrderStatus();
  const statusConfig = getStatusConfig(status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#5C4033', '#8B4513']}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chi tiết đơn bánh</Text>
          <Text style={styles.headerSubtitle}>#{orderId?.slice(-8)?.toUpperCase() || 'N/A'}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Icon name={statusConfig.icon} size={24} color={statusConfig.color} />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
              <Text style={styles.statusDescription}>{statusConfig.description}</Text>
            </View>
          </View>
          
          {billInfo?.created_at && (
            <Text style={styles.orderDate}>
              Đặt lúc: {formatDate(billInfo.created_at)}
            </Text>
          )}
        </View>

        {/* Address Section */}
        {billInfo?.address_snapshot && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="location-outline" size={20} color="#5C4033" />
              <Text style={styles.sectionTitle}>Địa chỉ giao bánh</Text>
            </View>
            
            <View style={styles.addressCard}>
              <View style={styles.addressRow}>
                <Icon name="person-outline" size={16} color="#5C4033" />
                <Text style={styles.addressName}>{billInfo.address_snapshot.name || 'N/A'}</Text>
              </View>
              
              <View style={styles.addressRow}>
                <Icon name="call-outline" size={16} color="#8B5A2B" />
                <Text style={styles.addressPhone}>{billInfo.address_snapshot.phone || 'N/A'}</Text>
              </View>
              
              <View style={styles.addressRow}>
                <Icon name="home-outline" size={16} color="#8B5A2B" />
                <Text style={styles.addressText}>
                  {`${billInfo.address_snapshot.detail || ''}, ${billInfo.address_snapshot.ward || ''}, ${billInfo.address_snapshot.district || ''}, ${billInfo.address_snapshot.city || ''}`}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Info Section */}
        {billInfo && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="information-circle-outline" size={20} color="#5C4033" />
              <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
            </View>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Icon name="card-outline" size={16} color="#D97706" />
                <Text style={styles.infoLabel}>Thanh toán:</Text>
                <Text style={styles.infoValue}>{billInfo.payment_method || 'N/A'}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Icon name="car-outline" size={16} color="#D97706" />
                <Text style={styles.infoLabel}>Giao hàng:</Text>
                <Text style={styles.infoValue}>{billInfo.shipping_method || 'N/A'}</Text>
              </View>
              
              {billInfo.voucher_code && (
                <View style={styles.infoItem}>
                  <Icon name="ticket-outline" size={16} color="#15803D" />
                  <Text style={styles.infoLabel}>Mã giảm giá:</Text>
                  <Text style={[styles.infoValue, { color: '#15803D' }]}>{billInfo.voucher_code}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="cafe-outline" size={20} color="#5C4033" />
            <Text style={styles.sectionTitle}>Bánh đã đặt ({data.length})</Text>
          </View>
          
          {data.length > 0 ? (
            <View style={styles.productsContainer}>
              {data.map(renderProductItem)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="cafe-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
            </View>
          )}
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="calculator-outline" size={20} color="#5C4033" />
            <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          </View>
          
          <View style={styles.paymentCard}>
            {originalTotal > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tiền bánh:</Text>
                <Text style={styles.totalValue}>{formatPrice(originalTotal)}</Text>
              </View>
            )}
            
            {shippingFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Phí giao hàng:</Text>
                <Text style={styles.totalValue}>{formatPrice(shippingFee)}</Text>
              </View>
            )}
            
            {discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Giảm giá:</Text>
                <Text style={[styles.totalValue, { color: '#34C759' }]}>-{formatPrice(discountAmount)}</Text>
              </View>
            )}
            
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={styles.finalTotalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.finalTotalValue}>{formatPrice(totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Note Section */}
        {billInfo?.note && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="chatbubble-outline" size={20} color="#5C4033" />
              <Text style={styles.sectionTitle}>Ghi chú</Text>
            </View>
            <View style={styles.noteCard}>
              <Icon name="quote-outline" size={16} color="#8B5A2B" />
              <Text style={styles.noteText}>"{billInfo.note}"</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {isOrderCompleted() && !hasReviewed && (
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.reviewAllButton}
              onPress={() => navigateToReview()}
            >
              <Icon name="star" size={20} color="#FFFFFF" />
              <Text style={styles.reviewButtonText}>Đánh giá tất cả bánh</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasReviewed && (
          <View style={styles.reviewedSection}>
            <Icon name="checkmark-circle" size={24} color="#34C759" />
            <Text style={styles.reviewedText}>Bạn đã đánh giá đơn hàng này</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF8F3',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B5A2B',
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#5C4033',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#5C4033',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#5C4033',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0E6D6',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#8B5A2B',
    lineHeight: 20,
  },
  orderDate: {
    fontSize: 13,
    color: '#B8860B',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#5C4033',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0E6D6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C4033',
    marginLeft: 8,
  },
  addressCard: {
    backgroundColor: 'rgba(92, 64, 51, 0.02)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E6D6',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C4033',
    marginLeft: 8,
    flex: 1,
  },
  addressPhone: {
    fontSize: 14,
    color: '#8B5A2B',
    marginLeft: 8,
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#8B5A2B',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.05)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    color: '#8B5A2B',
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#5C4033',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  productsContainer: {
    marginTop: -8,
  },
  productItemContainer: {
    marginBottom: 12,
    backgroundColor: 'rgba(92, 64, 51, 0.02)',
    borderRadius: 12,
    padding: 12,
  },
  individualReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE047',
    marginTop: 8,
  },
  individualReviewButtonText: {
    color: '#B45309',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  paymentCard: {
    backgroundColor: 'rgba(92, 64, 51, 0.02)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0E6D6',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#8B5A2B',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 14,
    color: '#5C4033',
    fontWeight: '600',
  },
  finalTotal: {
    borderTopWidth: 2,
    borderTopColor: '#D97706',
    marginTop: 12,
    paddingTop: 16,
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5C4033',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D97706',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(139, 90, 43, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 90, 43, 0.1)',
  },
  noteText: {
    fontSize: 14,
    color: '#8B5A2B',
    fontStyle: 'italic',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  reviewAllButton: {
    backgroundColor: '#5C4033',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#5C4033',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewedSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 20,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  reviewedText: {
    color: '#166534',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});

export default OrderDetails;