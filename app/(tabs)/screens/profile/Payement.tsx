// import { useNavigation } from 'expo-router';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { BASE_URL } from '../../services/api';
import checkoutService from '../../services/checkoutService';
import { registerForPushNotificationsAsync } from '../notification/PushTokenService';


const PaymentScreen = () => {
const route = useRoute();
const { total } = route.params;
const { sizeQuantityList } = route.params;
const { pendingOrder } = route.params;
const amount = total || 500000; // fallback nếu không có total

const bankCode = 'NCB';

const paymentUrl = `http://192.168.2.5:8888/order/create_payment_url?amount=${amount}`;
  const navigation = useNavigation();
  const hasHandled = useRef(false);
  const [loading, setLoading] = useState(true);
  const [pushToken,setPushToken]=useState('')
 


    useEffect(() => {
     
      fetchDatatoken();
    }, []);
  


  const fetchDatatoken = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setPushToken(token);
        console.log('🔐 Token:', token);
        // Gửi token này về server nếu cần
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy push token:', error);
    }
  };


const handleNavigation = async (event) => {
  const { url } = event;
  console.log('🔗 URL điều hướng:', url);

  if (url.includes('/order/vnpay_return') && !hasHandled.current) {
    hasHandled.current = true;

    if (url.includes('vnp_ResponseCode=00')) {
      try {

        for (const item of sizeQuantityList) {
  const payload = {
    sizeId: item.sizeId,
    quantityToDecrease: item.quantity,
  };

  try {
    const res = await axios.post(`${BASE_URL}/decrease-quantity`, payload);
    console.log("✔️ Giảm thành công:", res.data);
  } catch (err) {
    console.error("❌ Giảm thất bại:", err.response?.data || err.message);
  }
}
         await checkoutService.clearSelectedCartItems(pendingOrder.orderData.items.map(item => item.id));
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Đặt hàng thành công !",
            body: "Vui lòng chờ Admin xác nhận đơn hàng",
            data: { foo: "bar" },
            sound: "default",
          },
          trigger: null, // Gửi ngay lập tức
        });

        Alert.alert('✅ Thanh toán thành công!');
        navigation.navigate('TabNavigator', { screen: 'Home' });
      } catch (err) {
        console.error("❌ Lỗi khi gửi thông báo:", err);
        Alert.alert("Đã thanh toán, nhưng không gửi được thông báo.");
      }
    } else {
      await checkoutService.cancelPendingBill(pendingOrder.billId);
      navigation.navigate('TabNavigator', { screen: 'Home' });
      Alert.alert('❌ Thanh toán thất bại!');
    }
  }
};

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: '40%',
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#00BCD4" />
        </View>
      )}
      <WebView
        style={{ flex: 1 }}
        source={{ uri: paymentUrl }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onNavigationStateChange={handleNavigation}
        onLoadEnd={() => setLoading(false)}
        onError={({ nativeEvent }) => {
          console.error('❌ WebView Error:', nativeEvent);
          Alert.alert('Lỗi khi tải trang', nativeEvent.description);
        }}
        onHttpError={({ nativeEvent }) => {
          console.error('❌ HTTP Error:', nativeEvent.statusCode);
          Alert.alert('HTTP Error', `Trạng thái: ${nativeEvent.statusCode}`);
        }}
      />
    </SafeAreaView>
  );
};

export default PaymentScreen;
