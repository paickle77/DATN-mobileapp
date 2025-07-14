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
  _id: string;
  user_id?: { _id?: string; name?: string; email?: string; image?: string } | string | null;
  address_id?: { detail_address?: string; ward?: string; district?: string; city?: string };
  voucher_id?: { code?: string; discount_percent?: number };
  total_price?: number;
  status?: string;
  created_at?: string;
};

const fetchOrders = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/GetAllOrders`);
    const userData = await getUserData('userData'); // giả sử userData là object chứa _id

    const allOrders: OrderType[] = response.data.data;

    // ✅ Lọc đơn hàng theo user_id trùng với người dùng hiện tại
    const filteredOrders = allOrders.filter((order: OrderType) => {
      let orderUserId: string | undefined;
      if (order.user_id && typeof order.user_id === 'object') {
        orderUserId = order.user_id._id ?? undefined;
      } else if (typeof order.user_id === 'string') {
        orderUserId = order.user_id;
      }
      return orderUserId === (userData?._id ?? userData);
    });

    console.log('Đơn hàng của người dùng:', filteredOrders);
    setOrders(filteredOrders);
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = (error as { message: string }).message;
    }
    console.error('Lỗi khi gọi API đơn hàng:', errorMessage);
    Alert.alert('Lỗi khi tải đơn hàng');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReviewPress = (orderId) => {
    console.log('Đi tới đánh giá đơn:', orderId);
    navigation.navigate('/ReviewForm', { orderId });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={{ marginTop: 10 }}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Lịch sử đơn hàng</Text>

      {orders.map((order) => (
        <View key={order._id} style={styles.orderCard}>
          {/* 🧍‍♂️ Người dùng */}
          <View style={styles.userRow}>
            <Image
              source={{ uri: order.user_id?.image || 'https://via.placeholder.com/50' }}
              style={styles.userImage}
            />
            <View>
              <Text style={styles.userName}>{order.user_id?.name}</Text>
              <Text style={styles.userEmail}>{order.user_id?.email}</Text>
            </View>
          </View>

          {/* 🏠 Địa chỉ */}
          <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
          <Text style={styles.addressText}>
            {order.address_id?.detail_address}, {order.address_id?.ward},{' '}
            {order.address_id?.district}, {order.address_id?.city}
          </Text>

          {/* 🎫 Mã giảm giá */}
          {order.voucher_id && (
            <>
              <Text style={styles.sectionTitle}>Mã khuyến mãi</Text>
              <Text style={styles.voucherText}>
                {order.voucher_id.code} - Giảm {order.voucher_id.discount_percent}%
              </Text>
            </>
          )}

          {/* 💰 Tổng tiền và trạng thái */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tổng tiền:</Text>
            <Text style={styles.value}>
              {Number(order.total_price).toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Trạng thái:</Text>
            <Text style={styles.value}>{order.status}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày đặt:</Text>
            <Text style={styles.value}>
              {new Date(order.created_at).toLocaleDateString('vi-VN')}
            </Text>
          </View>

          {/* ✅ Nút đánh giá nếu đã giao hàng */}
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => handleReviewPress(order._id)}
            >
              <Text style={styles.reviewButtonText}>Xem chi tiết đơn hàng</Text>
            </TouchableOpacity>
         
        </View>
      ))}
    </ScrollView>
  );
};

export default ReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4B2E2E',
  },
  orderCard: {
    backgroundColor: '#FDF7EE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#777',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    color: '#4B2E2E',
  },
  addressText: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  voucherText: {
    fontSize: 14,
    color: '#0A7',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  reviewButton: {
    marginTop: 14,
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
