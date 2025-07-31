import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CartItem from '../../component/CartItem'; // Component con
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

type RootStackParamList = {
  Checkout: undefined;
  TabNavigator: undefined;
  Home: undefined;
};

interface CartItemType {
  id: string;
  title: string;
  user_id: string;
  Size: string | number;
  price: number;
  image: string;
  quantity: number;
  discount_price?: number; // Thêm giá khuyến mãi nếu có
}

export default function CartScreen() {

  const [items, setItems] = useState<CartItemType[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToRemoveIndex, setItemToRemoveIndex] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [itemToRemove, setItemToRemove] = useState(null);
  const [list, setList] = useState<CartItemType[]>([]);



  useFocusEffect(
    useCallback(() => {
      FetchData();
    }, [])
  );

  const FetchData = async () => {
    const user = await getUserData('userData');
    const userId = user;
    console.log("userID:", userId);

    try {
      const [cartRes, sizeRes] = await Promise.all([
        axios.get(`${BASE_URL}/GetAllCarts`),
        axios.get(`${BASE_URL}/sizes`)
      ]);

      const listCart = cartRes.data.data;
      const sizeList = sizeRes.data.data;

      const formattedData = listCart.map((item: any) => {
        const sizeInfo = sizeList.find((s: any) =>
          item.size_id &&
          (s._id === item.size_id._id ||
            (s.size === item.size_id.size && s.product_id === item.product_id._id))
          item.size_id &&
          (s._id === item.size_id._id ||
            (s.size === item.size_id.size && s.product_id === item.product_id._id))
        );

        const priceIncrease = sizeInfo?.price_increase || 0;
        const basePrice = item.product_id.discount_price || item.product_id.price;
        const finalPrice = basePrice + priceIncrease;
        const finalPrice = basePrice + priceIncrease;

        return {
          id: item._id,
          title: item.product_id.name,
          user_id: item.user_id,
          Size: item.size_id?.size,
          price: finalPrice,
          image: item.product_id.image_url,
          quantity: item.quantity,
        };
      });




      const userCartItems = formattedData.filter((item: any) => item.user_id === userId);
      setList(userCartItems);
      console.log("✅ Dữ liệu giỏ hàng theo user:", userCartItems);

    } catch (error) {
      console.log("❌ Lỗi API:", error);
    }
  };

  // Format currency VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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
    console.log("id được xóa :", id)
    try {
      const data = await axios.delete(`${BASE_URL}/carts/${id}`);
      console.log("xóa thành công với id: ", id)

      await FetchData();
    } catch (error) {
      console.log("Lỗi API ", error)
    }
  };

  // Tổng tiền
  const subtotal = list.reduce((sum, item) => sum + (item.discount_price || item.price) * item.quantity, 0);
  const total = subtotal;

  return (
    <View style={styles.container}>

      {/* Header với nút Back */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('TabNavigator', { screen: 'Home' })}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: 280, // Tăng padding để không bị che bởi footer
          paddingTop: 8,
          paddingHorizontal: 4,
        }}
        renderItem={({ item, index }) => (
          <CartItem
            name={item.title}
            price={formatCurrency(item.discount_price || item.price)} // Đã định dạng kiểu "50.000 ₫"
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
        showsVerticalScrollIndicator={false}
      />

      {list.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={100} color="#ddd" />
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>Hãy thêm sản phẩm để bắt đầu mua sắm</Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => navigation.navigate('TabNavigator', { screen: 'Home' })}
          >
            <Text style={styles.shopNowText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      )}

      {showConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="warning-outline" size={48} color="#ff6b6b" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Xác nhận xóa sản phẩm</Text>
            <Text style={styles.modalSubtitle}>Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirm(false)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  if (itemToRemoveIndex !== null) {
                    removeItem(itemToRemoveIndex);
                  }
                  setShowConfirm(false);
                }}>
                <Text style={styles.deleteText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Footer tổng tiền */}
      {list.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.summaryCard}>
            {/* Chi tiết thanh toán */}
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Chi tiết thanh toán</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tạm tính ({list.length} sản phẩm)</Text>
              <Text style={styles.paymentValue}>{formatCurrency(subtotal)}</Text>
            </View>

            <View style={styles.divider} />

            {/* Tổng chi phí */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalPrice}>{formatCurrency(total)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={styles.checkoutText}>Thanh toán</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  shopNowButton: {
    backgroundColor: '#5C4033',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  shopNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    borderBottomColor: '#f0f0f0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  headerSpacer: {
    width: 40,
  },

  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  modalIcon: {
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },

  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingTop: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  summaryCard: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  summaryHeader: {
    marginBottom: 16,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },

  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },

  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5C4033',
  },

  checkoutButton: {
    backgroundColor: '#5C4033',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});