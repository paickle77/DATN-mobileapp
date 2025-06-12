import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type AddPaymentModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedType: 'momo' | 'zalopay' | 'vnpay' | 'card';
  setSelectedType: (type: 'momo' | 'zalopay' | 'vnpay' | 'card') => void;
  accountNumber: string;
  setAccountNumber: (val: string) => void;
  cardNumber: string;
  setCardNumber: (val: string) => void;
  expiryDate: string;
  setExpiryDate: (val: string) => void;
  cardholderName: string;
  setCardholderName: (val: string) => void;
  handleAddPayment: () => void;
};

// Dummy implementations for getPaymentIcon and getPaymentName
const getPaymentIcon = (type: 'momo' | 'zalopay' | 'vnpay' | 'card') => {
  switch (type) {
    case 'momo':
      return <AntDesign name="mobile1" size={24} color="#a50064" />;
    case 'zalopay':
      return <AntDesign name="creditcard" size={24} color="#008fe5" />;
    case 'vnpay':
      return <AntDesign name="creditcard" size={24} color="#d81b60" />;
    case 'card':
      return <AntDesign name="idcard" size={24} color="#333" />;
    default:
      return null;
  }
};

const getPaymentName = (type: 'momo' | 'zalopay' | 'vnpay' | 'card') => {
  switch (type) {
    case 'momo':
      return 'Momo';
    case 'zalopay':
      return 'ZaloPay';
    case 'vnpay':
      return 'VNPay';
    case 'card':
      return 'Thẻ ngân hàng';
    default:
      return '';
  }
};

const AddPaymentModal: React.FC<AddPaymentModalProps> = React.memo(({
  visible,
  onClose,
  selectedType,
  setSelectedType,
  accountNumber,
  setAccountNumber,
  cardNumber,
  setCardNumber,
  expiryDate,
  setExpiryDate,
  cardholderName,
  setCardholderName,
  handleAddPayment,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm phương thức thanh toán</Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Payment Type Selection */}
            <Text style={styles.sectionTitle}>Chọn loại thanh toán</Text>
            <View style={styles.typeSelection}>
              {(['momo', 'zalopay', 'vnpay', 'card'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    selectedType === type && styles.typeOptionSelected
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  {getPaymentIcon(type)}
                  <Text style={[
                    styles.typeOptionText,
                    selectedType === type && styles.typeOptionTextSelected
                  ]}>
                    {getPaymentName(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input Fields */}
            {selectedType === 'card' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Số thẻ</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    keyboardType="numeric"
                    maxLength={19}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ngày hết hạn (MM/YY)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="12/25"
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tên chủ thẻ</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="NGUYEN VAN A"
                    value={cardholderName}
                    onChangeText={setCardholderName}
                  />
                </View>
              </>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0987654321"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPayment}
            >
              <Text style={styles.addButtonText}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  modalBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 12,
  },
  typeSelection: {
    marginBottom: 20,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  typeOptionSelected: {
    borderColor: '#795548',
    backgroundColor: '#FFF8F5',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  typeOptionTextSelected: {
    color: '#795548',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#795548',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default AddPaymentModal;

