import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import CartItem from '../(tabs)/component/CartItem'; // Component con
import TabLayout from './component/tabbar';

const initialItems = [
  {
    id: '1',
    title: 'Brown Jacket',
    size: 'XL',
    price: 83.97,
    image: 'https://cdn.tgdd.vn/Files/2020/04/28/1252456/cach-lam-banh-bong-lan-cupcake-dai-loan-bong-mem--5-760x367.jpg',
    quantity: 1,
  },
  {
    id: '2',
    title: 'Black Hat',
    size: 'M',
    price: 19.99,
    image: 'https://daynghebanh.vn/wp-content/uploads/2016/01/B%C3%B4ng-lan-cu%E1%BB%91n-1030x687.jpg',
    quantity: 2,
  },
];

export default function CartScreen() {
  const [items, setItems] = useState(initialItems);

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
            quantily={item.quantity}
            Uptoquantily={(newQ) => updateQuantity(index, newQ)}
            Dowtoquantily={(newQ) => updateQuantity(index, newQ)}
            onRemove={() => removeItem(index)}
          />
        )}
      />

      {/* Footer tổng tiền */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalPrice}>${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>

      <TabLayout />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
    footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 100, // Đẩy lên 1 chút để không che TabBar
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
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
});
