import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from 'expo-router';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  assignOrderToShipper,
  fetchAllBills,
  fetchShipperInfo,
  OrderDetail,
  Shipper,
  updateShipperStatus,
} from '../../services/ShipService';
import { getUserData } from '../utils/storage';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  DeliveredOrders: undefined;
  ShipTabNavigator: undefined;
  ShipHome: undefined;
  OderDetails: { orderId: string };
  ShipOrderDetail: { orderId: string };
};

interface FilterOption {
  label: string;
  value: string;
  count: number;
}

const DeliveredOrders = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [isOnline, setIsOnline] = useState<"online" | "offline" | "busy">("offline");
  const [filteredOrders, setFilteredOrders] = useState<OrderDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  type OnlineStatus = "online" | "offline" | "busy";

  useFocusEffect(
    useCallback(() => {
      loadOrders();
      loadShipperStatus();
    }, [])
  );

  useEffect(() => {
    loadOrders();
    loadShipperStatus();
    onRefresh();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, selectedFilter, orders]);

  const loadOrders = async () => {
    try {
      const data = await fetchAllBills();
      const filtered = (data || []).filter(
        (order: OrderDetail) =>
          order.Account_id && order.address_snapshot && order.shipping_method !== 'Nhận tại cửa hàng'
      );
      setOrders(filtered);
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách đơn hàng.');
    }
  };

  const loadShipperStatus = async () => {
    try {
      const shipper: Shipper | null = await fetchShipperInfo();
      setIsOnline(shipper?.is_online || 'offline');
    } catch (error) {
      console.error('Lỗi khi lấy thông tin shipper:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin shipper.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    await loadShipperStatus();
    setRefreshing(false);
  };

  const filterOrders = async () => {
    const shipperID = await getUserData('shipperID');

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const filtered = orders.filter(order => {
      if (order.shipping_method === 'Nhận tại cửa hàng') return false;

      const matchesSearch =
        order.address_snapshot?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.address_snapshot?.detail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        '';

      // chỉ đơn ready trong ngày hôm nay
      const orderDate = new Date(order.updatedAt);
      const isToday =
        orderDate >= startOfToday && orderDate < startOfTomorrow;

      const isReady = order.status === 'ready' && isToday;

      const isOwnedByShipper =
        ['shipping', 'done', 'failed'].includes(order.status) &&
        order.shipper_id === shipperID;

     const matchesFilter =
      selectedFilter === 'all'
        ? isReady || isOwnedByShipper
        : selectedFilter === 'ready'
          ? isReady
          : order.status === selectedFilter && order.shipper_id === shipperID;


      return matchesSearch && matchesFilter;
    });

    setFilteredOrders(filtered);
  };

  const updateFilterOptions = async () => {
    const shipperID = await getUserData('shipperID');

    const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      const todayOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.updatedAt);
        return orderDate >= startOfToday && orderDate < startOfTomorrow;
      });

    const countReady = todayOrders.filter(o => o.status === 'ready').length;
    const countShipping = orders.filter(o => o.status === 'shipping' && o.shipper_id === shipperID).length;
    const countDone = orders.filter(o => o.status === 'done' && o.shipper_id === shipperID).length;
    const countCancelled = orders.filter(o => o.status === 'failed' && o.shipper_id === shipperID).length;
    const countAll = countReady + countShipping + countDone + countCancelled;

    setFilterOptions([
      { label: 'Tất cả', value: 'all', count: countAll },
      { label: 'Có thể nhận', value: 'ready', count: countReady },
      { label: 'Đang giao', value: 'shipping', count: countShipping },
      { label: 'Đã giao', value: 'done', count: countDone },
      { label: 'Giao hàng thất bại', value: 'failed', count: countCancelled },
    ]);
  };

  useEffect(() => {
    updateFilterOptions();
  }, [orders]);

  const setOnlineStatus = async (status: OnlineStatus) => {
    try {
      const id = await getUserData('shipperID');
      await updateShipperStatus(id, status);
      setIsOnline(status);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật trạng thái online:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái online.");
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
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
      const res = await assignOrderToShipper(orderId, shipperID);
      if (res.success) {
        Alert.alert('Thành công', 'Đã nhận đơn hàng thành công!');
        setOnlineStatus('busy');
        loadOrders();
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể nhận đơn hàng');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi nhận đơn hàng');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ready':
        return { 
          label: 'Có thể nhận', 
          color: '#FF6B35', 
          bgColor: '#FFF0ED',
          icon: '📦'
        };
      case 'shipping':
        return { 
          label: 'Đang giao', 
          color: '#2196F3', 
          bgColor: '#E3F2FD',
          icon: '🚚'
        };
      case 'done':
        return { 
          label: 'Đã giao', 
          color: '#4CAF50', 
          bgColor: '#E8F5E8',
          icon: '✅'
        };
      case 'failed':
        return { 
          label: 'Giao thất bại', 
          color: '#F44336', 
          bgColor: '#FFEBEE',
          icon: '❌'
        };
      default:
        return { 
          label: status, 
          color: '#9E9E9E', 
          bgColor: '#F5F5F5',
          icon: '📄'
        };
    }
  };
  
  const renderOrderCard = ({ item }: { item: OrderDetail }) => {
    const statusConfig = getStatusConfig(item.status);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const orderDate = new Date(item.updatedAt);
      const isToday =
        orderDate >= startOfToday && orderDate < startOfTomorrow;
    const isReadyOrder = item.status === 'ready' && item.shipping_method !== 'Nhận tại cửa hàng' && isToday;
    const isShippingOrder = item.status === 'shipping';
    
    return (
      <View style={styles.card}>
        {/* Header với mã đơn và trạng thái */}
        <View style={styles.cardHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>Đơn hàng</Text>
            <Text style={styles.orderId}>#{item._id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Thông tin khách hàng */}
        <View style={styles.customerSection}>
          <View style={styles.customerIcon}>
            <Text style={styles.customerIconText}>👤</Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{item.address_snapshot?.name || ''}</Text>
            <Text style={styles.customerPhone}>{item.address_snapshot?.phone}</Text>
          </View>
        </View>

        {/* Địa chỉ giao hàng */}
        <View style={styles.addressSection}>
          <View style={styles.addressIcon}>
            <Text style={styles.addressIconText}>📍</Text>
          </View>
          <View style={styles.addressInfo}>
            <Text style={styles.addressLabel}>Địa chỉ giao hàng</Text>
            <Text style={styles.addressText}>
              {item.address_snapshot?.detail}
            </Text>
            <Text style={styles.addressSubText}>
              {item.address_snapshot?.ward}, {item.address_snapshot?.district}, {item.address_snapshot?.city}
            </Text>
          </View>
        </View>

        {/* Footer với thời gian và tổng tiền */}
        <View style={styles.cardFooter}>
          <View style={styles.timeSection}>
            <Text style={styles.timeIcon}>🕐</Text>
            <Text style={styles.timeText}>
              {moment(item.createdAt).format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Tổng tiền</Text>
            <Text style={styles.priceText}>
              {item.total?.toLocaleString()}₫
            </Text>
          </View>
          

        </View>

<TouchableOpacity 
  style={styles.acceptButton}
  onPress={() => navigation.navigate('ShipOrderDetail', { orderId: item._id } as never)}
  activeOpacity={0.8}
>
  <Text style={styles.acceptButtonIcon}>🔍</Text>
  <Text style={styles.acceptButtonText}>Xem chi tiết</Text>
</TouchableOpacity>
        {/* Action Buttons */}
        {(isReadyOrder || isShippingOrder) && (
          <>
            <View style={styles.divider} />
            <View style={styles.actionSection}>
              {isReadyOrder && (
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => handleAcceptOrder(item._id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.acceptButtonIcon}>🚚</Text>
                  <Text style={styles.acceptButtonText}>Nhận đơn hàng</Text>
                </TouchableOpacity>
              )}
              
            </View>
          </>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
      <Text style={styles.emptySubtitle}>
        {selectedFilter === 'ready' 
          ? 'Hiện tại chưa có đơn hàng nào có thể nhận'
          : 'Không tìm thấy đơn hàng nào phù hợp'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#5C4033" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
        <Text style={styles.headerSubtitle}>
          {filteredOrders.length} đơn hàng
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên, mã đơn, địa chỉ..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.value && styles.selectedFilterButton
              ]}
              onPress={() => setSelectedFilter(item.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === item.value && styles.selectedFilterText
              ]}>
                {item.label}
              </Text>
              <View style={[
                styles.filterCount,
                selectedFilter === item.value && styles.selectedFilterCount
              ]}>
                <Text style={[
                  styles.filterCountText,
                  selectedFilter === item.value && styles.selectedFilterCountText
                ]}>
                  {item.count}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderCard}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#5C4033']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default DeliveredOrders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#5C4033',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearIcon: {
    fontSize: 14,
    color: '#999',
    padding: 4,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedFilterButton: {
    backgroundColor: '#5C4033',
    borderColor: '#5C4033',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginRight: 6,
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  filterCount: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  selectedFilterCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  selectedFilterCountText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  orderIdContainer: {
    flex: 1,
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  customerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5C4033',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customerIconText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
  },
  addressSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addressIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  addressIconText: {
    fontSize: 16,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
    lineHeight: 20,
  },
  addressSubText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#666',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C4033',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  actionSection: {
    padding: 16,
  },
  acceptButton: {
    backgroundColor: '#5C4033',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  acceptButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flex: 1,
    marginLeft: 8,
  },
  completeButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  shippingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#5C5C5C',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  cancelButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});