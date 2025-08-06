import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CartItem from '../../component/CartItem';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

type RootStackParamList = {
  Checkout: { selectedItems: string[] };
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
  discount_price?: number;
  product_id?: any;
  selected?: boolean; // Thêm trạng thái lựa chọn
}

export default function CartScreen() {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToRemoveIndex, setItemToRemoveIndex] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [list, setList] = useState<CartItemType[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useFocusEffect(
    useCallback(() => {
      FetchData();
    }, [])
  );

  const FetchData = async () => {
    const user = await getUserData('accountId');
    const accountId = user;
    console.log("userID:", accountId);

    try {
      const [cartRes, sizeRes] = await Promise.all([
        axios.get(`${BASE_URL}/GetAllCarts`),
        axios.get(`${BASE_URL}/sizes`)
      ]);

      const listCart = cartRes.data.data;
      const sizeList = sizeRes.data.data;

      const formattedData = listCart
        .filter((item: any) => item.product_id)
        .map((item: any) => {
          const sizeInfo = sizeList.find((s: any) =>
            item.size_id &&
            (s._id === item.size_id._id ||
              (s.size === item.size_id.size && s.product_id === item.product_id._id))
          );

          const priceIncrease = sizeInfo?.price_increase || 0;
          const basePrice = item.product_id.discount_price || item.product_id.price;
          const finalPrice = basePrice + priceIncrease;

          return {
            id: item._id,
            title: item.product_id.name,
            Account_id: item.Account_id,
            Size: item.size_id?.size,
            price: finalPrice,
            image: item.product_id.image_url,
            quantity: item.quantity,
            product_id: item.product_id,
            selected: false, // Mặc định không được chọn
          };
        });

      const userCartItems = formattedData.filter((item: any) => item.Account_id === accountId);
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
        Account_id: item.Account_id,
      };

      const res = await axios.put(`${BASE_URL}/carts/${item.id}`, payload);
      console.log("✅ Đã cập nhật số lượng:", res.data);

      await FetchData();
    } catch (error) {
      console.log("❌ Lỗi khi cập nhật số lượng:", error);
    }
  };

  // Xoá sản phẩm
  const removeItem = async (id: string) => {
    console.log("id được xóa :", id);
    try {
      const data = await axios.delete(`${BASE_URL}/carts/${id}`);
      console.log("xóa thành công với id: ", id);
      await FetchData();
    } catch (error) {
      console.log("Lỗi API ", error);
    }
  };

  // Chọn/bỏ chọn sản phẩm
  const toggleSelectItem = (itemId: string) => {
    setList(prevList => 
      prevList.map(item => 
        item.id === itemId 
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  // Chọn/bỏ chọn tất cả
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setList(prevList => 
      prevList.map(item => ({
        ...item,
        selected: newSelectAll
      }))
    );
  };

  // Xóa các sản phẩm đã chọn
  const removeSelectedItems = () => {
    const selectedItems = list.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một sản phẩm để xóa");
      return;
    }

    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa ${selectedItems.length} sản phẩm đã chọn?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              // Xóa từng sản phẩm đã chọn
              await Promise.all(
                selectedItems.map(item => 
                  axios.delete(`${BASE_URL}/carts/${item.id}`)
                )
              );
              await FetchData();
              setSelectAll(false);
            } catch (error) {
              console.error("❌ Lỗi khi xóa các sản phẩm:", error);
            }
          }
        }
      ]
    );
  };

  // Tính toán giá trị
  const selectedItems = list.filter(item => item.selected);
  const selectedCount = selectedItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.discount_price || item.price) * item.quantity, 0);

  // Đi tới trang checkout với chỉ các sản phẩm đã chọn
  const goToCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    const selectedItemIds = selectedItems.map(item => item.id);
    navigation.navigate('Checkout', { selectedItems: selectedItemIds });
  };

  return (
    <View style={styles.container}>
      {/* Header với nút Back */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('TabNavigator', { screen: 'Home' } as never)}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng ({list.length})</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TabNavigator', { screen: 'Home' } as never)}>
          <Ionicons name="home-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {list.length > 0 && (
        <>
          {/* Selection Controls */}
          <View style={styles.selectionControls}>
            <TouchableOpacity 
              style={styles.selectAllButton}
              onPress={toggleSelectAll}
            >
              <View style={[styles.checkbox, selectAll && styles.checkboxSelected]}>
                {selectAll && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.selectAllText}>
                Chọn tất cả 
              </Text>
            </TouchableOpacity>
            
            {selectedCount > 0 && (
              <TouchableOpacity 
                style={styles.deleteSelectedButton}
                onPress={removeSelectedItems}
              >
                <Ionicons name="trash-outline" size={16} color="#ff4757" />
                <Text style={styles.deleteSelectedText}>Xóa đã chọn</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: list.length > 0 ? 200 : 100,
          paddingTop: 8,
          paddingHorizontal: 4,
        }}
        renderItem={({ item }) => (
          <View style={styles.cartItemContainer}>
            <TouchableOpacity 
              style={styles.itemCheckbox}
              onPress={() => toggleSelectItem(item.id)}
            >
              <View style={[styles.checkbox, item.selected && styles.checkboxSelected]}>
                {item.selected && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
            </TouchableOpacity>
            
            <View style={styles.itemContent}>
              <CartItem
                name={item.title}
                price={formatCurrency(item.discount_price || item.price)}
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
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {list.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={120} color="#ddd" />
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>Khám phá hàng ngàn sản phẩm tuyệt vời</Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => navigation.navigate('TabNavigator', { screen: 'Home' } as never)}
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
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  if (itemToRemoveIndex !== null) {
                    removeItem(itemToRemoveIndex);
                  }
                  setShowConfirm(false);
                }}
              >
                <Text style={styles.deleteText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Footer với thanh toán cho sản phẩm đã chọn */}
      {list.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>
                Tạm tính ({selectedCount} sản phẩm)
              </Text>
              <Text style={styles.totalPrice}>{formatCurrency(subtotal)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.checkoutButton, 
              selectedCount === 0 && styles.checkoutButtonDisabled
            ]}
            onPress={goToCheckout}
            disabled={selectedCount === 0}
          >
            <Text style={styles.checkoutText}>
              {selectedCount === 0 ? 'Chọn sản phẩm' : `Mua hàng (${selectedCount})`}
            </Text>
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
    backgroundColor: '#f5f7fa',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },

  shopNowButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  shopNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  backButton: {
    padding: 8,
    borderRadius: 20,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },

  selectionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },

  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxSelected: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },

  selectAllText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },

  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#fff5f5',
  },

  deleteSelectedText: {
    fontSize: 14,
    color: '#ff4757',
    marginLeft: 4,
  },

  voucherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
  },

  voucherText: {
    flex: 1,
    fontSize: 13,
    color: '#2c3e50',
    marginLeft: 8,
  },

  voucherAmount: {
    color: '#e74c3c',
    fontWeight: '600',
  },

  voucherLink: {
    fontSize: 13,
    color: '#e74c3c',
    fontWeight: '600',
  },

  shippingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fff4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2ed573',
  },

  shippingText: {
    fontSize: 13,
    color: '#27ae60',
    marginLeft: 8,
    fontWeight: '500',
  },

  cartItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  itemCheckbox: {
    padding: 16,
  },

  itemContent: {
    flex: 1,
  },

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

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },

  summaryCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryTitle: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },

  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e74c3c',
  },

  checkoutButton: {
    backgroundColor: '#9b7858ff',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  checkoutButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },

  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});