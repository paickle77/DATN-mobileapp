import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
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
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

export interface Address {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  ward: string;
  district: string;
  city: string;
  detail_address: string;
  isDefault: boolean | string;
  latitude: string;
  longitude: string;
}
type RootStackParamList = {
  AddAddress: undefined;
  EditAddress: { address: Address };
};

const Checkout = ({ navigation, route }) => {
  const [note, setNote] = useState('');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('standard');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedPaymentName, setSelectedPaymentName] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [listCart,setListCart]=useState([]);
  const [fullPaymentObject, setFullPaymentObject] = useState<any>(null);

const buildBillPayload = async () => {
  const userData = await getUserData('userData');
  const userID = typeof userData === 'string' ? userData : userData._id;
  const defaultAddress = addresses[0];

  const billDetailsData = listCart.map((item) => ({
    product_id: item.product_id._id,     // ✅ Chỉ cần ID
    size: item.size || item.Size || '-', // fallback nếu field tên khác
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity,
  }));

  const payload = {
    user_id: userID,
    address_id: defaultAddress?._id ?? null,
    note: note || '',
    shipping_method: selectedShippingMethod,
    payment_method: selectedPaymentName,
    total: total,
    items: billDetailsData,
    status:"doing",
  };

  console.log("🚀 Payload gửi lên server:", payload);
  return payload;
};

const sendBillDetails = async (billId, items) => {
  try {
    for (const item of items) {
      const payload = {
        bill_id: billId,
        product_id: item.product_id._id || item.product_id,
        size: item.size || item.Size || '-',
        quantity: item.quantity,
        price: item.price,
        total: item.total || item.price * item.quantity,
      };

      console.log('📤 Gửi 1 billDetail:', payload);
      const response = await axios.post(`${BASE_URL}/billdetails`, payload);
      console.log('✅ Gửi billDetail thành công:', response.data);
    }
  } catch (error) {
    console.error('❌ Lỗi khi gửi billDetails:', error.response?.data || error.message);
  }
};



const logCheckoutData = () => {
  const defaultAddress = addresses[0]; // Chỉ lấy 1 địa chỉ mặc định đầu tiên nếu có

  console.log("========== DỮ LIỆU CHECKOUT ==========");
  console.log("📦 Address._id:", defaultAddress?._id ?? 'Không có địa chỉ');
  console.log("🛒 listCart.id:", listCart.map(item => item.id));
  console.log("💬 Ghi chú:", note || 'Không có');
  console.log("🚚 Phương thức vận chuyển:", selectedShippingMethod);
  console.log("💳 Phương thức thanh toán:", selectedPaymentName || 'Chưa chọn');
  console.log("💰 Tổng thanh toán:", formatPrice(total));
  console.log("======================================");
    const billDetailsData = listCart.map((item) => ({
    product_id: item.product_id,
    size: item.Size,
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity,
  }));

  console.log("🧾 Chi tiết hóa đơn (billDetails):", billDetailsData);
  console.log("======================================");
};




useFocusEffect(
  useCallback(() => {
    fetchAddresses();
    FetchData();
  }, [])
);


const FetchData = async () => {
  const user = await getUserData('userData');
  const userId = user
  console.log("userID:", userId);

  try {
    const response = await axios.get(`${BASE_URL}/GetAllCarts`);
    const APIlistCart = response.data.data;
    console.log("listCart from API: ⭐️⭐️⭐️", APIlistCart);

    const formattedData = APIlistCart.map((item) => ({
      id: item._id,
      title: item.product_id.name,
      product_id: item.product_id,
      user_id: item.user_id,
      Size: item.size_id.size,
      price: item.product_id.price,
      image: item.product_id.image_url,
      quantity: item.quantity,
    }));

    // 🔍 Lọc ra những item có user_id khớp với user hiện tại
    const userCartItems = formattedData.filter(item => item.user_id === userId);

    setListCart(userCartItems); // 👉 chỉ lưu trữ dữ liệu thuộc user này
      (userCartItems); // 👉 chỉ render dữ liệu thuộc user này
    console.log("👉👉👉 Dữ liệu giỏ hàng theo user:", userCartItems);
  } catch (error) {
    console.log("Lỗi API:", error);
  }
};



const fetchAddresses = async () => {
  try {
    const userData = await getUserData('userData');
    const userID = typeof userData === 'string' ? userData : userData._id;

    const response = await axios.get(`${BASE_URL}/GetAllAddress`);
    const allData = response.data?.data ?? [];

    const filtered = allData.filter((item: Address) =>
      item.user_id?._id === userID && (item.isDefault === true || item.isDefault === 'true')
    );

    setAddresses(filtered);
    console.log('⭐️⭐️⭐️ Địa chỉ mặc định của user:', filtered);
  } catch (error) {
    console.error('❌ Lỗi lấy địa chỉ:', error);
    Alert.alert('Lỗi', 'Không thể tải địa chỉ. Vui lòng thử lại sau.');
  }
};


  // const defaultAddress = addresses.find(addr => addr.isDefault === true || addr.isDefault === 'true') || addresses[0];



  useFocusEffect(
    useCallback(() => {
      const selectedPayment = route.params?.selectedPaymentMethod;
      console.log('Selected Payment Method:', selectedPayment);
      if (selectedPayment) {
        setSelectedPaymentMethod(selectedPayment.id);
        setSelectedPaymentName(selectedPayment.name);
        // Clear the params to prevent re-setting on subsequent visits
         setFullPaymentObject(selectedPayment); // <- thêm dòng này nếu muốn
        navigation.setParams({ selectedPaymentMethod: null });
      }
    }, [route])
  );

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

  const subtotal = listCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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


