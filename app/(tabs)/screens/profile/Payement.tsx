// import { useNavigation } from 'expo-router';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, View } from 'react-native';
import { WebView } from 'react-native-webview';

const PaymentScreen = () => {
const route = useRoute();
const { total } = route.params;


const amount = total || 500000; // fallback nếu không có total

const bankCode = 'NCB';

const paymentUrl = `http://192.168.0.106:8888/order/create_payment_url?amount=${amount}`;
  const navigation = useNavigation();
  const hasHandled = useRef(false);
  const [loading, setLoading] = useState(true);

  const handleNavigation = (event) => {
    const { url } = event;
    console.log('🔗 URL điều hướng:', url);

    if (url.includes('/order/vnpay_return') && !hasHandled.current) {
      hasHandled.current = true;

      if (url.includes('vnp_ResponseCode=00')) {
        Alert.alert('✅ Thanh toán thành công!');
       navigation.navigate('TabNavigator', { screen: 'Home' })// Điều hướng
      } else {
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
