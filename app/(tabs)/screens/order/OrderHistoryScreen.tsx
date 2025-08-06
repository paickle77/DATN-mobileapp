import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

const { width } = Dimensions.get('window');

type OrderType = {
  __v: number;
  _id: string;
  Account_id: string | { _id: string };
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
  status: 'pending' | 'confirmed' | 'ready' | 'shipping' | 'done' | 'cancelled' | 'failed';
  total: number;
  original_total?: number;
  discount_amount?: number;
  voucher_code?: string;
  payment_confirmed_at?: string;
  delivered_at?: string;
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

type TabType = 'all' | 'pending' | 'confirmed' | 'ready' | 'shipping' | 'done' | 'cancelled' | 'failed';

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Tabs được tối ưu cho mobile - chỉ giữ những tab quan trọng
  const tabs = [
    { key: 'all', title: 'Tất cả', icon: 'apps' },
    { key: 'pending', title: 'Chờ xác nhận', icon: 'time' },
    { key: 'shipping', title: 'Đang giao', icon: 'car' },
    { key: 'done', title: 'Hoàn thành', icon: 'checkmark-done-circle' },
    { key: 'cancelled', title: 'Đã hủy', icon: 'close-circle' },
  ];

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          text: 'Chờ xác nhận',
          color: '#FF9500',
          bgColor: '#FFF5E6',
          icon: 'time',
          description: 'Đơn hàng đang chờ xác nhận'
        };
      case 'confirmed':
        return {
          text: 'Đang chuẩn bị',
          color: '#007AFF',
          bgColor: '#E6F3FF',
          icon: 'cube',
          description: 'Đang đóng gói và chuẩn bị hàng'
        };
      case 'ready':
        return {
          text: 'Chờ shipper',
          color: '#5856D6',
          bgColor: '#F0F0FF',
          icon: 'hand-left',
          description: 'Chờ shipper nhận đơn hàng'
        };
      case 'shipping':
        return {
          text: 'Đang giao',
          color: '#34C759',
          bgColor: '#E6FFE6',
          icon: 'car',
          description: 'Shipper đang giao hàng'
        };
      case 'done':
        return {
          text: 'Hoàn thành',
          color: '#28A745',
          bgColor: '#E6F7E6',
          icon: 'checkmark-done-circle',
          description: 'Giao hàng thành công'
        };
      case 'cancelled':
        return {
          text: 'Đã hủy',
          color: '#FF3B30',
          bgColor: '#FFE6E6',
          icon: 'close-circle',
          description: 'Đơn hàng đã bị hủy'
        };
      case 'failed':
        return {
          text: 'Hoàn trả',
          color: '#DC3545',
          bgColor: '#FFE6E6',
          icon: 'return-up-back',
          description: 'Khách không nhận, đã hoàn trả'
        };
      default:
        return {
          text: status,
          color: '#8E8E93',
          bgColor: '#F5F5F5',
          icon: 'help-circle',
          description: ''
        };
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const accountId = await getUserData('accountId');
      console.log('🔄 Đang tải đơn hàng cho accountId:', accountId);

      const response = await axios.get(`${BASE_URL}/bills`);
      const allOrders: OrderType[] = response.data.data;

      const filteredOrders = allOrders.filter((order: OrderType) => {
        let orderAccountId: string | undefined;
        if (order.Account_id && typeof order.Account_id === 'object') {
          orderAccountId = order.Account_id._id ?? undefined;
        } else if (typeof order.Account_id === 'string') {
          orderAccountId = order.Account_id;
        }
        return orderAccountId === accountId;
      });

      filteredOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Lỗi khi gọi API đơn hàng:', error);
      Alert.alert('Lỗi', 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;

    // Nhóm các trạng thái liên quan
    if (activeTab === 'shipping') {
      return orders.filter(order => ['confirmed', 'ready', 'shipping'].includes(order.status.toLowerCase()));
    }
    if (activeTab === 'cancelled') {
      return orders.filter(order => ['cancelled', 'failed'].includes(order.status.toLowerCase()));
    }

    return orders.filter(order => order.status.toLowerCase() === activeTab);
  };

  const getOrderCount = (status: TabType) => {
    if (status === 'all') return orders.length;
    if (status === 'shipping') {
      return orders.filter(order => ['confirmed', 'ready', 'shipping'].includes(order.status.toLowerCase())).length;
    }
    if (status === 'cancelled') {
      return orders.filter(order => ['cancelled', 'failed'].includes(order.status.toLowerCase())).length;
    }
    return orders.filter(order => order.status.toLowerCase() === status).length;
  };

  const canCancelOrder = (status: string) => {
    return ['pending', 'confirmed'].includes(status.toLowerCase());
  };

  const canReview = (status: string) => {
    return status.toLowerCase() === 'done';
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetails', { orderId });
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.put(`${BASE_URL}/bills/${orderId}`, { status: 'cancelled' });
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

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOrderCard = ({ item: order }: { item: OrderType }) => {
    const statusConfig = getStatusConfig(order.status);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(order._id)}
        activeOpacity={0.98}
      >
        {/* Header với ID và trạng thái */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdSection}>
            <Ionicons name="receipt" size={16} color="#5C4033" />
            <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>

        {/* Thông tin cơ bản */}
        <View style={styles.orderInfo}>
          <Text style={styles.statusDescription}>{statusConfig.description}</Text>
          <Text style={styles.dateText}>{formatDate(order.created_at)}</Text>
        </View>

        {/* Địa chỉ giao hàng (rút gọn) */}
        <View style={styles.addressSection}>
          <Ionicons name="location" size={14} color="#666" />
          <Text style={styles.addressText} numberOfLines={1}>
            {order.address_id?.name} | {order.address_id?.district}, {order.address_id?.city}
          </Text>
        </View>

        {/* Tổng tiền */}
        <View style={styles.totalSection}>
          <View>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.paymentMethod}>{order.payment_method === 'COD' ? 'COD' : 'Chuyển khoản'}</Text>
          </View>
          <Text style={styles.totalAmount}>{formatPrice(order.total)}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => handleOrderPress(order._id)}
          >
            <Text style={styles.detailButtonText}>Chi tiết</Text>
          </TouchableOpacity>

          {canReview(order.status) && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => handleOrderPress(order._id)}
            >
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.reviewButtonText}>Đánh giá</Text>
            </TouchableOpacity>
          )}

          {canCancelOrder(order.status) && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelOrder(order._id)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bag-outline" size={64} color="#CCC" />
      <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
      <Text style={styles.emptyText}>
        {activeTab === 'all' ? 'Hãy bắt đầu mua sắm ngay!' : `Không có đơn hàng ${tabs.find(t => t.key === activeTab)?.title.toLowerCase()}`}
      </Text>
      {activeTab === 'all' && (
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('TabNavigator', { screen: 'Home' })}
        >
          <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#5C4033" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5C4033" />

      {/* Header */}
      <LinearGradient colors={['#5C4033', '#7A5A47']} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'TabNavigator', params: { screen: 'Profile' } }],
            })
          )}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.refreshButton}>
          <Ionicons name="refresh" size={22} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => {
            const count = getOrderCount(tab.key as TabType);
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabItem, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tab.key as TabType)}
              >
                <Ionicons
                  name={tab.icon}
                  size={16}
                  color={isActive ? '#5C4033' : '#999'}
                />
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {tab.title}
                </Text>
                {count > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    marginVertical: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#F8F6F3',
  },
  tabText: {
    fontSize: 13,
    color: '#999',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#5C4033',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  listContainer: {
    padding: 12,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderIdSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5C4033',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderInfo: {
    marginBottom: 12,
  },
  statusDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  paymentMethod: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5C4033',
  },
  actionSection: {
    flexDirection: 'row',
    gap: 8,
  },
  detailButton: {
    flex: 1,
    backgroundColor: '#F8F6F3',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0D5C7',
  },
  detailButtonText: {
    fontSize: 13,
    color: '#5C4033',
    fontWeight: '600',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  reviewButtonText: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '600',
    marginLeft: 4,
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#5C4033',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  shopButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});
export default OrderHistoryScreen;