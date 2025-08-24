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
  phone: string | number; // ✅ Hỗ trợ cả string và number
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
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [voucher_User, setVoucher_User] = useState('');
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedPaymentName, setSelectedPaymentName] = useState('');
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [listCart, setListCart] = useState<CartItem[]>([]);
  const [fullPaymentObject, setFullPaymentObject] = useState<any>(null);
  const [voucher, setVoucher] = useState<any>();
  const [percent, setPercent] = useState<number>(0);
  const [nameCode, setNameCode] = useState('');
  const [notification, setNotification] = useState<{ visible: boolean; message: string; type: 'info' | 'error' | 'warning' | 'success' }>({ visible: false, message: '', type: 'info' });
  // const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [shippingError, setShippingError] = useState(false);
  const [paymentError, setPaymentError] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [sizeID, setSizeID] = useState([]);
  const [sizeQuantityList, setSizeQuantityList] = useState<{ sizeId: string; quantity: number }[]>([]);

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
  // ✅ originalTotal = tiền hàng gốc (chưa tính phí ship)
  const originalTotal = subtotal;
  // ✅ discount tính dựa trên originalTotal
  const discountAmount = percent > 0 ? (originalTotal * percent) / 100 : 0;
  // ✅ finalTotal = hàng + phí ship - giảm giá
  const finalTotal = originalTotal + shippingFee - discountAmount;

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
          console.log("Voucher_id :", useVoucher)
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

  // Load selected address - XỬ LÝ KHI QUAY LẠI TỪ ADDRESSLIST
  useFocusEffect(
    useCallback(() => {
      const loadAddressOnFocus = async () => {
        try {
          // 1. Ưu tiên địa chỉ từ route params (khi navigate trực tiếp)
          const selectedFromRoute = route.params?.selectedAddress;
          if (selectedFromRoute && selectedFromRoute._id) {
            console.log('📍 Sử dụng địa chỉ từ route params:', selectedFromRoute);
            setAddresses([selectedFromRoute as CheckoutAddress]);
            saveUserData({ key: 'selectedAddressId', value: selectedFromRoute._id });
            navigation.setParams({ selectedAddress: null });
            return;
          }

          // 2. Khi quay lại từ AddressList, load địa chỉ đã chọn
          const savedAddressId = await getUserData('selectedAddressId');
          console.log('📍 Checking savedAddressId:', savedAddressId, 'Current addresses:', addresses.length);
          
          if (savedAddressId) {
            // ✅ FIX: Luôn kiểm tra và load lại địa chỉ đã chọn từ storage
            if (addresses.length === 0 || addresses[0]._id !== savedAddressId) {
              console.log('📍 Địa chỉ cần được load/cập nhật:', savedAddressId);
              const allAddresses: CheckoutAddress[] = await checkoutService.fetchAllAddresses();
              const savedAddress = allAddresses.find(addr => addr._id === savedAddressId);
              
              if (savedAddress) {
                console.log('📍 Load địa chỉ đã chọn:', savedAddress._id, savedAddress.name);
                setAddresses([savedAddress]);
                return;
              } else {
                console.log('📍 Địa chỉ đã lưu không còn tồn tại, xóa khỏi storage');
                await removeUserDataByKey('selectedAddressId');
              }
            } else {
              console.log('📍 Địa chỉ hiện tại đã đúng với savedAddressId');
              return;
            }
          }

          // 3. Nếu chưa có địa chỉ nào, load địa chỉ mặc định (lần đầu vào)
          if (addresses.length === 0) {
            console.log('📍 Lần đầu vào, load địa chỉ mặc định');
            const defaultAddress = await checkoutService.fetchDefaultAddress();
            setAddresses([defaultAddress]);
            // ✅ Lưu địa chỉ mặc định vào storage để AddressList có thể hiển thị đúng
            await saveUserData({ key: 'selectedAddressId', value: defaultAddress._id });
            console.log('📍 Đã lưu địa chỉ mặc định vào storage:', defaultAddress._id);
          }
          
        } catch (err) {
          console.error('❌ Lỗi lấy địa chỉ:', err);
          // Chỉ hiển thị error nếu chưa có địa chỉ nào
          if (addresses.length === 0) {
            setNotification({
              visible: true,
              message: 'Không thể lấy địa chỉ giao hàng. Vui lòng chọn thủ công.',
              type: 'error',
            });
          }
        }
      };

      loadAddressOnFocus();
    }, [route.params?.selectedAddress]) // ✅ FIX: Chỉ depend vào route params, không depend vào addresses.length
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
      const extractedData = cartItems.map((item: any) => ({
        sizeId: item.Size_id?._id,
        quantity: item.quantity,
      }));

      setSizeQuantityList(extractedData);

      console.log("📦 Size & Quantity list:", extractedData);
      // cartItems.forEach((item, index) => {
      //   console.log(`🛍️ Size_id of item ${index}:`, item.Size_id);
      //   console.log(`🛍️ Size_id of item :`, cartItems);
      //   setSizeID(item.Size_id);
      // });
    } catch (error) {
      console.error('Lỗi lấy giỏ hàng:', error);
      setNotification({
        visible: true,
        message: 'Không thể tải giỏ hàng',
        type: 'error'
      });
    }
  };

  // Load initial data (chỉ load khi chưa có địa chỉ nào)
  useFocusEffect(
    useCallback(() => {
      const fetchInitialData = async () => {
        // Chỉ fetch dữ liệu cart và voucher, không touch vào địa chỉ
        if (selectedItemIds.length > 0) {
          fetchCartData();
        }
        fetchVoucherData();
      };

      fetchInitialData();
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
          console.log("Voucher_id :", voucherDetails)
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
          saveUserData({ key: 'discount_percent', value: '0' });
        }
      },
    });
  };

  const handleShippingSelect = (methodId: string) => {
    setSelectedShippingMethod(methodId);
    setShippingError(false);
  };

  // Xử lý thanh toán online - Flow mới: KHÔNG tạo đơn hàng trước
  const handleOnlinePayment = async () => {
    try {
      const { paymentService } = require('../../services/paymentService');

      // Lấy thông tin user hiện tại
      const currentUser = await getUserData('userAccount');
      const selectedShipping = shippingMethods.find(m => m.id === selectedShippingMethod);
      const selectedShippingName = selectedShipping?.name || '';
      const shippingFee = selectedShipping?.price || 0;
      
      // Chuẩn bị dữ liệu đơn hàng (chưa gửi lên server)
      const billData = {
        Account_id: currentUser?.id || currentUser?._id || '',
        address_id: addresses[0]?._id || '',
        shipping_method: selectedShippingName,
        payment_method: selectedPaymentName,
        original_total: originalTotal,
        total: finalTotal,
        discount_amount: discountAmount,
        voucher_code: selectedVoucher?.voucher_id?.code || '',
        note: note || '',
        shipping_fee: shippingFee,
        address_snapshot: addresses[0] || {},
        items: listCart.map((item: any) => ({
          product_id: item.product_id._id || item.product_id,
          size: item.Size || 'M',
          quantity: item.quantity,
          unit_price: item.price,
        })),
      };

      // Tạo link thanh toán VNPay (KHÔNG tạo đơn hàng)
      if (selectedPaymentName.toLowerCase().includes('vnpay')) {
        console.log('💳 Creating VNPay payment URL only...');
        const { paymentUrl } = await paymentService.createVNPayPayment(billData);

        // Chuyển đến WebView với dữ liệu để tạo đơn SAU KHI thanh toán thành công
        navigation.navigate('VNPayWebView', {
          paymentUrl,
          billData, // Dữ liệu để tạo đơn hàng sau khi thanh toán thành công
          sizeQuantityList,
        });
      } else {
        setNotification({
          visible: true,
          message: 'Phương thức thanh toán này đang được phát triển',
          type: 'warning'
        });
      }
    } catch (error: any) {
      console.error('❌ Error creating online payment:', error);
      setNotification({
        visible: true,
        message: error.message || 'Không thể tạo link thanh toán',
        type: 'error'
      });
    }
  };

  // Handle place order - phân biệt COD và Online Payment
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

      if (selectedVoucher) {
        console.log('Voucher đã chọn, voucher_user_id:', selectedVoucher._id);
        console.log('Voucher gốc id:', selectedVoucher.voucher_id?._id);
        setVoucher_User(selectedVoucher._id);
      } else {
        console.log('Chưa chọn voucher');
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
      const shippingFee = selectedShipping?.price || 0;

      // Kiểm tra phương thức thanh toán
      const requiresOnlinePayment = selectedPaymentName.toLowerCase().includes('vnpay') ||
        selectedPaymentName.toLowerCase().includes('momo') ||
        selectedPaymentName.toLowerCase().includes('zalopay');

      if (requiresOnlinePayment) {
        // ✅ Flow mới: Thanh toán online KHÔNG tạo đơn hàng trước
        console.log('💳 Online payment - không tạo đơn hàng trước');
        await handleOnlinePayment();
      } else {
        // ✅ COD: Tạo đơn hàng ngay
        console.log('💵 COD payment - tạo đơn hàng ngay');
        
        const pendingOrder = await checkoutService.createPendingBill(
          addresses,
          listCart,
          note,
          selectedShippingName,
          selectedPaymentName,
          originalTotal,
          finalTotal,
          discountAmount,
          nameCode,
          shippingFee,
        );

        console.log('✅ COD order created:', pendingOrder.billId);
        navigation.navigate('ConfirmationScreen', {
          pendingOrder,
          selectedItemIds,
          sizeQuantityList,
          voucher_User: selectedVoucher?._id || '',
        });
      }

    } catch (error: any) {
      console.error('❌ Lỗi đặt hàng:', error);
      setNotification({
        visible: true,
        message: error?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.',
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