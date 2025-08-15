import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
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
// Import icons (assuming you have vector icons installed)
// import Icon from 'react-native-vector-icons/MaterialIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from 'expo-router';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  DeliveredOrders: undefined;
  ShipTabNavigator: undefined;
  ShipHome: undefined;
  OderDetails: { orderId: string };
  ShipOrderDetail: { orderId: string };
};

interface Order {
  _id: string;
  status: string;
  createdAt: string;
  total: number;
  Account_id: string;
  address_id: string | null;
  address_snapshot?: {
    name: string;
    phone: string;
    detail: string;
    ward: string;
    district: string;
    city: string;
  };
  shipper_id?: string;
  shipping_method?: string;
}

interface Shipper{
  _id: string;
  account_id: string;
  is_online: 'offline' | 'online' | 'busy';
}

interface FilterOption {
  label: string;
  value: string;
  count: number;
}

const DeliveredOrders = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState<"online" | "offline" | "busy">("offline");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  type OnlineStatus = "online" | "offline" | "busy";

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      fetchUserData();
    }, [])
  );

  useEffect(() => {
    fetchOrders();
    fetchUserData();
    onRefresh();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, selectedFilter, orders]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/GetAllBills`);
      const data = (response.data.data || []).filter((order: Order) => order.Account_id && order.address_snapshot);
      const filtered = data.filter((o: Order) => o.shipping_method !== 'Nhận tại cửa hàng');
      setOrders(filtered);
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách đơn hàng.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    await fetchUserData();
    setRefreshing(false);
  };

  const fetchUserData = async () => {
    try {
      const userId = await getUserData('userData');
      const response = await axios.get(`${BASE_URL}/shippers`);
      const userData = response.data.data;
      const currentUser = userData.find((u: Shipper) => u.account_id === userId);
      console.log('Current User:', currentUser);
      setIsOnline(currentUser?.is_online || false);

    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng.');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const filterOrders = async () => {
    const shipperID = await getUserData('shipperID');

    const filtered = orders.filter(order => {
      if (order.shipping_method === 'Nhận tại cửa hàng') {
        return false;
      }
      const matchesSearch =
        order.address_snapshot?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.address_snapshot?.detail?.toLowerCase().includes(searchQuery.toLowerCase()) || '';

      const isReady = order.status === 'ready';
      const isOwnedByShipper =
        ['shipping', 'done', 'failed'].includes(order.status) &&
        (order as any).shipper_id === shipperID;

      const matchesFilter =
        selectedFilter === 'all'
          ? isReady || isOwnedByShipper
          : order.status === selectedFilter &&
            (order.status === 'ready' || (order as any).shipper_id === shipperID);

      return matchesSearch && matchesFilter;
    });

    setFilteredOrders(filtered);
  };

  const updateFilterOptions = async () => {
    const shipperID = await getUserData('shipperID');

    const countReady = orders.filter(o => o.status === 'ready').length;
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

  const setOnlineStatus = async (status:OnlineStatus) => {
    let newStatus: OnlineStatus = status ;

    const id = await getUserData('shipperID');
    try {
      await axios.post(`${BASE_URL}/shippers/updateStatus`, {
        _id: id,
        is_online: newStatus
      });
      setIsOnline(newStatus);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật trạng thái online:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái online.");
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if ((isOnline as OnlineStatus) === 'offline') {
            Alert.alert('Thông báo', 'Bạn cần bật chế độ Online để nhận đơn hàng.');
            return;
      }

      if ((isOnline as OnlineStatus) === 'busy') {
            Alert.alert('Thông báo', 'Bạn đang có đơn, không thể nhận đơn hàng này.');
            return;
          }
    try {
      const shipperID = await getUserData('shipperID');
      
      Alert.alert(
        'Xác nhận nhận đơn',
        'Bạn có chắc chắn muốn nhận đơn hàng này?',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Nhận đơn',
            onPress: async () => {
              try {
                // Call API to accept order
                const res = await axios.put(`${BASE_URL}/bills/${orderId}/assign-shipper`, {
                                shipper_id: shipperID,
                              });
                
                if (res.data.success) {
                  Alert.alert('Thành công', 'Đã nhận đơn hàng thành công!');
                  setOnlineStatus('busy'); // Set status to busy
                  fetchOrders(); // Refresh orders list
                } else {
                  Alert.alert('Lỗi', res.data.message || 'Không thể nhận đơn hàng');
                }
              } catch (error) {
                console.error('Error accepting order:', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi nhận đơn hàng');
              }
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error getting shipper ID:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin shipper');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    if (isOnline !== 'online') {
            Alert.alert('Thông báo', 'Bạn cần bật chế độ Online để nhận đơn hàng.');
            return;
      }
    try {
      const shipperID = await getUserData('shipperID');
      
      Alert.alert(
        'Hoàn thành đơn hàng',
        'Xác nhận bạn đã giao hàng thành công cho khách hàng?',
        [
          {
            text: 'Chưa giao',
            style: 'cancel',
          },
          {
            text: 'Đã giao xong',
            style: 'default',
            onPress: async () => {
              try {
                // Call API to complete order
                const response = await axios.post(`${BASE_URL}/bills/CompleteOrder`, {
                  orderId: orderId,
                  shipperId: shipperID
                });
                
                if (response.data.success) {
                  Alert.alert('🎉 Thành công', 'Đơn hàng đã được hoàn thành!');
                  fetchOrders(); // Refresh orders list
                } else {
                  Alert.alert('Lỗi', response.data.message || 'Không thể hoàn thành đơn hàng');
                }
              } catch (error) {
                console.error('Error completing order:', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi hoàn thành đơn hàng');
              }
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error getting shipper ID:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin shipper');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (isOnline !== 'online') {
            Alert.alert('Thông báo', 'Bạn cần bật chế độ Online để nhận đơn hàng.');
            return;
      }
    try {
      const shipperID = await getUserData('shipperID');
      
      Alert.alert(
        'Hủy đơn hàng',
        'Bạn có chắc chắn muốn hủy đơn hàng này?\nLý do hủy có thể là: khách không nhận, địa chỉ sai, không liên lạc được...',
        [
          {
            text: 'Không hủy',
            style: 'cancel',
          },
          {
            text: 'Xác nhận hủy',
            style: 'destructive',
            onPress: async () => {
              try {
                // Call API to cancel order
                const response = await axios.post(`${BASE_URL}/bills/CancelOrder`, {
                  orderId: orderId,
                  shipperId: shipperID
                });
                
                if (response.data.success) {
                  Alert.alert('Đã hủy', 'Đơn hàng đã được hủy thành công');
                  fetchOrders(); // Refresh orders list
                } else {
                  Alert.alert('Lỗi', response.data.message || 'Không thể hủy đơn hàng');
                }
              } catch (error) {
                console.error('Error cancelling order:', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi hủy đơn hàng');
              }
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error getting shipper ID:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin shipper');
    }
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const statusConfig = getStatusConfig(item.status);
    const isReadyOrder = item.status === 'ready';
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
              
              {/* {isShippingOrder && (
                <View style={styles.shippingActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => handleCancelOrder(item._id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Khách không nhận</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.completeButton}
                    onPress={() => handleCompleteOrder(item._id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.completeButtonIcon}>✅</Text>
                    <Text style={styles.completeButtonText}>Hoàn thành</Text>
                  </TouchableOpacity>
                </View>
              )} */}
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