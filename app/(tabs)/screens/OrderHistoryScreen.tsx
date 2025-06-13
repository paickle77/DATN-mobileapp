import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OrderCard from '../component/OrderCard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const orders = [
    {
      id: 1,
      orderDate: '01/09/2021',
      status: 'Đặt hàng thành công',
      imageUrl: 'https://i.imgur.com/ndRMwPL.jpg',
      productName: 'Spider Plant | Bánh sinh nhật',
      quantity: 3,
      price: '515.000',
      deliveryStatus: 'Đã nhận hàng',
    },
    {
      id: 2,
      orderDate: '15/10/2021',
      status: 'Đặt hàng thành công',
      imageUrl: 'https://i.imgur.com/3QdM8Ye.jpg',
      productName: 'Bánh kem chocolate',
      quantity: 2,
      price: '430.000',
      deliveryStatus: 'Đang giao hàng',
    },
    {
      id: 3,
      orderDate: '20/12/2021',
      status: 'Đặt hàng thành công',
      imageUrl: 'https://i.imgur.com/9u1t1Xv.jpg',
      productName: 'Bánh sinh nhật dâu tây',
      quantity: 1,
      price: '610.000',
      deliveryStatus: 'Chưa xử lý',
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Ionicons name="arrow-back-circle-outline" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử đơn hàng</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {orders.map(order => (
          <OrderCard
            key={order.id}
            orderDate={order.orderDate}
            status={order.status}
            imageUrl={order.imageUrl}
            productName={order.productName}
            quantity={order.quantity}
            price={order.price}
            deliveryStatus={order.deliveryStatus}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingTop: 40,
    paddingHorizontal: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  backIcon: {
    position: 'absolute',
    left: 0,
    marginLeft: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
});
