import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

const { width } = Dimensions.get('window');

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
    facebook_id: null | string;
    google_id: null | string;
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



const UserOrderHistoryScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'processing' | 'shipping' | 'completed'>('processing');

  const tabs = [
    { key: 'processing', title: 'Đang xử lý', icon: 'time-outline' },
    { key: 'shipping', title: 'Đang giao', icon: 'car-outline' },
    { key: 'completed', title: 'Hoàn thành', icon: 'checkmark-done-circle-outline' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'đang xử lý':
      case 'pending':
        return '#FF9500';
      case 'đã xác nhận':
      case 'confirmed':
        return '#007AFF';
      case 'đang giao':
      case 'shipping':
        return '#5856D6';
      case 'đã giao':
      case 'delivered':
        return '#34C759';
      case 'đã hủy':
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'đang xử lý':
      case 'pending':
        return 'time-outline';
      case 'đã xác nhận':
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'đang giao':
      case 'shipping':
        return 'car-outline';
      case 'đã giao':
      case 'delivered':
        return 'checkmark-done-circle-outline';
      case 'đã hủy':
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Đang xử lý';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'shipping':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao thành công';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/GetAllBills`);
      const rawUserData = await getUserData('userData');

      let userData;
      try {
        userData = typeof rawUserData === 'string' ? JSON.parse(rawUserData) : rawUserData;
      } catch (e) {
        console.error("❌ Lỗi parse userData:", e);
        userData = {};
      }

      const allOrders: OrderType[] = response.data.data;

      const filteredOrders = allOrders.filter((order: OrderType) => {
        let orderUserId: string | undefined;
        if (order.user_id && typeof order.user_id === 'object') {
          orderUserId = order.user_id._id ?? undefined;
        } else if (typeof order.user_id === 'string') {
          orderUserId = order.user_id;
        }
        console.log('So sánh:', orderUserId, 'vs', userData?._id);
        return orderUserId === userData?._id;
      });

      console.log('Số đơn hàng:', filteredOrders.length);
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Lỗi khi gọi API đơn hàng:', error);
      Alert.alert('Lỗi', 'Lỗi khi tải đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'processing':
        return orders.filter(order =>
          ['đang xử lý', 'pending', 'đã xác nhận', 'confirmed'].includes(order.status.toLowerCase())
        );
      case 'shipping':
        return orders.filter(order =>
          ['đang giao', 'shipping'].includes(order.status.toLowerCase())
        );
      case 'completed':
        return orders.filter(order =>
          ['đã giao', 'delivered', 'đã hủy', 'cancelled'].includes(order.status.toLowerCase())
        );
      default:
        return [];
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderPress = (orderId: string) => {
    console.log('Chi tiết đơn hàng:', orderId);
    navigation.navigate('OrderDetails', { orderId });
  };

  const handleReorder = (order: OrderType) => {
    Alert.alert(
      'Mua lại',
      'Bạn có muốn mua lại đơn hàng này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Mua lại',
          onPress: () => {
            // Navigate to cart or product page with order items
            console.log('Reorder:', order._id);
          }
        }
      ]
    );
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call API to cancel order
              await axios.put(`${BASE_URL}/cancelOrder/${orderId}`);
              fetchOrders();
              Alert.alert('Thành công', 'Đơn hàng đã được hủy');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
            }
          }
        }
      ]
    );
  };

  const renderOrderCard = ({ item: order }: { item: OrderType }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(order._id)}
      activeOpacity={0.95}
    >
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderIdSection}>
          <Ionicons name="receipt" size={18} color="#5C4033" />
          <Text style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
          <Ionicons
            name={getStatusIcon(order.status)}
            size={14}
            color={getStatusColor(order.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      {/* Order Date & Time */}
      <View style={styles.dateSection}>
        <Ionicons name="calendar-outline" size={14} color="#666" />
        <Text style={styles.dateText}>
          Đặt ngày {new Date(order.created_at).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>

      {/* Delivery Address */}
      <View style={styles.addressSection}>
        <View style={styles.addressHeader}>
          <Ionicons name="location-outline" size={16} color="#5C4033" />
          <Text style={styles.addressLabel}>Giao đến</Text>
        </View>
        <Text style={styles.addressText} numberOfLines={2}>
          {order.address_id?.detail_address}, {order.address_id?.ward}, {order.address_id?.district}, {order.address_id?.city}
        </Text>
      </View>

      {/* Payment & Shipping Info */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="card-outline" size={14} color="#666" />
          <Text style={styles.infoText}>{order.payment_method || 'COD'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="speedometer-outline" size={14} color="#666" />
          <Text style={styles.infoText}>{order.shipping_method || 'Tiêu chuẩn'}</Text>
        </View>
      </View>

      {/* Note */}
      {order.note && (
        <View style={styles.noteSection}>
          <Ionicons name="chatbubble-outline" size={14} color="#666" />
          <Text style={styles.noteText} numberOfLines={2}>"{order.note}"</Text>
        </View>
      )}

      {/* Total Amount */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Tổng thanh toán</Text>
        <Text style={styles.totalAmount}>
          {Number(order.total).toLocaleString('vi-VN')}đ
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => handleOrderPress(order._id)}
        >
          <Ionicons name="eye-outline" size={16} color="#5C4033" />
          <Text style={styles.detailButtonText}>Chi tiết</Text>
        </TouchableOpacity>

        {/* Conditional Action Buttons */}
        {activeTab === 'processing' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelOrder(order._id)}
          >
            <Ionicons name="close-circle-outline" size={16} color="#FF3B30" />
            <Text style={styles.cancelButtonText}>Hủy đơn</Text>
          </TouchableOpacity>
        )}

        {activeTab === 'completed' && order.status.toLowerCase() === 'delivered' && (
          <TouchableOpacity
            style={styles.reorderButton}
            onPress={() => handleReorder(order)}
          >
            <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
            <Text style={styles.reorderButtonText}>Mua lại</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Indicator for shipping orders */}
      {activeTab === 'shipping' && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
          </View>
          <Text style={styles.progressText}>Đang trên đường giao đến bạn</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={activeTab === 'processing' ? 'hourglass-outline' :
          activeTab === 'shipping' ? 'car-outline' :
            'checkmark-done-circle-outline'}
        size={80}
        color="#C7C7CC"
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'processing' ? 'Chưa có đơn hàng đang xử lý' :
          activeTab === 'shipping' ? 'Chưa có đơn hàng đang giao' :
            'Chưa có đơn hàng hoàn thành'}
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === 'processing' ? 'Hãy đặt hàng để theo dõi đơn hàng tại đây' :
          activeTab === 'shipping' ? 'Các đơn hàng đang giao sẽ hiển thị tại đây' :
            'Lịch sử các đơn hàng đã hoàn thành sẽ hiển thị tại đây'}
      </Text>
      <TouchableOpacity style={styles.shopNowButton} onPress={() => navigation.navigate('TabNavigator', { screen: 'Home' })}>
        <Text style={styles.shopNowText}>Mua sắm ngay</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#5C4033" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5C4033" />

      {/* Header */}
      <LinearGradient
        colors={['#5C4033', '#7A5A47']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Đơn hàng của tôi</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabItem,
              activeTab === tab.key && styles.activeTabItem
            ]}
            onPress={() => setActiveTab(tab.key as 'processing' | 'shipping' | 'completed')}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? '#5C4033' : '#999'}
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.title}
            </Text>
            {getFilteredOrders().length > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeText}>{getFilteredOrders().length}</Text>
              </View>
            )}
            {activeTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={getFilteredOrders()}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshing={loading}
        onRefresh={fetchOrders}
      />
    </View>
  );
};

export default UserOrderHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 44,
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
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  screenTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabItem: {
    backgroundColor: '#F8F6F3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginTop: 4,
  },
  activeTabText: {
    color: '#5C4033',
  },
  badgeCount: {
    position: 'absolute',
    top: 8,
    right: '30%',
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#5C4033',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdSection: {
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  addressSection: {
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C4033',
    marginLeft: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingLeft: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#F8F6F3',
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 6,
    flex: 1,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5C4033',
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F6F3',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5C4033',
  },
  detailButtonText: {
    color: '#5C4033',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  reorderButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5C4033',
    paddingVertical: 12,
    borderRadius: 8,
  },
  reorderButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5856D6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: '#5856D6',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#5C4033',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});