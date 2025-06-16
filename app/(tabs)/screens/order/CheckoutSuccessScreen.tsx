// screens/CheckoutSuccessScreen.tsx
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useEffect } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useCart } from '../../../../hooks/useCart'

// — Thêm định nghĩa Params để route.params có kiểu rõ ràng —
type RootStackParamList = {
  Checkout: undefined;
  CheckoutCard: {
    fullName: string;
    email: string;
    address: string;
    phone: string;
    shippingMethod: 'fast' | 'cod';
    paymentMethod: 'visa' | 'atm';
    total: string;
  };
  CheckoutSuccess: {
    fullName: string;
    email: string;
    address: string;
    phone: string;
    shippingMethod: 'fast' | 'cod';
    paymentMethod: 'visa' | 'atm';
    total: string;
  };
  Home: undefined;
  TabNavigator: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'CheckoutSuccess'>;
export default function CheckoutSuccessScreen({ navigation, route }: Props) {
  const { cartItems } = useCart()
  const {
    fullName,
    email,
    address,
    phone,
    shippingMethod,
    paymentMethod,
    total,
  } = route.params

  useEffect(() => {
    ;(async () => {
      const selected = cartItems.filter(i => i.selected)
      if (!selected.length) return
      const first = selected[0]
      const newNotif = {
        id: Date.now().toString(),
        title: 'Đặt hàng thành công',
        description: first.name,
        product_count: selected.length,
        image_url: first.image,
        created_at: new Date().toISOString(),
        is_read: false,
      }
      const stored = await AsyncStorage.getItem('orderNotifications')
      const arr = stored ? JSON.parse(stored) : []
      arr.unshift(newNotif)
      await AsyncStorage.setItem('orderNotifications', JSON.stringify(arr))
    })()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace('Home')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>THÔNG BÁO</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.successMessage}>Bạn đã đặt hàng thành công</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoLine}>Thông tin khách hàng</Text>
          {[fullName, email, address, phone].map((t, i) => (
            <Text key={i} style={styles.infoValue}>{t}</Text>
          ))}
          <Text style={[styles.infoLine, { marginTop: 10 }]}>Vận chuyển</Text>
          <Text style={styles.infoValue}>
            {shippingMethod === 'fast'
              ? 'Giao nhanh - 15.000đ (2-3 ngày)'
              : 'COD - 20.000đ (3-5 ngày)'}
          </Text>
          <Text style={[styles.infoLine, { marginTop: 10 }]}>Thanh toán</Text>
          <Text style={styles.infoValue}>
            {paymentMethod === 'visa' ? 'Thẻ VISA/MC' : 'Thẻ ATM'}
          </Text>
          <Text style={[styles.infoLine, { marginTop: 10 }]}>Đã thanh toán</Text>
          <Text style={[styles.infoValue, { fontWeight: 'bold' }]}>{total}đ</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TabNavigator')}>
          <Text style={styles.buttonText}>Quay về Trang chủ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15, borderBottomWidth: 1, borderColor: '#eee',
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20, alignItems: 'center' },
  successMessage: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  infoBox: {
    width: '100%', backgroundColor: '#F9F9F9',
    borderRadius: 10, padding: 15, marginBottom: 20,
  },
  infoLine: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#333', marginLeft: 10 },
  button: {
    backgroundColor: '#4CAF50', borderRadius: 5,
    paddingVertical: 15, paddingHorizontal: 30,
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
})
