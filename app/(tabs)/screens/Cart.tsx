import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CartItem from '../component/CartItem'; // Component con
import TabLayout from '../component/tabbar';

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

export default function CartScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState(initialItems);
  const [showConfirm, setShowConfirm] = useState(false);
const [itemToRemoveIndex, setItemToRemoveIndex] = useState(null);

  // Cập nhật số lượng
  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItems = [...items];
    updatedItems[index].quantity = newQuantity;
    setItems(updatedItems);
  };

  // Xoá sản phẩm
  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  // Tổng tiền
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total2 = total+35;
  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item, index }) => (
          <CartItem
            name={item.title}
            price={item.price}
            image={item.image}
            Size={item.Size}
            quantily={item.quantity}
            Uptoquantily={(newQ) => updateQuantity(index, newQ)}
            Dowtoquantily={(newQ) => updateQuantity(index, newQ)}
          onRemove={() => {
  setItemToRemoveIndex(index);
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
            removeItem(itemToRemoveIndex);
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
modalOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Lớp mờ nền
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 100,                            // Ưu tiên hiển thị trên cùng
  // elevation: 10,                          // Android hỗ trợ bóng/đè lớp

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
    // paddingBottom: 100, // Đẩy lên 1 chút để không che TabBar
    borderTopWidth: 1,
    borderColor: '#eee',
  },


});
