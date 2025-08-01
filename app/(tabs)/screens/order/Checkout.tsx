import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import NotificationComponent from '../../component/NotificationComponent';
import checkoutService, { CartItem } from '../../services/checkoutService';
import type { Address as ImportedAddress } from '../profile/AddressList';
import { clearUserData, getUserData, saveUserData } from '../utils/storage';

export interface CheckoutAddress {
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
  name: string;
  phone: string;
}

interface CheckoutRouteParams {
  selectedPaymentMethod?: any;
  selectedVoucher?: any;
  selectedAddress?: ImportedAddress;
}

const Checkout = ({
  navigation,
  route,
}: {
  navigation: any;
  route: { params?: CheckoutRouteParams };
}) => {
  const [note, setNote] = useState('');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedPaymentName, setSelectedPaymentName] = useState('');
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [listCart, setListCart] = useState<CartItem[]>([]);
  const [fullPaymentObject, setFullPaymentObject] = useState<any>(null);
  const [voucher, setVoucher] = useState();
  const [percent, setPercent] = useState<number>(0);
  const [nameCode, setNameCode] = useState('');
  const [notification, setNotification] = useState({ visible: false, message: '', type: 'info' });
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [shippingError, setShippingError] = useState(false);
  const [paymentError, setPaymentError] = useState(false);

  const totalPrice = listCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Load voucher effect
  useEffect(() => {
    const loadVoucher = async () => {
      try {
        const voucher = await getUserData('selectedVoucher');
        let useVoucher = null;

        if (voucher) {
          const now = new Date();
          const end = new Date(voucher.voucher_id?.end_date);

          if (now < end) {
            useVoucher = voucher;
          } else {
            await clearUserData('selectedVoucher');
          }
        }

        if (!useVoucher) {
          const { vouchers } = await checkoutService.fetchVouchers();
          const now = new Date();
          const validVouchers = vouchers.filter(v =>
            new Date(v.voucher_id?.end_date) > now
          );

          if (validVouchers.length > 0) {
            const latest = validVouchers[0];
            useVoucher = latest;
            await saveUserData({ key: 'selectedVoucher', value: latest });
          }
        }
        if (useVoucher) {
          setSelectedVoucher(useVoucher);
          setNameCode(useVoucher?.voucher_id?.code || '');

          const rawPercent = useVoucher?.voucher_id?.discount_percent || 0;
          const cleanPercent =
            typeof rawPercent === 'string'
              ? parseFloat(rawPercent.replace('%', '').trim())
              : rawPercent;

          setPercent(cleanPercent); // ✅ Đã xử lý kiểu dữ liệu chắc chắn
        }
      } catch (error) {
        console.error('Lỗi load voucher:', error);
      }
    };

    loadVoucher();
  }, []);

  // Load selected address
  useFocusEffect(
    useCallback(() => {
      const selected = route.params?.selectedAddress;

      if (selected && selected._id) {
        setAddresses([selected]);
        saveUserData({ key: 'selectedAddress', value: selected }); // ✅ Chỉ lưu khi có _id
        navigation.setParams({ selectedAddress: null });
      }
    }, [route.params?.selectedAddress])
  );


  useFocusEffect(
    useCallback(() => {
      const loadSelectedAddress = async () => {
        try {
          const address = await getUserData('selectedAddress');
          if (address) {
            setAddresses([address]);
          }
        } catch (err) {
          console.error('❌ Lỗi lấy địa chỉ đã chọn:', err);
        }
      };

      loadSelectedAddress();
    }, [])
  );

  // Fetch voucher data
  const fetchVoucherData = async () => {
    try {
      const { vouchers } = await checkoutService.fetchVouchers();
      setVoucher(vouchers);
    } catch (error) {
      console.error('Lỗi lấy voucher:', error);
      setNotification({
        visible: true,
        message: 'Không thể tải voucher',
        type: 'error'
      });
    }
  };

  // Fetch cart data
  const fetchCartData = async () => {
    try {
      const cartItems = await checkoutService.fetchCartData();
      setListCart(cartItems);
    } catch (error) {
      console.error('Lỗi lấy giỏ hàng:', error);
      setNotification({
        visible: true,
        message: 'Không thể tải giỏ hàng',
        type: 'error'
      });
    }
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const addressList = await checkoutService.fetchAddresses();
      setAddresses(addressList);
    } catch (error) {
      console.error('Lỗi lấy địa chỉ:', error);
      setNotification({
        visible: true,
        message: 'Không thể tải địa chỉ. Vui lòng thử lại sau.',
        type: 'error'
      });
    }
  };

  // Load initial data
  useFocusEffect(
    useCallback(() => {
      const fetchInitialAddress = async () => {
        const selected = await getUserData('selectedAddress');

        if (selected) {
          setAddresses([selected]);
        } else {
          const addressList = await checkoutService.fetchAddresses();
          if (Array.isArray(addressList) && addressList.length > 0) {
            const defaultAddress = addressList.find(a => a.isDefault === true || a.isDefault === 'true') || addressList[0];
            setAddresses([defaultAddress]);
            await saveUserData({ key: 'selectedAddress', value: defaultAddress }); // ✅ lưu lại để AddressList biết
          }
        }
      };

      fetchInitialAddress();
      fetchCartData();
      fetchVoucherData();
    }, [])
  );

  // Load discount percent
  useEffect(() => {
    const loadDiscountPercent = async () => {
      try {
        const discountPercent = await checkoutService.getDiscountPercent();
        setPercent(discountPercent);
      } catch (error) {
        console.error('Lỗi lấy discount percent:', error);
      }
    };
    loadDiscountPercent();
  }, []);

  // Handle payment method selection
  useFocusEffect(
    useCallback(() => {
      const selectedPayment = route.params?.selectedPaymentMethod;

      if (selectedPayment) {
        setSelectedPaymentMethod(selectedPayment.id);
        setSelectedPaymentName(selectedPayment.name);
        setFullPaymentObject(selectedPayment);

        saveUserData({
          key: 'selectedPaymentMethod',
          value: selectedPayment
        });

        navigation.setParams({ selectedPaymentMethod: null });
      }
    }, [route])
  );

  useEffect(() => {
    const loadStoredPaymentMethod = async () => {
      try {
        const stored = await getUserData('selectedPaymentMethod');
        if (stored) {
          setSelectedPaymentMethod(stored.id);
          setSelectedPaymentName(stored.name);
          setFullPaymentObject(stored);
        }
      } catch (error) {
        console.error('❌ Lỗi khi load selectedPaymentMethod:', error);
      }
    };

    loadStoredPaymentMethod();
  }, []);

  // Handle voucher selection
  useFocusEffect(
    useCallback(() => {
      const selectedVoucherFromRoute = route.params?.selectedVoucher;

      if (selectedVoucherFromRoute) {
        const voucherDetails = selectedVoucherFromRoute.voucher_id;

        if (voucherDetails && typeof voucherDetails === 'object') {
          setSelectedVoucher(selectedVoucherFromRoute);
          setNameCode(voucherDetails.code || '');
          setPercent(voucherDetails.discount_percent || 0);
        }
      } else if (selectedVoucherFromRoute === null) {
        setSelectedVoucher(null);
        setNameCode('');
        setPercent(0);
      }

      if (route.params?.selectedVoucher !== undefined) {
        navigation.setParams({ selectedVoucher: undefined });
      }
    }, [route.params?.selectedVoucher])
  );

  const shippingMethods = [
    {
      id: 'store_pickup',
      name: 'Nhận tại cửa hàng',
      time: 'Ngay khi sẵn sàng',
      price: 0,
      description: 'Miễn phí - Bánh được giữ tươi trong tủ lạnh',
      icon: 'storefront-outline'
    },
    {
      id: 'same_day',
      name: 'Giao trong ngày',
      time: 'Trong vòng 2-4 giờ',
      price: 25000,
      description: 'Dành cho bánh tươi - Bán kính 10km',
      icon: 'bicycle-outline'
    },
    {
      id: 'next_day',
      name: 'Giao ngày mai',
      time: 'Trước 12h ngày hôm sau',
      price: 35000,
      description: 'Đóng gói cẩn thận - Giữ độ tươi ngon',
      icon: 'car-outline'
    },
    {
      id: 'scheduled',
      name: 'Giao theo lịch hẹn',
      time: 'Chọn ngày giờ cụ thể',
      price: 45000,
      description: 'Phù hợp cho tiệc sinh nhật, sự kiện',
      icon: 'calendar-outline'
    }
  ];

  const subtotal = listCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = shippingMethods.find(method => method.id === selectedShippingMethod)?.price || 0;
  const originalTotal = subtotal + shippingFee;
  const discountAmount = percent > 0 ? (originalTotal * percent) / 100 : 0;
  const finalTotal = originalTotal - discountAmount;

  const formatPrice = (price: any) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  const handleAddressPress = () => {
    navigation.navigate('AddressList', {
      mode: 'select',
    });
  };

  const handlePaymentMethodPress = () => {
    navigation.navigate('PaymentMethods', {
      selectedPaymentMethod: fullPaymentObject,
      onSelectPayment: (payment: any) => {
        setSelectedPaymentMethod(payment.id);
        setSelectedPaymentName(payment.name);
        setFullPaymentObject(payment);
      }
    });
  };

  const handleVoucherMethodPress = () => {
    navigation.navigate('VoucherCardList', {
      selectedVoucherId: selectedVoucher?._id || null,
      orderValue: totalPrice,
      onSelectVoucher: (voucher: any) => {
        if (voucher) {
          setSelectedVoucher(voucher);
          setNameCode(voucher?.voucher_id?.code || '');
          setPercent(voucher?.voucher_id?.discount_percent || 0);
        } else {
          setSelectedVoucher(null);
          setNameCode('');
          setPercent(0);
        }
      },
    });
  };

  // NEW: Handle place order - tạo pending bill
  const handlePlaceOrder = async () => {
    try {
      // Validate required fields

      if (!selectedShippingMethod) {
        setShippingError(true);
        setNotification({
          visible: true,
          message: 'Vui lòng chọn phương thức vận chuyển',
          type: 'error',
        });
        return;
      }

      if (!selectedPaymentMethod) {
        setPaymentError(true);
        setNotification({
          visible: true,
          message: 'Vui lòng chọn phương thức thanh toán',
          type: 'error',
        });
        return;
      }

      if (addresses.length === 0) {
        setNotification({
          visible: true,
          message: 'Vui lòng chọn địa chỉ giao hàng',
          type: 'error'
        });
        return;
      }

      if (listCart.length === 0) {
        setNotification({
          visible: true,
          message: 'Giỏ hàng trống',
          type: 'error'
        });
        return;
      }

      setLoading(true);
      const selectedShipping = shippingMethods.find(m => m.id === selectedShippingMethod);
      const selectedShippingName = selectedShipping?.name || '';

      // Tạo pending bill
      const pendingOrder = await checkoutService.createPendingBill(
        addresses,
        listCart,
        note,
        selectedShippingName,
        selectedPaymentName,
        originalTotal,
        finalTotal,
        discountAmount,
        nameCode
      );

      console.log('✅ Tạo pending bill thành công:', pendingOrder.billId);

      // Chuyển sang màn hình xác nhận thanh toán
      navigation.navigate('ConfirmationScreen', {
        pendingOrder
      });

    } catch (error) {
      console.error('❌ Lỗi tạo đơn hàng:', error);
      setNotification({
        visible: true,
        message: error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = () => {
    if (!selectedPaymentMethod) return null;

    if (selectedPaymentMethod === 'cod') return 'cash-outline';
    if (selectedPaymentMethod.includes('momo')) return 'wallet-outline';
    if (selectedPaymentMethod.includes('zalopay')) return 'wallet-outline';
    if (selectedPaymentMethod.includes('vnpay')) return 'wallet-outline';
    if (selectedPaymentMethod.includes('card')) return 'card-outline';

    return 'wallet-outline';
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
                    <Text style={styles.addressName}>{addr.name}</Text>
                    <Text style={styles.addressPhone}>{addr.phone}</Text>
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
              onPress={() => {
                setSelectedShippingMethod(method.id);
                setShippingError(false); // reset lỗi nếu chọn lại
              }}
            >
              <View style={styles.shippingLeft}>
                <Ionicons name={method.icon} size={24} color="#5C4033" style={{ marginRight: 8 }} />
                <View style={styles.shippingInfo}>
                  <Text style={styles.shippingName}>{method.name}</Text>
                  <Text style={styles.shippingTime}>{method.time}</Text>
                  <Text style={styles.shippingDesc}>{method.description}</Text>
                </View>
              </View>
              <View style={styles.shippingRight}>
                <Text style={styles.shippingPrice}>
                  {method.price === 0 ? 'Miễn phí' : formatPrice(method.price)}
                </Text>
                <View style={styles.radioButton}>
                  {selectedShippingMethod === method.id && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Voucher */}
        <View style={styles.voucherContainer}>
          <Text style={styles.voucherLabel}> Mã giảm giá</Text>

          <TouchableOpacity style={styles.voucherBox} onPress={handleVoucherMethodPress}>
            <View style={styles.voucherContent}>
              {nameCode ? (
                <>
                  <Ionicons
                    name="pricetag"
                    size={20}
                    color="#5C4033"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.voucherText}>{nameCode}</Text>
                </>
              ) : (
                <Text style={styles.voucherPlaceholder}>Chọn mã giảm giá</Text>
              )}
            </View>

            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
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
            <Text style={styles.summaryLabel}>Giá trị đơn hàng</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>{formatPrice(shippingFee)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá</Text>
            <Text style={[styles.summaryValue, { color: '#34C759' }]}>
              -{formatPrice(discountAmount)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(finalTotal)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Tổng: {formatPrice(finalTotal)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderButton, loading && styles.orderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.orderButtonText}>Đang xử lý...</Text>
          ) : (
            <Text style={styles.orderButtonText}>Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>

      {notification.visible && (
        <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center', zIndex: 999 }}>
          <NotificationComponent
            key={notification.message + notification.type}
            message={notification.message}
            type={notification.type}
            visible={notification.visible}
            onHide={() => setNotification(prev => ({ ...prev, visible: false }))}
            style={{ width: '90%' }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  voucherContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  voucherLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  voucherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  voucherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  voucherText: {
    fontSize: 14,
    color: '#5C4033',
    fontWeight: '500',
  },
  voucherPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
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
    backgroundColor: '#fdf6f0',
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
    borderRadius: 12,
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  shippingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shippingDesc: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  orderButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
});

export default Checkout;