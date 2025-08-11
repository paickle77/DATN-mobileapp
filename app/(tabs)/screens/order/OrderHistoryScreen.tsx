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

// const { width } = Dimensions.get('window');

type OrderType = {
  __v: number;
  _id: string;
  Account_id: string | { _id: string };
  address_id: string | null;
  address_snapshot?: {
    name: string;
    phone: string;
    detail: string;
    ward: string;
    district: string;
    city: string;
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
  shipping_fee?: number;
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

  // Tabs được tối ưu cho shop bánh
  const tabs = [
    { key: 'all', title: 'Tất cả', icon: 'apps', color: '#5C4033' },
    { key: 'pending', title: 'Chờ xác nhận', icon: 'time', color: '#FF9500' },
    { key: 'shipping', title: 'Đang làm', icon: 'cafe', color: '#007AFF' },
    { key: 'done', title: 'Hoàn thành', icon: 'checkmark-done-circle', color: '#34C759' },
    { key: 'cancelled', title: 'Đã hủy', icon: 'close-circle', color: '#FF3B30' },
  ];

  const getStatusConfig = (status: string) => {
    const normalizedStatus = status ? status.toLowerCase() : '';

    switch (normalizedStatus) {
      case 'pending':
        return {
          text: 'Chờ xác nhận',
          color: '#FF9500',
          bgColor: '#FFF5E6',
          icon: 'hourglass-outline',
          description: 'Đơn bánh đang chờ xác nhận'
        };
      case 'confirmed':
        return {
          text: 'Đang chuẩn bị',
          color: '#007AFF',
          bgColor: '#E6F3FF',
          icon: 'restaurant-outline',
          description: 'Thầy bánh đang chuẩn bị nguyên liệu'
        };
      case 'ready':
        return {
          text: 'Sẵn sàng giao',
          color: '#5856D6',
          bgColor: '#F0F0FF',
          icon: 'checkmark-circle-outline',
          description: 'Bánh đã hoàn thành, chờ shipper'
        };
      case 'shipping':
        return {
          text: 'Đang giao',
          color: '#34C759',
          bgColor: '#E6FFE6',
          icon: 'bicycle-outline',
          description: 'Shipper đang giao bánh đến bạn'
        };
      case 'done':
        return {
          text: 'Hoàn thành',
          color: '#28A745',
          bgColor: '#E6F7E6',
          icon: 'heart-outline',
          description: 'Giao hàng thành công, cảm ơn bạn!'
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
          description: 'Khách không nhận, đã hoàn trả'
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

    // Nhóm các trạng thái liên quan cho shop bánh
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
      'Hủy đơn bánh?',
      'Bạn có chắc chắn muốn hủy đơn bánh này không? Chúng tôi sẽ rất tiếc!',
      [
        { text: 'Không hủy', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.put(`${BASE_URL}/bills/${orderId}`, { status: 'cancelled' });
              fetchOrders();
              Alert.alert('Đã hủy', 'Đơn bánh đã được hủy. Hẹn gặp lại bạn!');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
            }
          }
        }
      ]
    );
  };

  // ✅ FIX: Kiểm tra null/undefined và số an toàn cho formatPrice
  const formatPrice = (price?: number | null) => {
    // Kiểm tra tất cả trường hợp không hợp lệ
    if (price === null || price === undefined || isNaN(Number(price))) {
      return '0đ';
    }

    // Chuyển về số và format
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
      return '0đ';
    }

    return numPrice.toLocaleString('vi-VN') + 'đ';
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

  // ✅ FIX: Chuẩn hóa hiển thị phương thức thanh toán
  const getDisplayPaymentMethod = (paymentMethod: string) => {
    if (!paymentMethod) return 'N/A';

    const method = String(paymentMethod).toLowerCase();

    if (method.includes('cod') || method.includes('tiền mặt') || method.includes('khi nhận')) {
      return 'Tiền mặt';
    }
    if (method.includes('momo')) {
      return 'MoMo';
    }
    if (method.includes('vnpay')) {
      return 'VNPAY';
    }
    if (method.includes('zalopay')) {
      return 'ZaloPay';
    }
    if (method.includes('chuyển khoản') || method.includes('banking')) {
      return 'Chuyển khoản';
    }

    return paymentMethod;
  };

  const getPaymentIcon = (paymentMethod: string) => {
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
            <Text style={styles.orderId}>#{order._id?.slice(-6)?.toUpperCase() || 'N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>

        {/* Thông tin cơ bản */}
        <View style={styles.orderInfo}>
          <Text style={styles.statusDescription}>{statusConfig.description}</Text>
          <Text style={styles.dateText}>Đặt lúc: {formatDate(order.created_at)}</Text>
        </View>

        {/* Địa chỉ giao hàng sử dụng address_snapshot */}
        <View style={styles.addressSection}>
          <Ionicons name="location-outline" size={14} color="#D97706" />
          {order.address_snapshot ? (
            <Text style={styles.addressText} numberOfLines={1}>
              {order.address_snapshot.name} | {order.address_snapshot.district}, {order.address_snapshot.city}
            </Text>
          ) : (
            <Text style={styles.addressText} numberOfLines={1}>
              Địa chỉ không khả dụng
            </Text>
          )}
        </View>

        {/* Chi tiết thanh toán */}
        <View style={styles.paymentDetails}>
          <View style={styles.priceBreakdown}>
            {order.original_total && order.original_total > 0 && (
              <Text style={styles.priceItem}>
                Tiền bánh: {formatPrice(order.original_total)}
              </Text>
            )}
            {order.shipping_fee && order.shipping_fee > 0 && (
              <Text style={styles.priceItem}>
                Phí giao: {formatPrice(order.shipping_fee)}
              </Text>
            )}
            {order.discount_amount && order.discount_amount > 0 && (
              <Text style={[styles.priceItem, { color: '#34C759' }]}>
                Giảm giá: -{formatPrice(order.discount_amount)}
              </Text>
            )}
          </View>

          <View style={styles.totalSection}>
            <View>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <View style={styles.paymentMethodContainer}>
                <Ionicons
                  name={getPaymentIcon(order.payment_method) as any}
                  size={12}
                  color="#8B5A2B"
                />
                <Text style={styles.paymentMethod}>
                  {getDisplayPaymentMethod(order.payment_method)}
                </Text>
              </View>
            </View>
            <Text style={styles.totalAmount}>{formatPrice(order.total)}</Text>
          </View>
        </View>

        {/* Voucher info */}
        {order.voucher_code && (
          <View style={styles.voucherInfo}>
            <Ionicons name="ticket-outline" size={12} color="#15803D" />
            <Text style={styles.voucherText}>Đã dùng mã: {order.voucher_code}</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => handleOrderPress(order._id)}
          >
            <Ionicons name="eye-outline" size={14} color="#5C4033" />
            <Text style={styles.detailButtonText}>Chi tiết</Text>
          </TouchableOpacity>

          {canReview(order.status) && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => handleOrderPress(order._id)}
            >
              <Ionicons name="star-outline" size={14} color="#FFD700" />
              <Text style={styles.reviewButtonText}>Đánh giá</Text>
            </TouchableOpacity>
          )}

          {canCancelOrder(order.status) && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelOrder(order._id)}
            >
              <Ionicons name="close-outline" size={14} color="#DC2626" />
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cafe-outline" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Chưa có đơn bánh nào</Text>
      <Text style={styles.emptyText}>
        {activeTab === 'all'
          ? 'Hãy đặt bánh ngon ngay nào!'
          : `Không có đơn bánh ${tabs.find(t => t.key === activeTab)?.title.toLowerCase()}`
        }
      </Text>
      {activeTab === 'all' && (
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('TabNavigator', { screen: 'Home' })}
        >
          <Ionicons name="storefront-outline" size={16} color="#FFFFFF" />
          <Text style={styles.shopButtonText}>Đặt bánh ngay</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#5C4033" />
        <Text style={styles.loadingText}>Đang tải đơn bánh...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5C4033" />

      {/* Header */}
      <LinearGradient colors={['#5C4033', '#8B4513']} style={styles.header}>
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Đơn bánh của tôi</Text>
          <Text style={styles.headerSubtitle}>Theo dõi đơn hàng bánh ngon</Text>
        </View>
        <TouchableOpacity onPress={fetchOrders} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {tabs.map((tab) => {
            const count = getOrderCount(tab.key as TabType);
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabItem,
                  isActive && styles.activeTab,
                  { borderBottomColor: isActive ? tab.color : 'transparent' }
                ]}
                onPress={() => setActiveTab(tab.key as TabType)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={isActive ? tab.color : '#999'}
                />
                <Text style={[
                  styles.tabText,
                  isActive && { ...styles.activeTabText, color: tab.color }
                ]}>
                  {tab.title}
                </Text>
                {count > 0 && (
                  <View style={[styles.badge, { backgroundColor: tab.color }]}>
                    <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
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
    backgroundColor: '#FFF8F3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
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
    borderBottomColor: '#F0E6D6',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  tabScrollContent: {
    paddingHorizontal: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 4,
    borderRadius: 12,
    marginVertical: 8,
    position: 'relative',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    minWidth: 100,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(92, 64, 51, 0.05)',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 6,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#5C4033',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0E6D6',
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
    fontSize: 15,
    fontWeight: '700',
    color: '#5C4033',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(92, 64, 51, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderInfo: {
    marginBottom: 12,
    backgroundColor: 'rgba(92, 64, 51, 0.02)',
    padding: 12,
    borderRadius: 12,
  },
  statusDescription: {
    fontSize: 13,
    color: '#8B5A2B',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#B8860B',
    fontWeight: '500',
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  addressText: {
    fontSize: 12,
    color: '#B45309',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  paymentDetails: {
    marginBottom: 12,
  },
  priceBreakdown: {
    marginBottom: 12,
  },
  priceItem: {
    fontSize: 12,
    color: '#8B5A2B',
    marginBottom: 4,
    backgroundColor: 'rgba(92, 64, 51, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0E6D6',
  },
  totalLabel: {
    fontSize: 13,
    color: '#5C4033',
    fontWeight: '600',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  paymentMethod: {
    fontSize: 11,
    color: '#8B5A2B',
    marginLeft: 4,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97706',
  },
  voucherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  voucherText: {
    fontSize: 11,
    color: '#15803D',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionSection: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F3',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E6D6',
  },
  detailButtonText: {
    fontSize: 13,
    color: '#5C4033',
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelButtonText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5C4033',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8B5A2B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5C4033',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#5C4033',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  shopButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F3',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B5A2B',
    fontWeight: '500',
  },
});

export default OrderHistoryScreen;