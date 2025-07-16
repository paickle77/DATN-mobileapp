import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the back icon
import axios from 'axios';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

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
      facebook_id: null | string; // Có thể là null
      google_id: null | string; // Có thể là null
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

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/GetAllBills`);
      const userData = await getUserData('userData'); // giả sử userData là object chứa _id

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

      console.log('✅✅✅Đơn hàng của người dùng:', filteredOrders);
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
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4B2E2E" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Lịch sử đơn hàng</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {orders.length === 0 ? (
          <View style={styles.emptyOrdersContainer}>
            <Text style={styles.emptyOrdersText}>Bạn chưa có đơn hàng nào.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.userRow}>
                <Image
                  source={{ uri: 'https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg' }}
                  style={styles.userImage}
                />
                <View>
                  <Text style={styles.userName}>{order.address_id?.name || 'N/A'}</Text>
                  <Text style={styles.userPhone}>{order.address_id?.phone || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
                <Text style={styles.addressText}>
                  {order.address_id?.detail_address}, {order.address_id?.ward},{' '}
                  {order.address_id?.district}, {order.address_id?.city}
                </Text>
              </View>

              {order.note && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Ghi chú</Text>
                  <Text style={styles.noteText}>{order.note}</Text>
                </View>
              )}

              <View style={styles.summarySection}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Tổng tiền:</Text>
                  <Text style={styles.value}>
                    {Number(order.total).toLocaleString('vi-VN')}đ
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Trạng thái:</Text>
                  <Text style={[styles.value, styles.statusText]}>{order.status}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Ngày đặt:</Text>
                  <Text style={styles.value}>
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => handleReviewPress(order._id)}
              >
                <Text style={styles.reviewButtonText}>Xem chi tiết đơn hàng</Text>
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
    backgroundColor: '#FDF7EE', // Lighter background for a softer feel
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40, // Adjust for status bar
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4B2E2E',
    flex: 1, // Allows title to take available space
    textAlign: 'center',
    marginLeft: -30, // Adjust to center the title with the back button
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF7EE',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8B4513',
  },
  scrollViewContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 15, // Slightly more rounded corners
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0E5D7', // Subtle border
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  userName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  userPhone: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  detailSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#8B4513', // Brownish color for titles
  },
  addressText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  noteText: {
    fontSize: 15,
    color: '#555',
    fontStyle: 'italic', // Italicize notes
  },
  summarySection: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 15,
    marginTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  statusText: {
    color: '#28A745', // Green for status (you might want to dynamically change this based on status)
    fontWeight: 'bold',
  },
  reviewButton: {
    marginTop: 20,
    backgroundColor: '#A0522D', // Slightly different brown for the button
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  reviewButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyOrdersText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
});