import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const OrderCard = ({ 
  orderDate = "01/09/2021", 
  status = "Đặt hàng thành công", 
  imageUrl, 
  productName, 
  quantity, 
  price, 
  deliveryStatus 
}) => {

  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.date}>Thứ hai, {orderDate}</Text>

      <View style={styles.card}>
        {/* Nút đánh giá nằm cố định ở góc phải trên */}
        {deliveryStatus === 'Đã nhận hàng' && (
          <TouchableOpacity style={styles.reviewButton} onPress={()=>navigation.navigate('ReviewScreen')}>
            <Text style={styles.reviewButtonText}>Đánh giá</Text>
          </TouchableOpacity>
        )}

        <View style={styles.headerRow}>
          <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
          <Text style={styles.orderStatus}>{status}</Text>
        </View>

        <View style={styles.productRow}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{productName}</Text>
            <Text style={styles.details}>{quantity} sản phẩm | {price} VNĐ</Text>
            <Text style={styles.deliveryStatus}>Trạng thái: {deliveryStatus}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
  },
  date: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative', // cần có để position absolute hoạt động chính xác
  },
  reviewButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFD700',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    zIndex: 1,
  },
  reviewButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderStatus: {
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 15,
  },
  productRow: {
    flexDirection: 'row',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  productInfo: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  details: {
    fontSize: 14,
    marginTop: 6,
    color: '#555',
  },
  deliveryStatus: {
    fontSize: 14,
    marginTop: 4,
    color: '#777',
  },
});
