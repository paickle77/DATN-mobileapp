import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
interface OrderStats {
  pending: number;
  delivering: number;
  completed: number;
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
  id: string;
  customerName: string;
  address: string;
  total: number;
  status: 'pending' | 'delivering' | 'completed';
  time: string;
}

const ShipHome: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - dữ liệu cứng tạm
  const shipperInfo = {
    name: 'Nguyễn Văn An',
    avatar: '🚴‍♂️',
    rating: 4.8,
    totalDeliveries: 156
  };

  const todayStats: OrderStats = {
    pending: 3,
    delivering: 1,
    completed: 8,
    totalEarnings: 285000
  };

  const recentOrders: RecentOrder[] = [
    {
      id: '1',
      customerName: 'Trần Thị Lan',
      address: '123 Nguyễn Huệ, Q.1',
      total: 125000,
      status: 'delivering',
      time: '14:30'
    },
    {
      id: '2', 
      customerName: 'Lê Minh Đức',
      address: '456 Lê Lợi, Q.3',
      total: 89000,
      status: 'pending',
      time: '14:15'
    },
    {
      id: '3',
      customerName: 'Phạm Thu Hà',
      address: '789 Điện Biên Phủ, Q.Bình Thạnh',
      total: 156000,
      status: 'completed',
      time: '13:45'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Danh sách đơn',
      icon: 'list-outline',
      color: '#4F46E5',
      onPress: () => Alert.alert('Chuyển đến', 'Danh sách đơn hàng')
    },
    {
      id: '2',
      title: 'Bản đồ',
      icon: 'map-outline',
      color: '#059669',
      onPress: () => Alert.alert('Chuyển đến', 'Bản đồ giao hàng')
    },
    {
      id: '3',
      title: 'Thu tiền',
      icon: 'wallet-outline',
      color: '#DC2626',
      onPress: () => Alert.alert('Chuyển đến', 'Thu tiền COD')
    },
    {
      id: '4',
      title: 'Thống kê',
      icon: 'stats-chart-outline',
      color: '#7C2D12',
      onPress: () => Alert.alert('Chuyển đến', 'Thống kê cá nhân')
    }
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Đã cập nhật', 'Dữ liệu mới nhất');
    }, 2000);
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    Alert.alert(
      'Trạng thái thay đổi',
      `Bạn đã ${!isOnline ? 'bật' : 'tắt'} chế độ nhận đơn`
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'delivering': return '#3B82F6';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ giao';
      case 'delivering': return 'Đang giao';
      case 'completed': return 'Hoàn thành';
      default: return '';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.avatar}>{shipperInfo.avatar}</Text>
            <View>
              <Text style={styles.userName}>Xin chào, {shipperInfo.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.rating}>{shipperInfo.rating}</Text>
                <Text style={styles.deliveries}>• {shipperInfo.totalDeliveries} đơn</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.onlineToggle, { backgroundColor: isOnline ? '#10B981' : '#6B7280' }]}
            onPress={toggleOnlineStatus}
          >
            <View style={styles.toggleIndicator} />
            <Text style={styles.onlineText}>
              {isOnline ? 'Online' : 'Offline'}
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
              <Text style={styles.statNumber}>{todayStats.pending}</Text>
              <Text style={styles.statLabel}>Chờ giao</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
              <Text style={styles.statNumber}>{todayStats.delivering}</Text>
              <Text style={styles.statLabel}>Đang giao</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
              <Text style={styles.statNumber}>{todayStats.completed}</Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#DC2626' }]}>
              <Text style={styles.statNumber}>{formatCurrency(todayStats.totalEarnings)}</Text>
              <Text style={styles.statLabel}>Doanh thu</Text>
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
            <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
            <TouchableOpacity onPress={() => Alert.alert('Chuyển đến', 'Tất cả đơn hàng')}>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {recentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              activeOpacity={0.8}
              onPress={() => Alert.alert('Chi tiết đơn hàng', `Đơn hàng #${order.id}`)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>
              
              <View style={styles.orderDetails}>
                <View style={styles.addressContainer}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                  <Text style={styles.address}>{order.address}</Text>
                </View>
                
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTime}>{order.time}</Text>
                  <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    fontSize: 32,
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
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
    color: '#6B7280',
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
});

export default ShipHome;