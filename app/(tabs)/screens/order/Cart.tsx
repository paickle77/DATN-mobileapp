import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CartItem from '../../component/CartItem'; // Component con
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

const initialItems = [
  {
    id: '1',
    title: 'Brown Jacket',
    Size: 20,
    price: 83.97,
    image: 'https://cdn.tgdd.vn/Files/2020/04/28/1252456/cach-lam-banh-bong-lan-cupcake-dai-loan-bong-mem--5-760x367.jpg',
    quantity: 1,
  },
  {
    id: '2',
    title: 'Black Hat',
    Size: 25,
    price: 19.99,
    image: 'https://daynghebanh.vn/wp-content/uploads/2016/01/B%C3%B4ng-lan-cu%E1%BB%91n-1030x687.jpg',
    quantity: 2,
  },
];

type RootStackParamList = {
  Checkout: undefined;
  
};

export default function CartScreen() {
 
  const [items, setItems] = useState(initialItems);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToRemoveIndex, setItemToRemoveIndex] = useState<string | null>(null);
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   const [itemToRemove, setItemToRemove] = useState(null);
  const [list,setList]=useState([]);

  useEffect(()=>{
FetchData();
  },[]);

const FetchData = async () => {
  const user = await getUserData('userData');
  const userId = user
  console.log("userID:", userId);

  try {
    const response = await axios.get(`${BASE_URL}/GetAllCarts`);
    const listCart = response.data.data;

    const formattedData = listCart.map((item) => ({
      id: item._id,
      title: item.product_id.name,
      user_id: item.user_id,
      Size: item.size_id.size,
      price: item.product_id.price,
      image: item.product_id.image_url,
      quantity: item.quantity,
    }));

    // 🔍 Lọc ra những item có user_id khớp với user hiện tại
    const userCartItems = formattedData.filter(item => item.user_id === userId);

    setList(userCartItems); // 👉 chỉ render dữ liệu thuộc user này
    console.log("Dữ liệu giỏ hàng theo user:", userCartItems);
  } catch (error) {
    console.log("Lỗi API:", error);
  }
};




  // Cập nhật số lượng
const updateQuantity = async (item: any, newQuantity: number) => {
  if (newQuantity < 1) return;

  try {
    const payload = {
      quantity: newQuantity,
      product_id: item.product_id,
      size_id: item.size_id,
      user_id: item.user_id,
    };

    const res = await axios.put(`${BASE_URL}/carts/${item.id}`, payload);
    console.log("✅ Đã cập nhật số lượng:", res.data);

    await FetchData(); // làm mới danh sách
  } catch (error) {
    console.log("❌ Lỗi khi cập nhật số lượng:", error);
  }
};


  // Xoá sản phẩm
  const removeItem = async (id: string) => {
    console.log("id được xóa :",id)
 try {
      const data = await axios.delete(`${BASE_URL}/carts/${id}`);
      console.log("xóa thành công với id: ",id)
     
      await FetchData();
    } catch (error) {
      console.log("Lỗi API ",error)
    }
  };

  // Tổng tiền
const total = list.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total2 = total + 35;

  return (
    <View style={styles.container}>
      {/* Header với nút Back */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={styles.headerSpacer} />
      </View>


      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item, index }) => (
         <CartItem
  name={item.title}
  price={item.price}
  image={item.image}
  Size={item.Size}
  quantily={item.quantity}
  Uptoquantily={(newQ) => updateQuantity(item, newQ)}
  Dowtoquantily={(newQ) => updateQuantity(item, newQ)}
  onRemove={() => {
    setItemToRemoveIndex(item.id);
    setShowConfirm(true);
  }}
/>

        )}
      />

      {showConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận xóa sản phẩm này khỏi giỏ hàng?</Text>
            <Text style={styles.modalSubtitle}>Thao tác này sẽ không thể khôi phục.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirm(false)}>
                <Text style={styles.cancelText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  if (itemToRemoveIndex !== null) {
                    removeItem(itemToRemoveIndex);
                  }
                  setShowConfirm(false);
                }}>
                <Text style={styles.deleteText}>Đồng ý , Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Footer tổng tiền */}
      <View style={styles.footer}>
        {/* Nhập mã giảm giá */}
        <View style={styles.discountContainer}>
          <TextInput
            style={styles.discountInput}
            placeholder="Nhập mã giảm giá"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>

        {/* Chi tiết thanh toán */}
        <View style={styles.paymentInfoRow}>
          <Text style={styles.paymentLabel}>Tổng phụ</Text>
          <Text style={styles.paymentValue}>{total.toFixed(2)}</Text>
        </View>
        <View style={styles.paymentInfoRow}>
          <Text style={styles.paymentLabel}>Phí giao hàng</Text>
          <Text style={styles.paymentValue}>35.000 vnd</Text>
        </View>
        <View style={styles.paymentInfoRow}>
          <Text style={styles.paymentLabel}>Giảm giá</Text>
          <Text style={[styles.paymentValue, { color: '#000', fontWeight: 'bold' }]}>-135.000 vnd</Text>
        </View>

        {/* Tổng chi phí */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng chi phí</Text>
          <Text style={styles.totalPrice}>{total2.toFixed(2)}</Text>
        </View>

  <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => navigation.navigate('Checkout')}
      >
        <Text style={styles.checkoutText}>Tiến hành thanh toán</Text>
      </TouchableOpacity>
</View>


      {/* <TabLayout /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10, 
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40, // Để cân bằng với nút back
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },

  modalSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 24,
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#5C4033',
    paddingVertical: 10,
    marginLeft: 8,
    borderRadius: 24,
    alignItems: 'center',
  },

  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  discountContainer: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 16,
  },

  discountInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: '#000',
  },

  applyButton: {
    backgroundColor: '#5C4033',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  paymentLabel: {
    fontSize: 14,
    color: '#000',
  },

  paymentValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },

  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C4033',
  },

  checkoutButton: {
    backgroundColor: '#5C4033',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
});