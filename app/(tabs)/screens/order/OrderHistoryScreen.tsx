import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the back icon
import axios from 'axios';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Interfaces
interface Order {
  id: string;
  orderDate: string;
  status: 'processing' | 'shipping' | 'delivered' | 'cancelled';
  imageUrl: string;
  productName: string;
  shop: string;
  quantity: number;
  totalPrice: number;
  originalPrice: number;
  deliveryDate?: string;
  estimatedDelivery?: string;
  trackingCode?: string;
  cancelReason?: string;
  estimatedCompletion?: string;
  canReview?: boolean;
  canReorder?: boolean;
}

interface FilterOption {
  key: string;
  label: string;
  count: number;
}

interface StatusConfig {
  icon: string;
  text: string;
  color: string;
  backgroundColor: string;
}

const { width } = Dimensions.get('window');
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

const OrderHistoryScreen: React.FC = () => {
const ReviewScreen = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const orders: Order[] = [
    {
      id: 'DH001',
      orderDate: '15/12/2024',
      status: 'delivered',
      imageUrl: 'https://i.imgur.com/ndRMwPL.jpg',
      productName: 'Bánh sinh nhật chocolate premium',
      shop: 'Sweet Bakery',
      quantity: 1,
      totalPrice: 650000,
      originalPrice: 750000,
      deliveryDate: '16/12/2024',
      canReview: true,
      canReorder: true
    },
    {
      id: 'DH002', 
      orderDate: '10/12/2024',
      status: 'shipping',
      imageUrl: 'https://i.imgur.com/3QdM8Ye.jpg',
      productName: 'Bánh kem dâu tây tươi',
      shop: 'Cake House',
      quantity: 2,
      totalPrice: 480000,
      originalPrice: 480000,
      estimatedDelivery: '25/12/2024',
      trackingCode: 'GH123456789'
    },
    {
      id: 'DH003',
      orderDate: '05/12/2024', 
      status: 'cancelled',
      imageUrl: 'https://i.imgur.com/9u1t1Xv.jpg',
      productName: 'Set bánh cupcake 12 cái',
      shop: 'Cupcake Corner',
      quantity: 1,
      totalPrice: 320000,
      originalPrice: 320000,
      cancelReason: 'Hết hàng'
    },
    {
      id: 'DH004',
      orderDate: '28/11/2024',
      status: 'processing', 
      imageUrl: 'https://i.imgur.com/ndRMwPL.jpg',
      productName: 'Bánh sinh nhật tùy chỉnh',
      shop: 'Custom Cakes',
      quantity: 1,
      totalPrice: 890000,
      originalPrice: 890000,
      estimatedCompletion: '30/12/2024'
    }
  ];

  const getFilterOptions = (): FilterOption[] => [
    { key: 'all', label: 'Tất cả', count: orders.length },
    { key: 'processing', label: 'Đang xử lý', count: orders.filter(o => o.status === 'processing').length },
    { key: 'shipping', label: 'Đang giao', count: orders.filter(o => o.status === 'shipping').length },
    { key: 'delivered', label: 'Đã giao', count: orders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', label: 'Đã hủy', count: orders.filter(o => o.status === 'cancelled').length }
  ];

  const getStatusConfig = (status: Order['status']): StatusConfig => {
    const configs: Record<Order['status'], StatusConfig> = {
      processing: {
        icon: 'clock',
        text: 'Đang xử lý',
        color: '#F97316',
        backgroundColor: '#FFF7ED'
      },
      shipping: {
        icon: 'truck',
        text: 'Đang giao hàng',
        color: '#3B82F6',
        backgroundColor: '#EFF6FF'
      },
      delivered: {
        icon: 'check-circle',
        text: 'Đã giao hàng',
        color: '#10B981',
        backgroundColor: '#ECFDF5'
      },
      cancelled: {
        icon: 'x-circle',
        text: 'Đã hủy',
        color: '#EF4444',
        backgroundColor: '#FEF2F2'
      }
    };
    return configs[status];
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const filteredOrders = orders.filter((order: Order) => {
    const matchesFilter = selectedFilter === 'all' || order.status === selectedFilter;
    const matchesSearch = order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.shop.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderFilterTab = ({ item }: { item: FilterOption }) => (
    <TouchableOpacity
      key={item.key}
      onPress={() => setSelectedFilter(item.key)}
      style={[
        styles.filterTab,
        selectedFilter === item.key ? styles.filterTabActive : styles.filterTabInactive
      ]}
    >
      <Text style={[
        styles.filterTabText,
        selectedFilter === item.key ? styles.filterTabTextActive : styles.filterTabTextInactive
      ]}>
        {item.label} ({item.count})
      </Text>
    </TouchableOpacity>
  );

  const renderOrderCard = ({ item: order }: { item: Order }) => {
    const statusConfig = getStatusConfig(order.status);
    
    return (
      <View style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderId}>#{order.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
              <Feather name={statusConfig.icon as any} size={12} color={statusConfig.color} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>
          <View style={styles.orderDate}>
            <Feather name="calendar" size={12} color="#9CA3AF" />
            <Text style={styles.orderDateText}>{order.orderDate}</Text>
          </View>
        </View>
        
        <Text style={styles.shopName}>{order.shop}</Text>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Image source={{ uri: order.imageUrl }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>{order.productName}</Text>
            <Text style={styles.quantity}>Số lượng: {order.quantity}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.totalPrice}>{formatPrice(order.totalPrice)}</Text>
              {order.originalPrice !== order.totalPrice && (
                <Text style={styles.originalPrice}>{formatPrice(order.originalPrice)}</Text>
              )}
            </View>

            {/* Status specific info */}
            {order.status === 'shipping' && order.trackingCode && (
              <Text style={styles.trackingCode}>Mã vận đơn: {order.trackingCode}</Text>
            )}
            {order.status === 'delivered' && order.deliveryDate && (
              <Text style={styles.deliveryInfo}>Đã giao: {order.deliveryDate}</Text>
            )}
            {order.status === 'cancelled' && order.cancelReason && (
              <Text style={styles.cancelInfo}>Lý do hủy: {order.cancelReason}</Text>
            )}
            {order.status === 'processing' && order.estimatedCompletion && (
              <Text style={styles.processingInfo}>Dự kiến hoàn thành: {order.estimatedCompletion}</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButtonSecondary}>
            <Feather name="eye" size={16} color="#6B7280" />
            <Text style={styles.actionButtonSecondaryText}>Chi tiết</Text>
          </TouchableOpacity>
          
          {order.status === 'shipping' && (
            <TouchableOpacity style={styles.actionButtonPrimary}>
              <Feather name="truck" size={16} color="#3B82F6" />
              <Text style={styles.actionButtonPrimaryText}>Theo dõi</Text>
            </TouchableOpacity>
          )}
          
          {order.canReorder && (
            <TouchableOpacity style={styles.actionButtonSuccess}>
              <Feather name="rotate-ccw" size={16} color="#10B981" />
              <Text style={styles.actionButtonSuccessText}>Mua lại</Text>
            </TouchableOpacity>
          )}
          
          {order.canReview && (
            <TouchableOpacity style={styles.actionButtonWarning}>
              <Feather name="star" size={16} color="#F59E0B" />
              <Text style={styles.actionButtonWarningText}>Đánh giá</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.actionButtonIcon}>
            <Feather name="message-circle" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="package" size={48} color="#9CA3AF" />
      <Text style={styles.emptyStateTitle}>Không tìm thấy đơn hàng nào</Text>
      <Text style={styles.emptyStateSubtitle}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</Text>
    </View>
  );
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  type OrderType = {
    __v: number;
    _id: string;
    address_id: {
      __v: number;
      _id: string;
      city: string;
      detail_address: string;
      district: string;
      isDefault: boolean;
      latitude: string;
      longitude: string;
      name: string;
      phone: string;
      user_id: string;
      ward: string;
    };
    createdAt: string;
    created_at: string;
    note: string;
    payment_method: string;
    shipping_method: string;
    status: string;
    total: number;
    updatedAt: string;
    user_id: {
      _id: string;
      address_id: string;
      created_at: string;
      email: string;
      facebook_id: null | string; // Có thể là null
      google_id: null | string; // Có thể là null
      image: string;
      isDefault: boolean;
      is_lock: boolean;
      name: string;
      password: string;
      phone: string;
      provider: string;
      role: string;
      updated_at: string;
    };
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/GetAllBills`);
      const userData = await getUserData('userData'); // giả sử userData là object chứa _id

      const allOrders: OrderType[] = response.data.data;
      const filteredOrders = allOrders.filter((order: OrderType) => {
        let orderUserId: string | undefined;
        if (order.user_id && typeof order.user_id === 'object') {
          orderUserId = order.user_id._id ?? undefined;
        } else if (typeof order.user_id === 'string') {
          orderUserId = order.user_id;
        }
        return orderUserId === (userData?._id ?? userData);
      });

      console.log('✅✅✅Đơn hàng của người dùng:', filteredOrders);
      setOrders(filteredOrders);
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      console.error('Lỗi khi gọi API đơn hàng:', errorMessage);
      Alert.alert('Lỗi', 'Lỗi khi tải đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReviewPress = (orderId: string) => {
    console.log('Đi tới đánh giá đơn:', orderId);
    navigation.navigate('OderDetails', { orderId });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="filter" size={24} color="#111827" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4B2E2E" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Lịch sử đơn hàng</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder="Tìm kiếm theo tên sản phẩm, mã đơn hàng..."
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          data={getFilterOptions()}
          renderItem={renderFilterTab}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.orderList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Hiển thị {filteredOrders.length} đơn hàng
          </Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {orders.length === 0 ? (
          <View style={styles.emptyOrdersContainer}>
            <Text style={styles.emptyOrdersText}>Bạn chưa có đơn hàng nào.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.userRow}>
                <Image
                  source={{ uri: 'https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg' }}
                  style={styles.userImage}
                />
                <View>
                  <Text style={styles.userName}>{order.address_id?.name || 'N/A'}</Text>
                  <Text style={styles.userPhone}>{order.address_id?.phone || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
                <Text style={styles.addressText}>
                  {order.address_id?.detail_address}, {order.address_id?.ward},{' '}
                  {order.address_id?.district}, {order.address_id?.city}
                </Text>
              </View>

              {order.note && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Ghi chú</Text>
                  <Text style={styles.noteText}>{order.note}</Text>
                </View>
              )}

              <View style={styles.summarySection}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Tổng tiền:</Text>
                  <Text style={styles.value}>
                    {Number(order.total).toLocaleString('vi-VN')}đ
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Trạng thái:</Text>
                  <Text style={[styles.value, styles.statusText]}>{order.status}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Ngày đặt:</Text>
                  <Text style={styles.value}>
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => handleReviewPress(order._id)}
              >
                <Text style={styles.reviewButtonText}>Xem chi tiết đơn hàng</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  container: {
    flex: 1,
    backgroundColor: '#FDF7EE', // Lighter background for a softer feel
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    padding: 16,
    paddingTop: 40, // Adjust for status bar
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
    borderBottomColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  filterTabInactive: {
    backgroundColor: '#F3F4F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  filterTabTextInactive: {
    color: '#6B7280',
  },
  orderList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  orderDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  shopName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  trackingCode: {
    fontSize: 12,
    color: '#3B82F6',
  },
  deliveryInfo: {
    fontSize: 12,
    color: '#10B981',
  },
  cancelInfo: {
    fontSize: 12,
    color: '#EF4444',
  },
  processingInfo: {
    fontSize: 12,
    color: '#F97316',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 8,
  },
  actionButtonSuccess: {
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B2E2E',
    flex: 1, // Allows title to take available space
    textAlign: 'center',
    marginLeft: -30, // Adjust to center the title with the back button
  },
  loaderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
  },
  actionButtonSuccessText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
    marginLeft: 8,
  },
  actionButtonWarning: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF7EE',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8B4513',
  },
  scrollViewContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 15, // Slightly more rounded corners
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0E5D7', // Subtle border
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
  },
  actionButtonWarningText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F59E0B',
    marginLeft: 8,
  },
  actionButtonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  summary: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  userName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  userPhone: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  detailSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#8B4513', // Brownish color for titles
  },
  addressText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  noteText: {
    fontSize: 15,
    color: '#555',
    fontStyle: 'italic', // Italicize notes
  },
  summarySection: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 15,
    marginTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  statusText: {
    color: '#28A745', // Green for status (you might want to dynamically change this based on status)
    fontWeight: 'bold',
  },
  reviewButton: {
    marginTop: 20,
    backgroundColor: '#A0522D', // Slightly different brown for the button
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  reviewButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyOrdersText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
});

export default OrderHistoryScreen;