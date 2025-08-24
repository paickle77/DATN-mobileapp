import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  assignOrderToShipper,
  fetchAllBills,
  fetchShipperInfo,
  updateShipperStatus
} from '../../services/ShipService';
import { getUserData } from '../utils/storage';

type RootStackParamList = {
  DeliveredOrders: undefined;
  ShipTabNavigator: undefined;
  ShipHome: undefined;
  ShipOrderDetail: { orderId: string };
};

interface OrderStats {
  pending: number;
  confirmed: number;
  ready: number;
  shipping: number;
  delivered: number;
  done: number;
  totalEarnings: number;
}

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

interface RecentOrder {
  _id: string;
  address_snapshot?: {
    name: string;
    phone: string;
    detail: string;
    ward: string;
    district: string;
    city: string;
  };
  created_at: string;
  shipping_method: string;
  status: string;
  total: number
}

interface ShipperInfo {
  _id: string;
  account_id: string;
  full_name: string;
  phone: string;
  image: string;
  license_number: string;
  vehicle_type: string;
  is_online: 'offline' | 'online' | 'busy';
}

const ShipHome: React.FC = () => {
  const [isOnline, setIsOnline] = useState<'online' | 'offline' | 'busy'>('offline');
  const [refreshing, setRefreshing] = useState(false);
  const [shipperInfo, setShipperInfo] = useState<ShipperInfo | null>(null);
  const [todayStats, setTodayStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { showActionSheetWithOptions } = useActionSheet();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  type OnlineStatus = 'online' | 'offline' | 'busy';

  useFocusEffect(
    useCallback(() => {
      loadShipperInfo();
      loadTodayStats();
    }, [])
  );

  const loadShipperInfo = async () => {
    try {
      const shipper = await fetchShipperInfo();
      if (!shipper) throw new Error('Không tìm thấy thông tin shipper');
      setShipperInfo(shipper);
      setIsOnline(shipper.is_online ?? 'offline');
    } catch (error) {
      console.error('❌ Lỗi khi lấy thông tin shipper:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin shipper.');
    }
  };

  const loadTodayStats = async () => {
    try {
      const orders = await fetchAllBills();
      const shipperId = await getUserData('shipperID');

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      const todayOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.updatedAt);
        return orderDate >= startOfToday && orderDate < startOfTomorrow;
      });

      const pendingOrders = todayOrders.filter((o: any) => o.status === 'pending').length;
      const confirmedOrders = todayOrders.filter((o: any) => o.status === 'confirmed').length;
      const readyOrders = todayOrders.filter(
        (o: any) => o.status === 'ready' && o.shipping_method !== 'Nhận tại cửa hàng'
      );
      const deliveredOrders = todayOrders.filter((o: any) => o.status === 'delivered').length;
      const shippingOrders = todayOrders.filter(
        (o: any) => o.status === 'shipping' && o.shipper_id === shipperId
      ).length;
      const doneOrders = todayOrders.filter(
        (o: any) => o.status === 'done' && o.shipper_id === shipperId
      );
      const totalCommissionToday = doneOrders.reduce(
        (sum: number, order: any) => sum + ((order.shipping_fee || 0) * 0.5),
        0
      );

      const todayStatsData: OrderStats = {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        ready: readyOrders.length,
        shipping: shippingOrders,
        delivered: deliveredOrders,
        done: doneOrders.length,
        totalEarnings: totalCommissionToday,
      };

      setTodayStats(todayStatsData);
      setRecentOrders(
        readyOrders.slice(0, 5).map((order: any) => ({
          _id: order._id,
          address_snapshot: order.address_snapshot,
          created_at: order.created_at,
          shipping_method: order.shipping_method,
          status: order.status,
          total: order.total,
        }))
      );
    } catch (error) {
      console.error('❌ Lỗi khi lấy thống kê hôm nay:', error);
      Alert.alert('Lỗi', 'Không thể tải thống kê.');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await loadShipperInfo();
    await loadTodayStats();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, []);

  const handleAcceptOrder = async (billId: string) => {
    if (!shipperInfo?._id) return;
    if (isOnline === 'offline') {
      Alert.alert('Thông báo', 'Bạn cần bật chế độ Online để nhận đơn hàng.');
      return;
    }
    if (isOnline === 'busy') {
      Alert.alert('Thông báo', 'Bạn đang có đơn, không thể nhận đơn hàng này.');
      return;
    }
    try {
      const shipperID = await getUserData('shipperID');
      await assignOrderToShipper(billId, shipperID);
      Alert.alert('Thành công', 'Bạn đã nhận đơn hàng.');
      await setBusyStatus();
      await loadData();
    } catch (error: any) {
      console.error('❌ Lỗi khi nhận đơn:', error);
      Alert.alert('Lỗi', error?.response?.data?.msg || 'Không thể nhận đơn hàng.');
    }
  };

  const toggleOnlineStatus = async () => {
    const newStatus: OnlineStatus = isOnline === 'offline' ? 'online' : 'offline';
    if (isOnline === 'busy') {
      Alert.alert('Thông báo', 'Bạn đang bận, không thể chuyển trạng thái.');
      return;
    }
    try {
      await updateShipperStatus(shipperInfo?._id || '', newStatus);
      setIsOnline(newStatus);
      Alert.alert(
        'Trạng thái thay đổi',
        `Bạn đã ${newStatus === 'online' ? 'bật chế độ nhận đơn' : 'tắt chế độ nhận đơn'}`
      );
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật trạng thái online:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái online.');
    }
  };

  const setBusyStatus = async () => {
    try {
      await updateShipperStatus(shipperInfo?._id || '', 'busy');
      setIsOnline('busy');
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật trạng thái busy:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái online.');
    }
  };
  if (loading || !shipperInfo || !todayStats) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 12 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }
  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Danh sách đơn',
      icon: 'list-outline',
      color: '#4F46E5',
      onPress: () => navigation.navigate('ShipTabNavigator', { screen: 'DeliveredOrders' } as never)
    },
    {
      id: '4',
      title: 'Thống kê',
      icon: 'stats-chart-outline',
      color: '#7C2D12',
      onPress: () => navigation.navigate('Commission' as never)
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';      // Chờ xác nhận
      case 'confirmed': return '#6366F1';    // Đã xác nhận
      case 'ready': return '#3B82F6';        // Sẵn sàng
      case 'shipping': return '#F97316';     // Đang giao
      case 'delivered': return '#10B981';    // Đã giao
      case 'done': return '#DC2626';         // Hoàn thành
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'ready': return 'Sẵn sàng';
      case 'shipping': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'done': return 'Hoàn thành';
      default: return '';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading || !shipperInfo || !todayStats) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 12 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <LinearGradient
        colors={['#5C4033', '#8a754eff']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle-outline" size={58} color="white" style={styles.avatar} />
            <View>
              <Text style={styles.userName}>Xin chào, {shipperInfo.full_name}</Text>
              <Text style={styles.phone}>SĐT: {shipperInfo.phone}</Text>
              <View style={styles.ratingContainer}>
                
                <Text style={styles.deliveries}>{shipperInfo.vehicle_type} - {shipperInfo.license_number}</Text>

              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.onlineToggle,
              {
                backgroundColor:
                  isOnline === "online"
                    ? "#10B981" // xanh lá
                    : isOnline === "busy"
                    ? "#F59E0B" // cam
                    : "#6B7280" // xám
              }
            ]}
            onPress={toggleOnlineStatus}
          >
            <View style={styles.toggleIndicator} />
            <Text style={styles.onlineText}>
              {isOnline === "online"
                ? "Online"
                : isOnline === "busy"
                ? "Busy"
                : "Offline"}
            </Text>
          </TouchableOpacity>

        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Today Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Thống kê hôm nay</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
              <Text style={styles.statNumber}>{todayStats.ready}</Text>
              <Text style={styles.statLabel}>Chờ giao</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
              <Text style={styles.statNumber}>{todayStats.shipping}</Text>
              <Text style={styles.statLabel}>Đang giao</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
              <Text style={styles.statNumber}>{todayStats.done}</Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#DC2626' }]}>
              <Text style={styles.statNumber}>{formatCurrency(todayStats.totalEarnings)}</Text>
              <Text style={styles.statLabel}>Tiền hoa hồng</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="white" />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.ordersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đơn hàng có thể nhận</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ShipTabNavigator', { screen: 'Delivered' } as never)}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {recentOrders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ShipOrderDetail', { orderId: order._id } as never)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.customerName}>#{order._id.slice(-6)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.address}>Tên khách hàng: {order.address_snapshot?.name || 'Ẩn tên'}</Text>
                <Text style={styles.address}>SĐT: {order.address_snapshot?.phone}</Text>
                <View style={styles.addressContainer}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                  <Text style={styles.address}>{order.address_snapshot?.detail +', '+ order.address_snapshot?.ward +', '+ order.address_snapshot?.district +', '+ order.address_snapshot?.city || 'Chưa xác định'}</Text> 
                  {/* Có thể thay bằng địa chỉ thực nếu bạn fetch từ address table */}
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderTime}>
                    {new Date(order.created_at).toLocaleString()}
                  </Text>
                  <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                </View>
              </View>

              {/* ✅ Nút nhận đơn */}
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptOrder(order._id)}
              >
                <Text style={styles.acceptButtonText}>Nhận đơn</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 50 }} /> 
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    fontSize: 50,
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: 'white',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#F59E0B',
    fontWeight: '500',
    marginLeft: 4,
  },
  deliveries: {
    color: '#D1D5DB',
    fontSize: 12,
    marginLeft: 4,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 6,
  },
  onlineText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsContainer: {
    marginTop: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  ordersContainer: {
    marginTop: 32,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#4F46E5',
    fontWeight: '500',
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  orderDetails: {
    gap: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 14,
    color: '#000000ff',
    marginLeft: 8,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  acceptButton: {
  backgroundColor: '#5C4033',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 12,
  alignSelf: 'flex-end',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3, // Bóng cho Android
  marginTop: 12,
},

acceptButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
  letterSpacing: 0.5,
},

});

export default ShipHome;