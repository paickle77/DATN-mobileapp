import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Checkout = ({ navigation, route }) => {
  const [note, setNote] = useState('');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('standard');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedPaymentName, setSelectedPaymentName] = useState('');

  useFocusEffect(
    useCallback(() => {
      const selectedPayment = route.params?.selectedPaymentMethod;
      if (selectedPayment) {
        setSelectedPaymentMethod(selectedPayment.id);
        setSelectedPaymentName(selectedPayment.name);
        // Clear the params to prevent re-setting on subsequent visits
        navigation.setParams({ selectedPaymentMethod: null });
      }
    }, [route])
  );

  const userAddress = {
    name: 'Nguyễn Văn An',
    phone: '0987654321',
    address: 'Số 123, Đường ABC, Phường XYZ, Quận 1, TP.HCM',
  };

  const cartItems = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      price: 29990000,
      quantity: 1,
      image: 'https://via.placeholder.com/80',
      variant: '256GB - Xanh Titan',
    },
    {
      id: 2,
      name: 'AirPods Pro 2',
      price: 6990000,
      quantity: 2,
      image: 'https://via.placeholder.com/80',
      variant: 'Trắng',
    },
  ];

  const shippingMethods = [
    {
      id: 'standard',
      name: 'Giao hàng tiêu chuẩn',
      time: '3-5 ngày',
      price: 30000,
    },
    {
      id: 'express',
      name: 'Giao hàng nhanh',
      time: '1-2 ngày',
      price: 50000,
    },
    {
      id: 'same_day',
      name: 'Giao hàng trong ngày',
      time: 'Trong ngày',
      price: 100000,
    },
  ];

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      icon: 'cash-outline',
    },
    {
      id: 'card',
      name: 'Thẻ tín dụng/Ghi nợ',
      icon: 'card-outline',
    },
    {
      id: 'banking',
      name: 'Chuyển khoản ngân hàng',
      icon: 'business-outline',
    },
    {
      id: 'ewallet',
      name: 'Ví điện tử',
      icon: 'wallet-outline',
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = shippingMethods.find(method => method.id === selectedShippingMethod)?.price || 0;
  const total = subtotal + shippingFee;

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const handleAddressPress = () => {
    navigation.navigate('AddressList');
  };

  const handlePaymentMethodPress = () => {
    navigation.navigate('PaymentMethods');
  };

  const handlePlaceOrder = () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán');
      return;
    }
    Alert.alert(
      'Xác nhận đặt hàng',
      `Tổng tiền: ${formatPrice(total)}\nPhương thức thanh toán: ${selectedPaymentName}`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đặt hàng', onPress: () => console.log('Đặt hàng thành công') },
      ]
    );
  };

  // Function to get payment icon based on payment method
  const getPaymentIcon = () => {
    if (!selectedPaymentMethod) return null;
    
    // Check if it's a default payment method
    const defaultMethod = paymentMethods.find(p => p.id === selectedPaymentMethod);
    if (defaultMethod) {
      return defaultMethod.icon;
    }
    
    // For custom payment methods from PaymentMethods screen
    if (selectedPaymentMethod === 'cod') return 'cash-outline';
    if (selectedPaymentMethod.includes('momo')) return 'wallet-outline';
    if (selectedPaymentMethod.includes('zalopay')) return 'wallet-outline';
    if (selectedPaymentMethod.includes('vnpay')) return 'wallet-outline';
    if (selectedPaymentMethod.includes('card')) return 'card-outline';
    
    return 'wallet-outline'; // default icon
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate("CartScreen")}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
        </View>

        {/* Địa chỉ giao hàng */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          </View>
          <TouchableOpacity style={styles.addressCard} onPress={handleAddressPress}>
            <View style={styles.addressInfo}>
              <Text style={styles.addressName}>{userAddress.name}</Text>
              <Text style={styles.addressPhone}>{userAddress.phone}</Text>
              <Text style={styles.addressText}>{userAddress.address}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bag-outline" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Sản phẩm ({cartItems.length})</Text>
          </View>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productVariant}>{item.variant}</Text>
                <View style={styles.productBottom}>
                  <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                  <Text style={styles.productQuantity}>x{item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Lời nhắn */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Lời nhắn</Text>
          </View>
          <TextInput
            style={styles.noteInput}
            placeholder="Nhập lời nhắn cho người bán (tùy chọn)"
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={200}
          />
        </View>

        {/* Phương thức vận chuyển */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car-outline" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
          </View>
          {shippingMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.shippingOption,
                selectedShippingMethod === method.id && styles.selectedOption,
              ]}
              onPress={() => setSelectedShippingMethod(method.id)}
            >
              <View style={styles.shippingInfo}>
                <Text style={styles.shippingName}>{method.name}</Text>
                <Text style={styles.shippingTime}>{method.time}</Text>
              </View>
              <View style={styles.shippingRight}>
                <Text style={styles.shippingPrice}>{formatPrice(method.price)}</Text>
                <View style={styles.radioButton}>
                  {selectedShippingMethod === method.id && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Phương thức thanh toán */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          <TouchableOpacity style={styles.paymentCard} onPress={handlePaymentMethodPress}>
            <View style={styles.paymentInfo}>
              {selectedPaymentMethod ? (
                <>
                  <Ionicons 
                    name={getPaymentIcon() as keyof typeof Ionicons.glyphMap} 
                    size={20} 
                    color="#007AFF" 
                  />
                  <Text style={styles.paymentText}>
                    {selectedPaymentName}
                  </Text>
                </>
              ) : (
                <Text style={styles.paymentPlaceholder}>Chọn phương thức thanh toán</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Tóm tắt đơn hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>{formatPrice(shippingFee)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Tổng: {formatPrice(total)}</Text>
        </View>
        <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
          <Text style={styles.orderButtonText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  productCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  productVariant: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  shippingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: -12,
  },
  shippingInfo: {
    flex: 1,
  },
  shippingName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  shippingTime: {
    fontSize: 12,
    color: '#666',
  },
  shippingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shippingPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
  },
  paymentPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flex: 1,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  orderButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 16,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default Checkout;