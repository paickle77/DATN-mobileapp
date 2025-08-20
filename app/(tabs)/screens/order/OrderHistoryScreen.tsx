// OrderHistoryScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import OrderHistoryItem from '../../component/OrderHistoryItem';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

const { width } = Dimensions.get('window');

type OrderType = {
  __v?: number;
  _id: string;
  Account_id: string | { _id: string };
  address_id?: string | null;
  address_snapshot?: {
    name?: string;
    phone?: string;
    detail?: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  createdAt?: string;
  created_at: string;
  note?: string;
  payment_method?: string;
  shipping_method?: string;
  status: 'pending' | 'confirmed' | 'ready' | 'shipping' | 'done' | 'cancelled' | 'failed';
  total: number;
  original_total?: number;
  discount_amount?: number;
  voucher_code?: string;
  shipping_fee?: number;
  payment_confirmed_at?: string;
  delivered_at?: string;
  updatedAt?: string;
  user_id?: {
    _id: string;
    address_id?: string;
    created_at?: string;
    email?: string;
    facebook_id?: null | string;
    google_id?: null | string;
    image?: string;
    isDefault?: boolean;
    is_lock?: boolean;
    name?: string;
    password?: string;
    phone?: string;
    provider?: string;
    role?: string;
    updated_at?: string;
  };
};

type TabType = 'pending' | 'confirmed' | 'ready' | 'shipping' | 'done' | 'cancelled' | 'failed';

// Fallback component for rendering errors
const FallbackComponent = () => (
  <View style={styles.fallbackContainer}>
    <Text style={styles.fallbackText}>Lỗi hiển thị đơn hàng. Vui lòng thử lại.</Text>
  </View>
);

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const tabs = [
    { 
      key: 'pending', 
      title: 'Chờ xác nhận', 
      icon: 'hourglass-outline', 
      color: '#FF6B35',
      bgColor: 'rgba(255, 107, 53, 0.1)',
      priority: 1 
    },
    { 
      key: 'shipping', 
      title: 'Đang làm', 
      icon: 'bicycle-outline', 
      color: '#4A90E2',
      bgColor: 'rgba(74, 144, 226, 0.1)',
      priority: 2 
    },
    { 
      key: 'done', 
      title: 'Hoàn thành', 
      icon: 'checkmark-done-circle-outline', 
      color: '#28A745',
      bgColor: 'rgba(40, 167, 69, 0.1)',
      priority: 3 
    },
    { 
      key: 'cancelled', 
      title: 'Đã hủy', 
      icon: 'close-circle-outline', 
      color: '#E74C3C',
      bgColor: 'rgba(231, 76, 60, 0.1)',
      priority: 4 
    },
  ];

  const tabTitle = tabs.find(t => t.key === activeTab)?.title;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const accountId = await getUserData('accountId');
      // console.log('🔄 Đang tải đơn hàng cho accountId:', accountId);

      const response = await axios.get(`${BASE_URL}/bills`);
      // console.log('API response:', response.data.data);
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
      Alert.alert('❌ Lỗi', 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    
    if (activeTab === 'shipping') {
      filtered = orders.filter(order => ['confirmed', 'ready', 'shipping'].includes(order.status.toLowerCase()));
    } else if (activeTab === 'cancelled') {
      filtered = orders.filter(order => ['cancelled', 'failed'].includes(order.status.toLowerCase()));
    } else {
      filtered = orders.filter(order => order.status.toLowerCase() === activeTab);
    }

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filtered = filtered.filter(order => {
        const orderId = order._id?.slice(-6)?.toLowerCase() || '';
        if (orderId.includes(searchLower)) return true;

        if (order.address_snapshot) {
          const addressText = [
            order.address_snapshot.name ?? '',
            order.address_snapshot.district ?? '',
            order.address_snapshot.city ?? ''
          ].join(' ').toLowerCase();
          if (addressText.includes(searchLower)) return true;
        }

        if (order.voucher_code && order.voucher_code.toLowerCase().includes(searchLower)) {
          return true;
        }

        return false;
      });
    }

    return filtered;
  };

  const getOrderCount = (status: TabType) => {
    if (status === 'shipping') {
      return orders.filter(order => ['confirmed', 'ready', 'shipping'].includes(order.status.toLowerCase())).length;
    }
    if (status === 'cancelled') {
      return orders.filter(order => ['cancelled', 'failed'].includes(order.status.toLowerCase())).length;
    }
    return orders.filter(order => order.status.toLowerCase() === status).length;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderPress = (orderId: string) => {
    (navigation as any).navigate('OrderDetails', { orderId });
  };

  const handleReorder = (orderId: string) => {
    Alert.alert(
      '🔄 Đặt lại đơn hàng',
      'Bạn muốn đặt lại đơn bánh này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt lại',
          onPress: () => {
            console.log('Reorder:', orderId);
            Alert.alert('✅ Thành công', 'Đã thêm vào giỏ hàng!');
          }
        }
      ]
    );
  };

  const renderEmptyState = () => {
    const hasOrdersInOtherTabs = tabs.some(tab => 
      tab.key !== activeTab && getOrderCount(tab.key as TabType) > 0
    );

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="cafe-outline" size={60} color="#FF6B35" />
        </View>
        
        <Text style={styles.emptyTitle}>
          {hasOrdersInOtherTabs ? `Không có đơn ${tabTitle?.toLowerCase() || ''}` : 'Chưa có đơn bánh nào'}
        </Text>
        
        <Text style={styles.emptyText}>
          {hasOrdersInOtherTabs 
            ? 'Hãy kiểm tra các tab khác để xem đơn hàng'
            : 'Hãy đặt bánh ngon ngay nào! 🧁'
          }
        </Text>
        
        {hasOrdersInOtherTabs && (
          <View style={styles.suggestedTabs}>
            <Text style={styles.suggestedText}>Có đơn hàng tại:</Text>
            <View style={styles.tabSuggestions}>
              {tabs.filter(tab => getOrderCount(tab.key as TabType) > 0 && tab.key !== activeTab)
                   .map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.suggestedTab, { borderColor: tab.color }]}
                  onPress={() => setActiveTab(tab.key as TabType)}
                >
                  <Ionicons name={tab.icon as any} size={16} color={tab.color} />
                  <Text style={[styles.suggestedTabText, { color: tab.color }]}>
                    {tab.title} ({getOrderCount(tab.key as TabType)})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {!hasOrdersInOtherTabs && (
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => {
              try {
                (navigation as any).navigate('TabNavigator', { screen: 'Home' });
              } catch (error) {
                console.log('Navigation error:', error);
              }
            }}
          >
            <View style={styles.shopButtonContent}>
              <Ionicons name="storefront-outline" size={20} color="#FFFFFF" />
              <Text style={styles.shopButtonText}>Đặt bánh ngay</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: OrderType }) => {
    try {
      
      return (
        <OrderHistoryItem
          order={item}
          onPress={handleOrderPress}
          onReorder={handleReorder}
          BASE_URL={BASE_URL}
          onRefresh={fetchOrders}
        />
      );
    } catch (error) {
      console.error('Error rendering order:', item._id, error);
      return <FallbackComponent />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          <View style={styles.loaderIcon}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
          <Text style={styles.loadingText}>Đang tải đơn bánh...</Text>
          <Text style={styles.loadingSubText}>Vui lòng đợi một chút 😊</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#634838" />

      <View style={styles.header}>
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
          <Text style={styles.headerSubtitle}>
            {orders.length} đơn hàng
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setSearchVisible(!searchVisible)} 
            style={[styles.headerActionButton, searchVisible && styles.activeHeaderButton]}
          >
            <Ionicons name="search-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={fetchOrders} 
            style={styles.headerActionButton}
          >
            <Ionicons name="refresh-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {searchVisible && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#FF6B35" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm đơn hàng (ID, địa chỉ, mã giảm giá...)"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={true}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#FF6B35" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.tabContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => {
            const count = getOrderCount(tab.key as TabType);
            const isActive = activeTab === tab.key;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabItem,
                  isActive && [styles.activeTab, { backgroundColor: tab.bgColor }]
                ]}
                onPress={() => setActiveTab(tab.key as TabType)}
              >
                <View style={styles.tabIconContainer}>
                  <Ionicons
                    name={tab.icon as any}
                    size={20}
                    color={isActive ? tab.color : '#999'}
                  />
                  {count > 0 && (
                    <View style={[styles.tabBadge, { backgroundColor: tab.color }]}>
                      <Text style={styles.tabBadgeText}>
                        {count > 99 ? '99+' : count}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.tabText,
                  isActive && [styles.activeTabText, { color: tab.color }]
                ]}>
                  {tab.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={getFilteredOrders()}
        renderItem={renderOrderItem}
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#634838',
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  activeHeaderButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.3)',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tabItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 16,
    minWidth: 100,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  activeTab: {
    borderWidth: 2,
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5E6',
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  tabBadge: {
    position: 'absolute',
    top: -8,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#FFF5E6',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  suggestedTabs: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  suggestedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  tabSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  suggestedTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    margin: 6,
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  suggestedTabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  shopButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  shopButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loaderContent: {
    alignItems: 'center',
  },
  loaderIcon: {
    padding: 20,
    backgroundColor: '#FFF5E6',
    borderRadius: 40,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  loadingSubText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  // Fallback styles
  fallbackContainer: {
    padding: 16,
    backgroundColor: '#FFF5E6',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  fallbackText: {
    color: '#E74C3C',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default OrderHistoryScreen;