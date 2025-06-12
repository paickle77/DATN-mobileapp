// screens/CheckoutCardScreen.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

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
};

type Props = NativeStackScreenProps<RootStackParamList, 'CheckoutCard'>;

export default function CheckoutCardScreen({ navigation, route }: Props) {
  const {
    fullName,
    email,
    address,
    phone,
    shippingMethod,
    paymentMethod,
    total,
  } = route.params

  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName]     = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVC, setCardCVC]       = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [errors, setErrors] = useState({
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVC: '',
  })

  const validateCard = () => {
    const newErrors = { cardNumber: '', cardName: '', cardExpiry: '', cardCVC: '' }
    let isValid = true
    const onlyDigits = cardNumber.replace(/\s/g, '')
    if (!/^[0-9]{12,19}$/.test(onlyDigits)) {
      newErrors.cardNumber = 'Số thẻ không hợp lệ (12-19 chữ số)'
      isValid = false
    }
    if (!cardName.trim()) {
      newErrors.cardName = 'Vui lòng nhập tên in trên thẻ'
      isValid = false
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.trim())) {
      newErrors.cardExpiry = 'Định dạng mm/yy'
      isValid = false
    }
    if (!/^[0-9]{3,4}$/.test(cardCVC.trim())) {
      newErrors.cardCVC = 'CVC không hợp lệ (3-4 chữ số)'
      isValid = false
    }
    setErrors(newErrors)
    return isValid
  }

  const canContinue = () => {
    const onlyDigits = cardNumber.replace(/\s/g, '')
    return (
      onlyDigits.length >= 12 &&
      cardName.trim() !== '' &&
      cardExpiry.trim().length === 5 &&
      cardCVC.trim().length >= 3
    )
  }

  const handleContinue = () => {
    if (validateCard()) setShowConfirmModal(true)
  }

  const handleConfirmPayment = () => {
    setShowConfirmModal(false)
    navigation.replace('CheckoutSuccess', {
      fullName,
      email,
      address,
      phone,
      shippingMethod,
      paymentMethod,
      total,
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>THANH TOÁN</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Nhập thông tin thẻ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhập thông tin thẻ</Text>
          <TextInput
            style={[styles.input, errors.cardNumber && styles.inputError]}
            placeholder="XXXX XXXX XXXX XXXX"
            keyboardType="number-pad"
            value={cardNumber}
            onChangeText={setCardNumber}
          />
          {errors.cardNumber ? <Text style={styles.errorText}>{errors.cardNumber}</Text> : null}

          <TextInput
            style={[styles.input, errors.cardName && styles.inputError]}
            placeholder="TÊN IN TRÊN THẺ"
            value={cardName}
            onChangeText={setCardName}
          />
          {errors.cardName ? <Text style={styles.errorText}>{errors.cardName}</Text> : null}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }, errors.cardExpiry && styles.inputError]}
              placeholder="MM/YY"
              value={cardExpiry}
              onChangeText={setCardExpiry}
            />
            <TextInput
              style={[styles.input, { flex: 1 }, errors.cardCVC && styles.inputError]}
              placeholder="CVC"
              keyboardType="number-pad"
              secureTextEntry
              value={cardCVC}
              onChangeText={setCardCVC}
            />
          </View>
          {errors.cardExpiry ? <Text style={styles.errorText}>{errors.cardExpiry}</Text> : null}
          {errors.cardCVC    ? <Text style={styles.errorText}>{errors.cardCVC}</Text> : null}
        </View>

        {/* Tóm tắt */}
        <View style={styles.section}>
          <Text style={styles.summaryLine}>Thông tin khách hàng</Text>
          {[fullName, email, address, phone].map((txt, i) => (
            <Text key={i} style={styles.summaryValue}>{txt}</Text>
          ))}
          <Text style={[styles.summaryLine, { marginTop: 10 }]}>Phương thức vận chuyển</Text>
          <Text style={styles.summaryValue}>
            {shippingMethod === 'fast' ? 'Giao hàng Nhanh - 15.000đ' : 'Giao hàng COD - 20.000đ'}
          </Text>
          <Text style={[styles.summaryLine, { marginTop: 10 }]}>Hình thức thanh toán</Text>
          <Text style={styles.summaryValue}>
            {paymentMethod === 'visa' ? 'Thẻ VISA/MASTERCARD' : 'Thẻ ATM'}
          </Text>
        </View>

        {/* Tổng tiền */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text>Tạm tính</Text>
            <Text>{total}đ</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Phí vận chuyển</Text>
            <Text>{shippingMethod === 'fast' ? '15.000đ' : '20.000đ'}</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 5 }]}>
            <Text style={{ fontWeight: 'bold' }}>Tổng cộng</Text>
            <Text style={{ fontWeight: 'bold' }}>{total}đ</Text>
          </View>
        </View>

        {/* Tiếp tục */}
        <TouchableOpacity
          style={[styles.continueButton, canContinue() && styles.continueButtonEnabled]}
          disabled={!canContinue()}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>TIẾP TỤC</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Xác nhận thanh toán?</Text>
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
                <Text style={styles.confirmButtonText}>Đồng ý</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.cancelButtonText}>Huỷ bỏ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  section: { paddingHorizontal: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: {
    height: 44, borderWidth: 1, borderColor: '#ccc',
    borderRadius: 5, paddingHorizontal: 10, marginBottom: 10,
  },
  inputError: { borderColor: 'red' },
  errorText: { fontSize: 12, color: 'red', marginBottom: 5 },
  summaryLine: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  summaryValue: { fontSize: 14, color: '#333' },
  summaryContainer: { paddingHorizontal: 15, marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  continueButton: {
    backgroundColor: '#999', borderRadius: 5,
    paddingVertical: 15, marginHorizontal: 15,
    marginBottom: 30, alignItems: 'center',
  },
  continueButtonEnabled: { backgroundColor: '#4CAF50' },
  continueButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContainer: {
    width: '80%', backgroundColor: '#fff',
    borderRadius: 10, padding: 20, alignItems: 'center',
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  confirmButton: {
    backgroundColor: '#4CAF50', borderRadius: 5,
    paddingHorizontal: 20, paddingVertical: 10, marginRight: 10,
  },
  confirmButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  cancelButton: {
    backgroundColor: '#ccc', borderRadius: 5,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  cancelButtonText: { fontSize: 14, fontWeight: 'bold' },
})
