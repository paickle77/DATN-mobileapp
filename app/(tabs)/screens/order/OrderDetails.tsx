import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import an icon library, e.g., Ionicons
import OrderItemDetail from '../../component/Odercomponent';
import { BASE_URL } from '../../services/api';

type BillDetailItemType = {
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
};

const OderDetails = () => {
  const route = useRoute();
  const navigation = useNavigation(); // Get the navigation object
  const { orderId } = route.params as { orderId: string };

  const [data, setData] = useState<BillDetailItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('✅✅✅Order ID từ params:', orderId);

  // Use useLayoutEffect to set header options, ensuring it runs before the component renders

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}/GetAllBillDetails`);
      const filteredData: BillDetailItemType[] = response.data.data.filter(
        (item: BillDetailItemType) =>
          item?.bill_id?._id === orderId &&
          item?.product_id !== null // nếu cần kiểm tra thêm
      );
      // console.log('✅ Dữ liệu chi tiết đơn hàng (đã lọc):', filteredData);
      setData(filteredData);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', err);
      setError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchData();
    } else {
      setLoading(false);
      setError('Không tìm thấy ID đơn hàng để hiển thị.');
    }
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
        <Icon name="arrow-back" size={25} color="#000" />
      </TouchableOpacity>
      {data.length > 0 ? (
        data.map((item) => (
          <OrderItemDetail key={item._id} orderItem={item} />
        ))
      ) : (
        <Text style={styles.noItemsText}>Không tìm thấy sản phẩm nào cho đơn hàng này.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
  },
  noItemsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default OderDetails;