const handleCheckOut = async () => {
  try {
    const userData = await getUserData('userData');
    const paymentName = fullPaymentObject?.name;

    if (!paymentName) {
      Alert.alert('Thông báo', 'Phương thức thanh toán không hợp lệ');
      return;
    }

    // 🎯 Gửi đơn hàng lên server
    const payload = await buildBillPayload();
    const response = await axios.post(`${BASE_URL}/bills`, payload);
console.log('✅ Đặt hàng thành công:', response);
    if (response.status === 200 && response.data.data._id) {

        const billDetailsData = listCart.map((item) => ({
    product_id: item.product_id._id,     // ✅ Chỉ cần ID
    size: item.size || item.Size || '-', // fallback nếu field tên khác
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity,
  }));
  console.log('🧾 Chi tiết hóa đơn:', billDetailsData);
      const billId = response.data.data._id;
      
      console.log('✅ Đặt hàng thành công, mã đơn:', billId);

      // 📦 Gửi danh sách chi tiết sản phẩm vào bảng BillDetail
      await sendBillDetails(billId, billDetailsData); // 👈 GỌI Ở ĐÂY

      // 🧹 Xóa giỏ hàng
      await axios.delete(`${BASE_URL}/carts/user/${userData}`);

      // 🎯 Điều hướng theo phương thức thanh toán
      if (paymentName === 'VNPAY') {
        navigation.navigate('payment', { total });
      } else {
        Alert.alert('Thông báo', 'Đặt hàng thành công, nhân viên sẽ liên hệ để xác nhận đơn hàng.');
        navigation.navigate('TabNavigator');
      }
    } else {
      console.error('❌ Lỗi khi đặt hàng:', response.data);
      Alert.alert('Lỗi', response.data.message || 'Không thể tạo đơn hàng');
      
    }
  } catch (error) {
    console.error('❌ Lỗi khi đặt hàng:', error);
    Alert.alert('Lỗi', 'Không thể kết nối đến server, vui lòng thử lại sau.');
  }
};



const handlePlaceOrder = () => {
  if (!selectedPaymentMethod) {
    Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán');
    return;
  }

  logCheckoutData();
  console.log('🧾 Chi tiết phương thức thanh toán đã chọn:', fullPaymentObject.name);

  Alert.alert(
    'Xác nhận đặt hàng',
    `Tổng tiền: ${formatPrice(total)}\nPhương thức thanh toán: ${selectedPaymentName}`,
    [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đặt hàng', onPress: () => handleCheckOut() },
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
  {addresses.length > 0 ? (
    addresses.map((addr) => (
      <View key={addr._id} style={{ marginBottom: 12 }}>
        <Text style={styles.addressName}>{addr.user_id?.name}</Text>
        <Text style={styles.addressPhone}>{addr.user_id?.phone}</Text>
        <Text style={styles.addressText}>
          {`${addr.detail_address}, ${addr.ward}, ${addr.district}, ${addr.city}`}
        </Text>
      </View>
    ))
  ) : (
    <Text style={styles.paymentPlaceholder}>Không có địa chỉ nào</Text>
  )}
</View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bag-outline" size={20} color="#007AFF" />
            <Text style={styles.sectionTitle}>Sản phẩm ({listCart.length})</Text>
          </View>
          {listCart.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.title}</Text>
                <Text style={styles.productVariant}>{item.Size}</Text>
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
  borderBottomColor: '#eee',
  paddingHorizontal: 4,
  backgroundColor: '#fff',
  borderRadius: 12,
  marginBottom: 8,
},
productImage: {
  width: 70,
  height: 70,
  borderRadius: 10,
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
  borderColor: '#ddd',
  borderRadius: 10,
  padding: 12,
  fontSize: 14,
  minHeight: 80,
  textAlignVertical: 'top',
  backgroundColor: '#fff',
},
shippingOption: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},
selectedOption: {
  backgroundColor: '#fdf6f0', // nền dịu mắt
  borderRadius: 12,
  paddingHorizontal: 14,
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
  paddingVertical: 14,
  paddingHorizontal: 14,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 12,
  backgroundColor: '#fff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
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
  backgroundColor: '#5C4033',
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 12, // Bo tròn mềm mại hơn
  marginLeft: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3, // Android shadow
},
orderButtonText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#fff',
},
});

export default Checkout;