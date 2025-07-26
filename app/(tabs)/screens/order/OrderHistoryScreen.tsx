import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
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

const ReviewScreen = () => {
  const navigation = useNavigation();
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

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/GetAllBills`);
      const userData = await getUserData('userData');

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
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Lịch sử đơn hàng</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyOrdersContainer}>
            <Ionicons name="receipt-outline" size={80} color="#C7C7CC" />
            <Text style={styles.emptyOrdersTitle}>Chưa có đơn hàng</Text>
            <Text style={styles.emptyOrdersText}>
              Bạn chưa có đơn hàng nào.{'\n'}Hãy khám phá và mua sắm ngay!
            </Text>
          </View>
        ) : (
          orders.map((order, index) => (
            <View key={order._id} style={[styles.orderCard, { marginTop: index === 0 ? 0 : 16 }]}>
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <View style={styles.orderIdSection}>
                  <Ionicons name="receipt" size={16} color="#666" />
                  <Text style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Ionicons 
                    name={getStatusIcon(order.status)} 
                    size={14} 
                    color={getStatusColor(order.status)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status}
                  </Text>
                </View>
              </View>

              {/* Customer Info */}
              <View style={styles.customerSection}>
                <View style={styles.customerInfo}>
                  <Image
                    source={{ uri: 'https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg' }}
                    style={styles.customerAvatar}
                  />
                  <View style={styles.customerDetails}>
                    <Text style={styles.customerName}>{order.address_id?.name || 'Khách hàng'}</Text>
                    <Text style={styles.customerPhone}>{order.address_id?.phone || 'N/A'}</Text>
                  </View>
                </View>
              </View>

              {/* Delivery Address */}
              <View style={styles.addressSection}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="location" size={16} color="#FF6B6B" />
                  <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
                </View>
                <Text style={styles.addressText}>
                  {order.address_id?.detail_address}, {order.address_id?.ward},{' '}
                  {order.address_id?.district}, {order.address_id?.city}
                </Text>
              </View>

              {/* Note Section */}
              {order.note && (
                <View style={styles.noteSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="document-text" size={16} color="#FF6B6B" />
                    <Text style={styles.sectionTitle}>Ghi chú</Text>
                  </View>
                  <Text style={styles.noteText}>{order.note}</Text>
                </View>
              )}

              {/* Order Summary */}
              <View style={styles.summarySection}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Tổng tiền</Text>
                    <Text style={styles.totalAmount}>
                      {Number(order.total).toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Ngày đặt</Text>
                    <Text style={styles.summaryValue}>
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => handleReviewPress(order._id)}
                activeOpacity={0.8}
              >
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
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
  screenTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 40,
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
  scrollViewContent: {
    padding: 16,
  },
  emptyOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyOrdersTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyOrdersText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
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
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  orderIdSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  customerSection: {
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
  },
  addressSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingLeft: 22,
  },
  noteSection: {
    marginBottom: 16,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
    paddingLeft: 22,
  },
  summarySection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});