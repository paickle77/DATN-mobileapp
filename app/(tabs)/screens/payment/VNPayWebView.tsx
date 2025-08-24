import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, StyleSheet, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import checkoutService from '../../services/checkoutService';
import { paymentService } from '../../services/paymentService';
import { getUserData } from '../utils/storage';

const VNPayWebView: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(false);
  const hasHandledResult = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const params = route.params as any;
  const { paymentUrl, billData, sizeQuantityList } = params;

  // Auto timeout sau 10 phút nếu không có phản hồi
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (!hasHandledResult.current) {
        console.log('⏰ Payment timeout');
        Alert.alert(
          'Timeout', 
          'Thanh toán quá lâu không có phản hồi. Vui lòng kiểm tra lại.',
          [{ text: 'OK', onPress: () => (navigation as any).navigate('TabNavigator', { screen: 'Home' }) }]
        );
      }
    }, 10 * 60 * 1000); // 10 phút

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Xử lý back button - về HomeScreen
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Thoát thanh toán?',
        'Bạn có chắc muốn thoát? Giao dịch sẽ bị hủy.',
        [
          { text: 'Không', style: 'cancel' },
          { 
            text: 'Có', 
            onPress: () => {
              // Clear timeout và về HomeScreen
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              (navigation as any).navigate('TabNavigator', { screen: 'Home' });
            }
          },
        ]
      );
      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    return () => backHandler.remove();
  }, [navigation]);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleSuccessfulPayment = async (urlParams: URLSearchParams) => {
    // Clear timeout khi có kết quả
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      setLoading(true);
      console.log('✅ Processing successful payment...');
      
      // 📊 LOG DETAILED VNPAY RESPONSE
      console.log('🔍 VNPay URL Params:', Object.fromEntries(urlParams.entries()));
      console.log('🔍 Bill Data to send:', JSON.stringify(billData, null, 2));
      
      const transactionData = {
        vnpay_transaction_id: urlParams.get('vnp_TransactionNo'),
        payment_method: 'vnpay',
        amount: urlParams.get('vnp_Amount'),
        bank_code: urlParams.get('vnp_BankCode'),
        transaction_time: new Date(),
        response_code: urlParams.get('vnp_ResponseCode'),
        transaction_status: urlParams.get('vnp_TransactionStatus'),
        secure_hash: urlParams.get('vnp_SecureHash')
      };
      
      console.log('🔍 Transaction Data to send:', JSON.stringify(transactionData, null, 2));

      // 1. Tạo đơn hàng SAU KHI thanh toán thành công
      console.log('🔄 Creating bill after successful payment...');
      
      // Lấy thông tin user hiện tại từ storage (giống như Checkout.tsx)
      const currentUser = await getUserData('userAccount');
      const accountId = await getUserData('accountId');
      
      // Đảm bảo có Account_id
      const finalBillData = {
        ...billData,
        Account_id: billData.Account_id || currentUser?.id || currentUser?._id || accountId
      };
      
      console.log('🔍 Final Bill Data with Account_id:', JSON.stringify(finalBillData, null, 2));
      console.log('🔍 Current User from storage:', currentUser);
      console.log('🔍 Account ID from storage:', accountId);
      
      if (!finalBillData.Account_id) {
        throw new Error('Không thể xác định Account_id. Vui lòng đăng nhập lại.');
      }
      
      const { billId } = await paymentService.createBillAfterPayment(finalBillData, transactionData);

      // 2. Giảm quantity cho các sản phẩm và xóa khỏi giỏ hàng
      if (sizeQuantityList && Array.isArray(sizeQuantityList)) {
        for (const item of sizeQuantityList) {
          try {
            console.log('📦 Decreasing quantity for:', item);
            await checkoutService.decreaseProductQuantity(item.sizeId, item.quantity);
          } catch (error) {
            console.error('❌ Error decreasing quantity:', error);
          }
        }
      }

      // 3. Xóa sản phẩm khỏi giỏ hàng sau khi thanh toán thành công
      try {
        console.log('🧹 Clearing cart after successful payment...');
        await checkoutService.clearCart();
      } catch (error) {
        console.error('❌ Error clearing cart:', error);
        // Không block flow chính nếu clear cart thất bại
      }

      console.log('🎉 Order created successfully:', billId);
      
      // 4. Hiển thị alert với tùy chọn xem đơn hàng hoặc về Home
      setTimeout(() => {
        Alert.alert(
          'Thanh toán thành công! 🎉', 
          `Đơn hàng ${billId} đã được tạo thành công. Bạn muốn làm gì tiếp theo?`,
          [
            { 
              text: 'Xem đơn hàng', 
              onPress: () => {
                try {
                  (navigation as any).navigate('TabNavigator', { screen: 'OrderHistoryScreen' }, { highlightBillId: billId });
                } catch (navError) {
                  console.error('❌ Navigation error to OrderHistoryScreen:', navError);
                  (navigation as any).navigate('TabNavigator', { screen: 'Home' });
                }
              }
            },
            { 
              text: 'Về trang chủ', 
              onPress: () => (navigation as any).navigate('TabNavigator', { screen: 'Home' }),
              style: 'cancel'
            }
          ],
          { cancelable: false } // Bắt buộc user chọn một trong hai
        );
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error processing successful payment:', error);
      Alert.alert(
        'Lỗi xử lý thanh toán', 
        'Thanh toán thành công nhưng có lỗi khi tạo đơn hàng. Vui lòng liên hệ hỗ trợ.',
        [{ text: 'OK', onPress: () => (navigation as any).navigate('TabNavigator', { screen: 'Home' }) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFailedPayment = () => {
    // Clear timeout khi có kết quả
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    console.log('❌ Payment failed - returning to checkout');
    
    setTimeout(() => {
      Alert.alert(
        'Thanh toán thất bại', 
        'Sản phẩm vẫn còn trong giỏ hàng của bạn. Bạn có thể thử thanh toán lại.',
        [
          { 
            text: 'Thử lại', 
            onPress: () => {
              try {
                navigation.goBack();
              } catch (error) {
                (navigation as any).navigate('TabNavigator', { screen: 'CartScreen' });
              }
            }
          },
          { 
            text: 'Về giỏ hàng', 
            onPress: () => (navigation as any).navigate('TabNavigator', { screen: 'CartScreen' })
          },
          { 
            text: 'Về trang chủ', 
            onPress: () => (navigation as any).navigate('TabNavigator', { screen: 'Home' }),
            style: 'cancel'
          }
        ]
      );
    }, 500);
  };

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    if (hasHandledResult.current) return;

    const { url } = navState;
    console.log('🔗 Navigation URL:', url);

    // Kiểm tra URL return từ VNPay (nhiều pattern khác nhau)
    if (url.includes('payment-result') || 
        url.includes('vnpay_return') || 
        url.includes('myapp://') ||
        url.includes('vnp_ResponseCode')) {
      
      hasHandledResult.current = true;
      
      // Clear timeout ngay khi có kết quả
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      try {
        let urlObj: URL;
        let urlParams: URLSearchParams;

        // Xử lý các loại URL khác nhau
        if (url.includes('myapp://')) {
          urlObj = new URL(url);
          urlParams = urlObj.searchParams;
        } else {
          // Nếu không phải deep link, parse từ URL thường
          urlObj = new URL(url);
          urlParams = urlObj.searchParams;
        }
        
        const responseCode = urlParams.get('vnp_ResponseCode');
        const transactionStatus = urlParams.get('vnp_TransactionStatus');
        
        console.log('📊 Payment result:', { 
          responseCode, 
          transactionStatus,
          fullUrl: url 
        });

        // VNPay success codes
        if (responseCode === '00' && transactionStatus === '00') {
          await handleSuccessfulPayment(urlParams);
        } else {
          console.log('❌ Payment failed with codes:', { responseCode, transactionStatus });
          handleFailedPayment();
        }
      } catch (error) {
        console.error('❌ Error parsing payment result:', error);
        console.log('🔍 Raw URL for debugging:', url);
        
        // Fallback: check if URL contains success indicators
        if (url.includes('vnp_ResponseCode=00') && url.includes('vnp_TransactionStatus=00')) {
          console.log('✅ Fallback success detection');
          // Extract basic info for successful payment
          const mockParams = new URLSearchParams();
          const match = url.match(/vnp_TransactionNo=([^&]*)/);
          if (match) mockParams.set('vnp_TransactionNo', match[1]);
          
          await handleSuccessfulPayment(mockParams);
        } else {
          console.log('❌ Fallback failure detection');
          handleFailedPayment();
        }
      }
    }

    // Xử lý URL cancel hoặc error từ VNPay
    if (url.includes('cancel') || 
        url.includes('error') || 
        url.includes('vnp_ResponseCode=24') ||
        url.includes('vnp_ResponseCode=11')) {
      
      hasHandledResult.current = true;
      
      // Clear timeout khi hủy thanh toán
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      console.log('❌ Payment cancelled or error');
      handleFailedPayment();
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="compatibility"
      />
      
      {loading && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VNPayWebView;
