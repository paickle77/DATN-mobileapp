import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import OrderItemDetail from '../../component/CheckOutComponent/OrderItemDetail';
import { BASE_URL } from '../../services/api';

const { width } = Dimensions.get('window');

type BillDetailItemType = {
  _id: string;
  bill_id: {
    _id: string;
    status: string;
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

type ReviewType = {
  productId: string;
  rating: number;
  comment: string;
};

const OrderDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params as { orderId: string };

  const [data, setData] = useState<BillDetailItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  console.log('✅✅✅Order ID từ params:', orderId);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}/GetAllBillDetails`);
      const allData: BillDetailItemType[] = response.data.data;
      console.log('✅ Dữ liệu chi tiết đơn hàng:', allData);
      
      const filteredData = allData.filter(
        (item: BillDetailItemType) =>
          item?.bill_id?._id === orderId &&
          item?.product_id !== null
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

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const getOrderStatus = () => {
    if (data.length > 0) {
      return data[0].bill_id.status;
    }
    return '';
  };

  const isOrderCompleted = () => {
    const status = getOrderStatus();
    return status === 'delivered' || status === 'done';
  };

  const navigateToReview = async (productId?: string) => {
    try {
      if (productId) {
        // Đánh giá một sản phẩm cụ thể
        await AsyncStorage.setItem('productID', productId);
        navigation.navigate('comment');
      } else {
        // Đánh giá sản phẩm đầu tiên trong đơn hàng (hoặc tất cả)
        if (data.length > 0) {
          await AsyncStorage.setItem('productID', data[0].product_id._id);
          navigation.navigate('comment');
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chuyển đến trang đánh giá');
      console.error('Error navigating to review:', error);
    }
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
          onPress={() => navigateToReview(item.product_id._id)}
        >
          <Icon name="star-outline" size={16} color="#5C4033" />
          <Text style={styles.individualReviewButtonText}>Đánh giá sản phẩm này</Text>
        </TouchableOpacity>
      )}
    </View>
  );


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5C4033" />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
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

  const totalAmount = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#5C4033', '#7A5A47']}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Info Card */}
        <View style={styles.orderInfoCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderIdContainer}>
              <Icon name="receipt-outline" size={20} color="#5C4033" />
              <Text style={styles.orderId}>
                #{orderId.slice(-8).toUpperCase()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { 
              backgroundColor: isOrderCompleted() ? '#34C759' : '#007AFF' 
            }]}>
              <Text style={styles.statusText}>
                {isOrderCompleted() ? 'Hoàn thành' : 'Đang xử lý'}
              </Text>
            </View>
          </View>
        </View>

        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="bag-outline" size={20} color="#5C4033" />
            <Text style={styles.sectionTitle}>Sản phẩm đã đặt ({data.length})</Text>
          </View>
          
          {data.length > 0 ? (
            <View style={styles.productsContainer}>
              {data.map(renderProductItem)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="bag-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
            </View>
          )}
        </View>

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tạm tính:</Text>
            <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
            <Text style={styles.totalValue}>Miễn phí</Text>
          </View>
          <View style={[styles.totalRow, styles.finalTotal]}>
            <Text style={styles.finalTotalLabel}>Tổng thanh toán:</Text>
            <Text style={styles.finalTotalValue}>{formatPrice(totalAmount)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {isOrderCompleted() && !hasReviewed && (
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.reviewAllButton}
              onPress={() => navigateToReview()}
            >
              <Icon name="star-outline" size={20} color="#FFFFFF" />
              <Text style={styles.reviewButtonText}>Đánh giá tất cả sản phẩm</Text>
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#5C4033',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orderInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5C4033',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  productsContainer: {
    marginTop: -16, // Compensate for the section padding
  },
  productItemContainer: {
    marginBottom: 12,
  },
  individualReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F6F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5C4033',
    marginTop: 8,
    marginHorizontal: 16,
  },
  individualReviewButtonText: {
    color: '#5C4033',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  totalSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
    paddingTop: 16,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5C4033',
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
    borderRadius: 12,
    shadowColor: '#5C4033',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
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
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 32,
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