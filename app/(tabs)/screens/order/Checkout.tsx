import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import NotificationComponent from '../../component/NotificationComponent';
import checkoutService, { CartItem } from '../../services/checkoutService';
import type { Address as ImportedAddress } from '../profile/AddressList';
import { getUserData, removeUserDataByKey, saveUserData } from '../utils/storage';

// Import shipping zones
import { getDistrictType, getShippingMethods } from '../../../../constants/shipping-zones';

// Import các component đã tách
import AddressSection from '../../component/CheckOutComponent/AddressSection';
import CheckoutBottomBar from '../../component/CheckOutComponent/CheckoutBottomBar';
import CheckoutHeader from '../../component/CheckOutComponent/CheckoutHeader';
import NoteSection from '../../component/CheckOutComponent/NoteSection';
import OrderSummarySection from '../../component/CheckOutComponent/OrderSummarySection';
import PaymentSection from '../../component/CheckOutComponent/PaymentSection';
import ProductListSection from '../../component/CheckOutComponent/ProductListSection';
import ShippingSection from '../../component/CheckOutComponent/ShippingSection';
import VoucherSection from '../../component/CheckOutComponent/VoucherSection';

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
  selectedItems?: string[];
}

const Checkout = ({
  navigation,
  route,
}: {
  navigation: any;
  route: { params?: CheckoutRouteParams };
}) => {
  // State declarations
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
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Tính toán district type và shipping methods dựa trên địa chỉ đã chọn
  const districtType = useMemo(() => {
    if (addresses.length > 0 && addresses[0].district) {
      return getDistrictType(addresses[0].district);
    }
    return 'unknown';
  }, [addresses]);

  const shippingMethods = useMemo(() => {
    return getShippingMethods(districtType);
  }, [districtType]);

  // Reset selected shipping method khi district type thay đổi
  useEffect(() => {
    if (selectedShippingMethod) {
      const isValidMethod = shippingMethods.some(method => method.id === selectedShippingMethod);
      if (!isValidMethod) {
        setSelectedShippingMethod(null);
        setShippingError(false);
      }
    }
  }, [shippingMethods, selectedShippingMethod]);

  // Calculations
  const subtotal = listCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = shippingMethods.find(method => method.id === selectedShippingMethod)?.price || 0;
  const originalTotal = subtotal + shippingFee;
  const discountAmount = percent > 0 ? (originalTotal * percent) / 100 : 0;
  const finalTotal = originalTotal - discountAmount;

  // Utility functions
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Load selected items from route params
  useEffect(() => {
    const items = route.params?.selectedItems || [];
    setSelectedItemIds(items);
    console.log('🛒 Selected items from cart:', items);
  }, [route.params?.selectedItems]);

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
            await removeUserDataByKey('selectedVoucher');
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

          setPercent(cleanPercent);
        } else {
          console.log("📛 Không có voucher nào được lưu cho cá nhân.");
        }
      } catch (error) {
        console.error('❌ Lỗi load voucher:', error);
      }
    };

    loadVoucher();
  }, []);

  // Load selected address
  useFocusEffect(
    useCallback(() => {
      const selected = route.params?.selectedAddress;
      console.log('📍 Địa chỉ đã chọn từ route:', selected);

      if (selected && selected._id) {
        setAddresses([selected]);
        saveUserData({ key: 'selectedAddress', value: selected });
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

  // Fetch cart data - chỉ lấy các sản phẩm đã chọn
  const fetchCartData = async () => {
    try {
      const cartItems = await checkoutService.fetchCartData(selectedItemIds);
      setListCart(cartItems);
      console.log('🛍️ Cart items for checkout:', cartItems);
    } catch (error) {
      console.error('Lỗi lấy giỏ hàng:', error);
      setNotification({
        visible: true,
        message: 'Không thể tải giỏ hàng',
        type: 'error'
      });
    }
  };

  // Load initial data
  useFocusEffect(
    useCallback(() => {
      const fetchInitialAddress = async () => {
        try {
          const selected = await getUserData('selectedAddress');
          console.log('📍 Địa chỉ đã chọn:', selected);

          if (selected) {
            const latestAddresses: CheckoutAddress[] = await checkoutService.fetchAllAddresses(); // 👈 bạn cần viết thêm API này trong service
            const found = latestAddresses.find(addr => addr._id === selected._id);

            if (found) {
              setAddresses([found]);
            } else {
              await removeUserDataByKey('selectedAddress');
              const defaultAddress = await checkoutService.fetchDefaultAddress();
              setAddresses([defaultAddress]);
            }
          } else {
            const defaultAddress = await checkoutService.fetchDefaultAddress();
            setAddresses([defaultAddress]);
          }
        } catch (err) {
          console.error('❌ Lỗi lấy địa chỉ mặc định:', err);
          setNotification({
            visible: true,
            message: 'Không thể lấy địa chỉ giao hàng. Vui lòng chọn thủ công.',
            type: 'error',
          });
        }
      };

      fetchInitialAddress();
      if (selectedItemIds.length > 0) {
        fetchCartData();
      }
      fetchVoucherData();
    }, [selectedItemIds])
  );

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

  // Event handlers
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
      orderValue: subtotal,
      onSelectVoucher: (voucher: any) => {
        if (voucher) {
          setSelectedVoucher(voucher);
          setNameCode(voucher?.voucher_id?.code || '');
          setPercent(voucher?.voucher_id?.discount_percent || 0);
          saveUserData({ key: 'discount_percent', value: voucher?.voucher_id?.discount_percent || 0 });
        } else {
          setSelectedVoucher(null);
          setNameCode('');
          setPercent(0);
          saveUserData({ key: 'discount_percent', value: 0 });
        }
      },
    });
  };

  const handleShippingSelect = (methodId: string) => {
    setSelectedShippingMethod(methodId);
    setShippingError(false);
  };

  // Handle place order - tạo pending bill với sản phẩm đã chọn
  const handlePlaceOrder = async () => {
    try {
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
          message: 'Không có sản phẩm nào được chọn',
          type: 'error'
        });
        return;
      }

      setLoading(true);
      const selectedShipping = shippingMethods.find(m => m.id === selectedShippingMethod);
      const selectedShippingName = selectedShipping?.name || '';

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

      navigation.navigate('ConfirmationScreen', {
        pendingOrder,
        selectedItemIds
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

  return (
    <SafeAreaView style={styles.container}>
      <CheckoutHeader onBackPress={() => navigation.navigate("CartScreen")} />

      <ScrollView style={styles.scrollView}>
        <AddressSection
          addresses={addresses}
          onPress={handleAddressPress}
        />

        <ProductListSection
          listCart={listCart}
          onBackToCart={() => navigation.navigate('CartScreen')}
          formatPrice={formatPrice}
        />

        <NoteSection
          note={note}
          onNoteChange={setNote}
        />

        <ShippingSection
          shippingMethods={shippingMethods}
          selectedShippingMethod={selectedShippingMethod}
          onSelectShipping={handleShippingSelect}
          formatPrice={formatPrice}
          districtType={districtType}
          districtName={addresses.length > 0 ? addresses[0].district : undefined}
        />

        <VoucherSection
          nameCode={nameCode}
          percent={percent}
          onPress={handleVoucherMethodPress}
        />

        <PaymentSection
          selectedPaymentMethod={selectedPaymentMethod}
          selectedPaymentName={selectedPaymentName}
          onPress={handlePaymentMethodPress}
        />

        <OrderSummarySection
          subtotal={subtotal}
          shippingFee={shippingFee}
          discountAmount={discountAmount}
          finalTotal={finalTotal}
          formatPrice={formatPrice}
        />
      </ScrollView>

      <CheckoutBottomBar
        finalTotal={finalTotal}
        loading={loading}
        onPlaceOrder={handlePlaceOrder}
        formatPrice={formatPrice}
      />

      {notification.visible && (
        <View style={styles.notificationContainer}>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  notificationContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
});

export default Checkout;