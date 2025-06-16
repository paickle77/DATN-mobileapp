// app/(tabs)/screens/Checkout.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Giả sử bạn đã có 2 context trong dự án:
//  - AuthContext export hook useAuth()
//  - CartContext export hook useCart()
import { router } from 'expo-router';
import { useAuth } from '../../../../hooks/useAuth';
import { useCart } from '../../../../hooks/useCart';

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const { user, isLoading: authLoading } = useAuth()
  const { cartItems, getSelectedTotal } = useCart()

  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [address, setAddress]     = useState('')
  const [phone, setPhone]         = useState('')

  const [loading, setLoading]     = useState(true)
  const [errors, setErrors]       = useState({ address: '', phone: '' })

  const [shippingMethod, setShippingMethod] = useState<'fast'|'cod'>('fast')
  const [paymentMethod, setPaymentMethod]   = useState<'visa'|'atm'>('visa')

  // Load user info
  useEffect(() => {
    if (user) {
      setFullName(user.name || '')
      setEmail(user.email || '')
      user.phone && setPhone(user.phone)
      setLoading(false)
    }
  }, [user, authLoading])

  const tempPrice   = getSelectedTotal()
  const shippingFee = shippingMethod === 'fast' ? 15000 : 20000
  const total       = tempPrice + shippingFee

  const validateForm = () => {
    const e = { address: '', phone: '' }
    let ok = true
    if (!address.trim()) { e.address = 'Vui lòng nhập địa chỉ'; ok = false }
    if (!phone.trim())   { e.phone   = 'Vui lòng nhập số điện thoại'; ok = false }
    setErrors(e)
    return ok
  }

  const isFormComplete = () =>
    fullName.trim() !== '' &&
    email.trim()    !== '' &&
    address.trim()  !== '' &&
    phone.trim()    !== ''

  const handleContinue = () => {
    if (!validateForm()) return;
    (navigation as any).navigate('CheckoutCard', {
      fullName,
      email,
      address,
      phone,
      shippingMethod,
      paymentMethod,
      total: total.toString(),
    });
  };

  if (loading || authLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6B4F35" />
        <Text>Đang tải thông tin...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>THANH TOÁN</Text>
        <View style={{ width:24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Thông tin khách hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <View style={styles.readOnlyContainer}>
            <Text style={styles.readOnlyLabel}>Họ và tên</Text>
            <Text style={styles.readOnlyValue}>{fullName}</Text>
          </View>
          <View style={styles.readOnlyContainer}>
            <Text style={styles.readOnlyLabel}>Email</Text>
            <Text style={styles.readOnlyValue}>{email}</Text>
          </View>
          <TextInput
            style={styles.underlineInput}
            placeholder="Địa chỉ"
            value={address}
            onChangeText={setAddress}
          />
          {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
          <TextInput
            style={styles.underlineInput}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
        </View>

        {/* Sản phẩm đã chọn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đã chọn</Text>
          {cartItems.filter(i => i.selected).map(item => (
            <View key={item.id} style={styles.cartItemSummary}>
              <Text style={styles.cartItemName}>{item.name} x{item.quantity}</Text>
              <Text style={styles.cartItemPrice}>{item.price.toLocaleString('vi-VN')}đ</Text>
            </View>
          ))}
        </View>

        {/* Vận chuyển */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
          <TouchableOpacity style={styles.radioRow} onPress={()=>setShippingMethod('fast')}>
            <View style={styles.radioTextContainer}>
              <Text>Giao nhanh – 15.000đ</Text>
              <Text style={styles.radioSubText}>2-3 ngày</Text>
            </View>
            {shippingMethod==='fast' && <Ionicons name="checkmark" size={20} color="#6B4F35"/>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.radioRow} onPress={()=>setShippingMethod('cod')}>
            <View style={styles.radioTextContainer}>
              <Text>COD – 20.000đ</Text>
              <Text style={styles.radioSubText}>3-5 ngày</Text>
            </View>
            {shippingMethod==='cod' && <Ionicons name="checkmark" size={20} color="#6B4F35"/>}
          </TouchableOpacity>
        </View>

        {/* Hình thức thanh toán */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hình thức thanh toán</Text>
          <TouchableOpacity style={styles.radioRow} onPress={()=>setPaymentMethod('visa')}>
            <Text>Thẻ VISA/MC</Text>
            {paymentMethod==='visa' && <Ionicons name="checkmark" size={20} color="#6B4F35"/>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.radioRow} onPress={()=>setPaymentMethod('atm')}>
            <Text>Thẻ ATM</Text>
            {paymentMethod==='atm' && <Ionicons name="checkmark" size={20} color="#6B4F35"/>}
          </TouchableOpacity>
        </View>

        {/* Tóm tắt giá */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text>Tạm tính</Text>
            <Text>{tempPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Phí vận chuyển</Text>
            <Text>{shippingFee.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={{ fontWeight:'bold' }}>Tổng cộng</Text>
            <Text style={{ fontWeight:'bold' }}>{total.toLocaleString('vi-VN')}đ</Text>
          </View>
        </View>

        {/* Nút TIẾP TỤC */}
        <TouchableOpacity
        
          style={[
            styles.continueButton,
            { backgroundColor: isFormComplete() ? '#6B4F35' : '#ccc' }
          ]}
          disabled={!isFormComplete()}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>TIẾP TỤC</Text>
          
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#fff' },
  loadingContainer: { justifyContent:'center', alignItems:'center' },
  header: {
    flexDirection:'row', alignItems:'center',
    justifyContent:'space-between',
    padding:16, borderBottomWidth:1, borderColor:'#eee'
  },
  backButton: { padding:4 },
  headerTitle: { fontSize:18, fontWeight:'bold' },

  section: {
    paddingHorizontal:16,
    paddingVertical:12,
    borderBottomWidth:1,
    borderColor:'#eee',
  },
  sectionTitle: { fontSize:16, fontWeight:'600', marginBottom:12 },

  readOnlyContainer: { marginBottom:12 },
  readOnlyLabel: { fontSize:12, color:'#666' },
  readOnlyValue: {
    fontSize:16, paddingBottom:4,
    borderBottomWidth:1, borderColor:'#ddd'
  },

  underlineInput: {
    borderBottomWidth:1,
    borderColor:'#ccc',
    height:44,
    marginBottom:8,
  },
  errorText: { color:'red', fontSize:12, marginBottom:8 },

  cartItemSummary: {
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom:8,
  },
  cartItemName: { flex:1 },
  cartItemPrice: { fontWeight:'600', color:'#6B4F35' },

  radioRow: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginBottom:8,
  },
  radioTextContainer: { flex:1, marginRight:8 },
  radioSubText: { fontSize:12, color:'#666' },

  summaryContainer: {
    paddingHorizontal:16,
    marginTop:12,
    marginBottom:12,
  },
  summaryRow: {
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom:4,
  },

  continueButton: {
    marginHorizontal:16,
    paddingVertical:14,
    borderRadius:6,
    alignItems:'center',
  },
  continueButtonText: {
    color:'#fff', fontSize:16, fontWeight:'600'
  },
})
