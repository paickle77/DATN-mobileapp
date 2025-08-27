  import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { User } from '../../services/RegisterAuthService';
import { assignOrderToShipper, completeOrder, failedOrder, fetchOrderDetailLikeScreen, fetchOrderItemsLikeScreen, OrderDetail, OrderItem, Shipper, updateShipperOnlineStatus } from '../../services/ShipService';
import { getUserData } from '../utils/storage';


const screenWidth = Dimensions.get('window').width;

  const OrderDetailPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params as { orderId: string };
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [shipper, setShipper] = useState<Shipper | null>(null);
    type OnlineStatus = 'true' | 'false' | 'busy' ;
    const [isOnline, setIsOnline] = useState<OnlineStatus>('false');
    const [users, setUsers] = useState<User  | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [proofImage, setProofImage] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null); 

    useEffect(() => {
      fetchOrderDetail();
    }, [orderId]);
    

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const data = await fetchOrderDetailLikeScreen(orderId);
        setOrder(data.order);
        setProofImage(data.proofImage || null);
        setShipper(data.shipper || null);
        setUsers(data.user || null);
        setIsOnline(data.is_online ?? 'false');

        const orderItems = await fetchOrderItemsLikeScreen(orderId);
        setItems(orderItems);
      } catch (e) {
        console.error('Error fetching order detail:', e);
        Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
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

  const setOnlineStatus = async (status: OnlineStatus) => {
    try {
      const id = await getUserData('shipperID');
      await updateShipperOnlineStatus(id, status); // truyền đúng kiểu
      setIsOnline(status);
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật trạng thái online:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái online.");
    }
  };


  const handleAcceptOrder = async (billId: string) => {
    if (isOnline === 'false') {
      Alert.alert('Thông báo', 'Bạn cần bật chế độ Online để nhận đơn hàng.');
      return;
    }
    if (isOnline === "busy") {
      Alert.alert('Thông báo', 'Bạn đang có đơn, không thể nhận đơn hàng này.');
      return;
    }

    try {
      const shipperID = await getUserData('shipperID');
      await assignOrderToShipper(billId, shipperID);
      Alert.alert('Thành công', 'Bạn đã nhận đơn hàng.');
      setOnlineStatus('busy'); // tự động chuyển sang busy
      fetchOrderDetail();
    } catch (error: any) {
      console.error('❌ Lỗi khi nhận đơn:', error);
      Alert.alert('Lỗi', error?.response?.data?.msg || 'Không thể nhận đơn hàng.');
    }
  };
  const handleCompleteOrder = async () => {
    if (!order) return;

    if (isOnline === 'false') {
      Alert.alert('Thông báo', 'Bạn cần bật chế độ Online để nhận đơn hàng.');
      return;
    }

    
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
              const response = await completeOrder(orderId, shipperID, proofImage ?? '');

              if (response.success) {
                Alert.alert('🎉 Thành công', 'Đơn hàng đã được hoàn thành!');
                setOnlineStatus('true'); ;
                fetchOrderDetail();
                setProofImage(null);
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể hoàn thành đơn hàng');
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

    if (isOnline === 'false') {
      Alert.alert('Thông báo', 'Bạn cần bật chế độ Online để nhận đơn hàng.');
      return;
    }


    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn đơn hàng không nhận không?',
      [
        { text: 'Không hủy', style: 'cancel' },
        {
          text: 'Xác nhận hủy',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const shipperID = await getUserData('shipperID');
              const response = await failedOrder(orderId, shipperID, proofImage ?? '');

              if (response.success) {
                Alert.alert('Đã hủy', 'Đơn hàng đã được hủy thành công');
                setOnlineStatus('true'); // quay về online
;
                fetchOrderDetail();
                setProofImage(null);
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể hủy đơn hàng');
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
    
    const statusConfig = getStatusConfig(order.status);

    const pickImage = async () => {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      console.log('====================================');
      console.log('Chọn ảnh từ thư viện:', result);

      if (!result.canceled) {
        const base64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setProofImage(base64String); // Lưu ảnh duy nhất

      }

      
    };

    const takePhoto = async () => {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập camera để chụp ảnh.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });


      if (!result.canceled) {
        const base64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setProofImage(base64String); // Lưu ảnh duy nhất
      }
    };

    const showImageOptions = () => {
              Alert.alert(
                  'Chọn ảnh minh chứng',
                  'Chọn cách bạn muốn thay đổi ảnh minh chứng',
                  [
                      { text: 'Hủy', style: 'cancel' },
                      { text: 'Chọn từ thư viện', onPress: () => pickImage() },
                      { text: 'Chụp ảnh mới', onPress: () => takePhoto() },
                  ]
              );
          };
    const removeImage = () => {
      setProofImage(null);
    };

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
                <Text style={styles.infoValue}>{order.address_snapshot?.name || ''}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{order.address_snapshot?.phone}</Text>
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
                <Text style={styles.addressDetail}>
                  {order.address_snapshot?.detail}
                </Text>
                <Text style={styles.addressArea}>
                  {order.address_snapshot?.ward}, {order.address_snapshot?.district}, {order.address_snapshot?.city}
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
                      {item.product_snapshot?.image_url ? (
                          <Image
                              source={{ uri: item.product_snapshot.image_url }}
                              style={{ width: 50, height: 50, borderRadius: 8 }}
                          />
                      ) : (
                          <Text style={styles.productImageIcon}>📦</Text>
                      )}
                  </View>
                  
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.product_snapshot?.name || ''}</Text>
                    <Text style={styles.productPrice}>
                      {item.product_snapshot?.final_unit_price?.toLocaleString()}₫
                    </Text>
                    <Text style={styles.productQuantity}>Số lượng: {item.quantity}</Text>
                  </View>
                  
                  <View style={styles.itemTotal}>
                    <Text style={styles.itemTotalText}>
                      {(item.product_snapshot?.final_unit_price * item.quantity)?.toLocaleString()}₫
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
                  {order.payment_method === 'Thanh toán khi nhận hàng' ? 'Thanh toán khi nhận hàng' : 'VNPAY'}
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

                    
          <View style={styles.card}>
            
            {(order.status === 'done' || order.status === 'failed') && (
              <View style={styles.card}>
                <View style={styles.headerContainer}>
                  <Icon name="camera-alt" size={20} color="#5f3c1e" />
                  <Text style={styles.headerText}>Ảnh giao hàng</Text>
                </View>

                {proofImage ? (
                  <View style={styles.imageContainer}>
                    <TouchableOpacity
                      style={styles.imageWrapper}
                      onPress={() => setSelectedImage(proofImage)}
                      activeOpacity={0.8}>
                      <Image source={{ uri: proofImage }} style={styles.proofImage} />
                      <View style={styles.imageOverlay}>
                        <Icon name="zoom-in" size={24} color="white" />
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageText}>Không có ảnh chứng minh</Text>
                  </View>
                )}
              </View>
            )}
            {order.status === 'shipping' && (
    <View style={styles.card}>
      <View style={styles.headerContainer}>
        <Icon name="camera-alt" size={20} color="#5f3c1e" />
        <Text style={styles.headerText}>Ảnh giao hàng</Text>
      </View>

      {proofImage ? (
        <View style={styles.imageContainer}>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={() => setSelectedImage(proofImage)}
            activeOpacity={0.8}>
            <Image source={{ uri: proofImage }} style={styles.proofImage} />
            <View style={styles.imageOverlay}>
              <Icon name="zoom-in" size={24} color="white" />
            </View>
          </TouchableOpacity>

          {/* Cho phép remove khi đang shipping */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={removeImage}
            activeOpacity={0.8}>
            <Icon name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={showImageOptions}
          activeOpacity={0.7}>
          <View style={styles.uploadIconContainer}>
            <Icon name="add" size={24} color="#5f3c1e" />
          </View>
          <Text style={styles.uploadText}>Thêm ảnh giao hàng</Text>
          <Text style={styles.uploadSubtext}>Chạm để chọn ảnh</Text>
        </TouchableOpacity>
      )}
       </View>
      )}

            {/* Full Screen Modal */}
            <Modal
              visible={!!selectedImage}
              transparent
              animationType="fade"
              statusBarTranslucent
            >
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.modalCloseArea}
                  onPress={() => setSelectedImage(null)}
                  activeOpacity={1}
                >
                  <View style={styles.modalContent}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setSelectedImage(null)}
                      activeOpacity={0.8}
                    >
                      <Icon name="close" size={24} color="white" />
                    </TouchableOpacity>
                    
                    {selectedImage && (
                      <Image
                        source={{ uri: selectedImage }}
                        style={styles.fullImage}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </Modal>
          </View>
          
          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      
        {/* Action Buttons */}
        {(order.status === 'ready' || order.status === 'shipping') && (
          <View style={styles.actionContainer}>
            {order.status === 'ready'  && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() =>handleAcceptOrder(order._id)}
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
                  <Text style={styles.actionButtonText}>Khách không nhận</Text>
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
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 16,
      gap: 8,
    },
    headerText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    imageContainer: {
      position: 'relative',
    },
    imageWrapper: {
      width: '90%',
      height: 120,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: '#5f3c1e30',
      backgroundColor: 'white',
      elevation: 3,
      shadowColor: '#5f3c1e',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      marginBottom: 16,
      justifyContent: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
      alignSelf: 'flex-start',
    },
    proofImage: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: 0,
    },
    removeButton: {
      position: 'absolute',
      top: -8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#ef4444',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    noImageContainer: {
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noImageText: {
      fontSize: 16,
      color: '#888',
      fontStyle: 'italic',
    },

    uploadButton: {
      width: '100%',
      height: 120,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: '#5f3c1e40',
      borderStyle: 'dashed',
      backgroundColor: '#5f3c1e08',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    uploadIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#5f3c1e15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#5f3c1e',
    },
    uploadSubtext: {
      fontSize: 12,
      color: '#666',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
    },
    modalCloseArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      position: 'relative',
      width: screenWidth - 40,
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: -20,
      right: -20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    fullImage: {
      width: screenWidth - 40,
      height: screenWidth - 40,
      maxHeight: 400,
      borderRadius: 12,
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
      backgroundColor: '#5C5C5C',
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