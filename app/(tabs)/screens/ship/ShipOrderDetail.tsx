import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

interface OrderItem {
  _id: string;
  bill_id: {
    _id: string;
  };
  product_id: {
    _id: string;
    name: string;
    price: number;
    image_url: string;
  };
  size: string;
  quantity: number;
  price: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface User {
    _id: string;
    account_id: string;
    name: string;
    email: string;
    phone: string;
}

interface Shipper{
    _id: string;
    account_id: string;
    full_name: string;
    phone: string;
    image: string;
    license_number: string;
    vehicle_type: string;
    is_online: boolean;
    updatedAt: string;
}

interface OrderDetail {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  total: number;
  shipping_fee: number;
  discount_amount: number;
  payment_method: string;
  note?: string;
  user_id?: string;
  address_id: {
    _id: string;
    detail_address: string;
    ward: string;
    district: string;
    city: string;
    name: string;
    phone: string;
  };
  shipper_id?: string;
  tracking_info?: {
    accepted_at?: string;
    shipping_at?: string;
    completed_at?: string;
    cancelled_at?: string;
  };
}

const OrderDetailPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [shipper, setShipper] = useState<Shipper | null>(null);
  const [users, setUsers] = useState<User  | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
    fetchOrderItems();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/GetAllBills`);
      const data = response.data.data;
      const orderDetail = data.find((item: OrderDetail) => item._id === orderId);
      const shippers = await axios.get(`${BASE_URL}/shippers`);
      const DataShipper = shippers.data.data;
      const filteredItemsWithShipper = DataShipper.find( (shipper: Shipper) => shipper._id === orderDetail?.shipper_id);
        setShipper(filteredItemsWithShipper || null);
        
        if (orderDetail && filteredItemsWithShipper) {
            setOrder({ ...orderDetail, shipper_id: filteredItemsWithShipper });
        } else {
            setOrder(orderDetail);
        }
        
      const dataUser = await axios.get(`${BASE_URL}/users`);
      const userData = dataUser.data.data;
        console.log('✅ Dữ liệu người dùng:', orderDetail?.user_id);
      const filteredUser = userData.find((user: User) => user.account_id === orderDetail?.user_id);
      setUsers(filteredUser);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/GetAllBillDetails`);
        const allItems: OrderItem[] = response.data.data;
        const filteredItems = allItems.filter(item => item.bill_id?._id === orderId);
        
        setItems(filteredItems);
    } catch (error) {
        console.error('Error fetching order items:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm trong đơn hàng');
    }
    };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Chờ xác nhận', 
          color: '#FF9800', 
          bgColor: '#FFF3E0',
          icon: '⏳',
          progress: 25
        };
      case 'ready':
        return { 
          label: 'Có thể nhận', 
          color: '#FF6B35', 
          bgColor: '#FFF0ED',
          icon: '📦',
          progress: 50
        };
      case 'shipping':
        return { 
          label: 'Đang giao', 
          color: '#2196F3', 
          bgColor: '#E3F2FD',
          icon: '🚚',
          progress: 75
        };
      case 'done':
        return { 
          label: 'Đã giao', 
          color: '#4CAF50', 
          bgColor: '#E8F5E8',
          icon: '✅',
          progress: 100
        };
      case 'cancelled':
        return { 
          label: 'Đã hủy', 
          color: '#F44336', 
          bgColor: '#FFEBEE',
          icon: '❌',
          progress: 0
        };
      default:
        return { 
          label: status, 
          color: '#9E9E9E', 
          bgColor: '#F5F5F5',
          icon: '📄',
          progress: 0
        };
    }
  };

  const handleCallCustomer = () => {
    if (users?.phone) {
      Linking.openURL(`tel:${users?.phone}`);
    }
  };

  const handleCallShipper = () => {
    if (shipper?.phone) {
      Linking.openURL(`tel:${shipper?.phone}`);
    }
  };

  const handleAcceptOrder = async () => {
    if (!order) return;
    
    try {
      setActionLoading(true);
      const shipperID = await getUserData('shipperID');
      
      const response = await axios.post(`${BASE_URL}/AcceptOrder`, {
        orderId: order._id,
        shipperId: shipperID
      });
      
      if (response.data.success) {
        Alert.alert('Thành công', 'Đã nhận đơn hàng thành công!');
        fetchOrderDetail();
      } else {
        Alert.alert('Lỗi', response.data.message || 'Không thể nhận đơn hàng');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi nhận đơn hàng');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!order) return;
    
    Alert.alert(
      'Hoàn thành đơn hàng',
      'Xác nhận bạn đã giao hàng thành công cho khách hàng?',
      [
        { text: 'Chưa giao', style: 'cancel' },
        {
          text: 'Đã giao xong',
          onPress: async () => {
            try {
              setActionLoading(true);
              const shipperID = await getUserData('shipperID');
              
              const response = await axios.post(`${BASE_URL}/CompleteOrder`, {
                orderId: order._id,
                shipperId: shipperID
              });
              
              if (response.data.success) {
                Alert.alert('🎉 Thành công', 'Đơn hàng đã được hoàn thành!');
                fetchOrderDetail();
              } else {
                Alert.alert('Lỗi', response.data.message || 'Không thể hoàn thành đơn hàng');
              }
            } catch (error) {
              console.error('Error completing order:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi hoàn thành đơn hàng');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        { text: 'Không hủy', style: 'cancel' },
        {
          text: 'Xác nhận hủy',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const shipperID = await getUserData('shipperID');
              
              const response = await axios.post(`${BASE_URL}/CancelOrder`, {
                orderId: order._id,
                shipperId: shipperID
              });
              
              if (response.data.success) {
                Alert.alert('Đã hủy', 'Đơn hàng đã được hủy thành công');
                fetchOrderDetail();
              } else {
                Alert.alert('Lỗi', response.data.message || 'Không thể hủy đơn hàng');
              }
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi hủy đơn hàng');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5f3c1e" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>📦</Text>
        <Text style={styles.errorTitle}>Không tìm thấy đơn hàng</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchOrderDetail}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#5f3c1e" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <Text style={styles.headerSubtitle}>#{order._id.slice(-8).toUpperCase()}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
            <Text style={styles.orderDate}>
              {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${statusConfig.progress}%`,
                    backgroundColor: statusConfig.color
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{statusConfig.progress}% hoàn thành</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👤</Text>
            <Text style={styles.cardTitle}>Thông tin khách hàng</Text>
            <TouchableOpacity 
              style={styles.callButton}
              onPress={handleCallCustomer}
            >
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tên khách hàng</Text>
              <Text style={styles.infoValue}>{users?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>{users?.phone}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📍</Text>
            <Text style={styles.cardTitle}>Địa chỉ giao hàng</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.addressContainer}>
              <Text style={styles.receiverName}>{order.address_id?.name}</Text>
              <Text style={styles.receiverPhone}>{order.address_id?.phone}</Text>
              <Text style={styles.addressDetail}>
                {order.address_id?.detail_address}
              </Text>
              <Text style={styles.addressArea}>
                {order.address_id?.ward}, {order.address_id?.district}, {order.address_id?.city}
              </Text>
            </View>
          </View>
        </View>

        {/* Shipper Info - if assigned */}
        {order.shipper_id && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🚚</Text>
              <Text style={styles.cardTitle}>Thông tin shipper</Text>
              <TouchableOpacity 
                style={styles.callButton}
                onPress={handleCallShipper}
              >
                <Text style={styles.callIcon}>📞</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tên shipper: </Text>
                <Text style={styles.infoValue}>{shipper?.full_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số điện thoại: </Text>
                <Text style={styles.infoValue}>{shipper?.phone}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🛍️</Text>
            <Text style={styles.cardTitle}>Sản phẩm đặt hàng</Text>
            <Text style={styles.itemCount}>{items?.length || 0} sản phẩm</Text>
          </View>
          
          <View style={styles.cardContent}>
            {items?.map((item, index) => (
              <View key={item._id} style={styles.orderItem}>
                <View style={styles.productImagePlaceholder}>
                    {item.product_id?.image_url ? (
                        <Image
                            source={{ uri: item.product_id.image_url }}
                            style={{ width: 50, height: 50, borderRadius: 8 }}
                        />
                    ) : (
                        <Text style={styles.productImageIcon}>📦</Text>
                    )}
                </View>
                
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.product_id?.name}</Text>
                  <Text style={styles.productPrice}>
                    {item.product_id?.price?.toLocaleString()}₫
                  </Text>
                  <Text style={styles.productQuantity}>Số lượng: {item.quantity}</Text>
                </View>
                
                <View style={styles.itemTotal}>
                  <Text style={styles.itemTotalText}>
                    {(item.price * item.quantity)?.toLocaleString()}₫
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💰</Text>
            <Text style={styles.cardTitle}>Thông tin thanh toán</Text>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>
                {((order.total || 0) - (order.shipping_fee || 0) + (order.discount_amount || 0))?.toLocaleString()}₫
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>
                {(order.shipping_fee || 0)?.toLocaleString()}₫
              </Text>
            </View>
            
            {order.discount_amount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giảm giá</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -{order.discount_amount?.toLocaleString()}₫
                </Text>
              </View>
            )}
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>
                {order.total?.toLocaleString()}₫
              </Text>
            </View>
            
            <View style={styles.paymentMethod}>
              <Text style={styles.paymentLabel}>Phương thức thanh toán</Text>
              <Text style={styles.paymentValue}>
                {order.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
              </Text>
            </View>
          </View>
        </View>

        {/* Note */}
        {order.note && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📝</Text>
              <Text style={styles.cardTitle}>Ghi chú</Text>
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.noteText}>{order.note}</Text>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      {(order.status === 'ready' || order.status === 'shipping') && (
        <View style={styles.actionContainer}>
          {order.status === 'ready' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAcceptOrder}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.actionButtonIcon}>🚚</Text>
                  <Text style={styles.actionButtonText}>Nhận đơn hàng</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          
          {order.status === 'shipping' && (
            <View style={styles.shippingActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelOrder}
                disabled={actionLoading}
              >
                <Text style={styles.actionButtonIcon}>❌</Text>
                <Text style={styles.actionButtonText}>Hủy đơn</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton]}
                onPress={handleCompleteOrder}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.actionButtonIcon}>✅</Text>
                    <Text style={styles.actionButtonText}>Hoàn thành</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default OrderDetailPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#5f3c1e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#5f3c1e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5f3c1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 14,
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  addressContainer: {
    
  },
  receiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  receiverPhone: {
    fontSize: 14,
    color: '#5f3c1e',
    marginBottom: 8,
  },
  addressDetail: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 4,
  },
  addressArea: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productImageIcon: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#5f3c1e',
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemTotal: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  itemTotalText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountValue: {
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5f3c1e',
  },
  paymentMethod: {
    marginTop: 8,
  },
  paymentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 100,
  },
  actionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  acceptButton: {
    backgroundColor: '#5f3c1e',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    flex: 1,
    marginRight: 8,
  },
  shippingActions: {
    flexDirection: 'row',
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});