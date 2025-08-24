import { AntDesign, Feather, FontAwesome5 } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddPaymentModal from '../../component/AddPaymentModal';

type PaymentMethod = {
  id: string;
  type: 'momo' | 'vnpay' | 'zalopay' | 'card';
  name: string;
  accountNumber?: string;
  cardNumber?: string;
  expiryDate?: string;
  isDefault: boolean;
};

type PaymentMethodsRouteParams = {
  selectedPaymentMethod?: {
    id: string;
    type: string;
    name: string;
    accountNumber?: string;
    cardNumber?: string;
  };
  onSelectPayment: (payment: {
    id: string;
    type: string;
    name: string;
    accountNumber?: string;
    cardNumber?: string;
  }) => void;
};

type RootStackParamList = {
  Checkout: {
    selectedPaymentMethod: {
      id: string;
      type: string;
      name: string;
      accountNumber?: string;
      cardNumber?: string;
    };
  };
};

const PaymentMethodsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'vnpay-sandbox',
      type: 'vnpay',
      name: 'VNPAY - Sandbox',
      accountNumber: 'sandbox',
      isDefault: false,
    },
    {
      id: 'momo-sandbox',
      type: 'momo',
      name: 'Ví MoMo - Test',
      accountNumber: 'test-account',
      isDefault: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'momo' | 'vnpay' | 'zalopay' | 'card'>('momo');
  const [accountNumber, setAccountNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const route = useRoute<RouteProp<Record<string, PaymentMethodsRouteParams>, string>>();
  const initialSelectedId = route.params?.selectedPaymentMethod?.id ?? 'cod';
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(initialSelectedId);


  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'momo':
        return <View style={[styles.paymentIcon, { backgroundColor: '#D82D8B' }]}>
          <Text style={styles.iconText}>M</Text>
        </View>;
      case 'vnpay':
        return <View style={[styles.paymentIcon, { backgroundColor: '#1E88E5' }]}>
          <Text style={styles.iconText}>V</Text>
        </View>;
      case 'zalopay':
        return <View style={[styles.paymentIcon, { backgroundColor: '#0068FF' }]}>
          <Text style={styles.iconText}>Z</Text>
        </View>;
      case 'card':
        return <View style={[styles.paymentIcon, { backgroundColor: '#4CAF50' }]}>
          <FontAwesome5 name="credit-card" size={16} color="#fff" />
        </View>;
      default:
        return null;
    }
  };

  const getPaymentName = (type: string) => {
    switch (type) {
      case 'momo': return 'Ví MoMo';
      case 'vnpay': return 'VNPAY';
      case 'zalopay': return 'ZaloPay';
      case 'card': return 'Thẻ tín dụng/ghi nợ';
      default: return '';
    }
  };

  const handleSetDefault = (id: string) => {
    setSelectedPaymentId(id);
  };

  const handleDeletePayment = (id: string) => {
    Alert.alert(
      'Xóa phương thức thanh toán',
      'Bạn có chắc chắn muốn xóa phương thức thanh toán này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(method => method.id !== id));
            // Nếu phương thức đang được chọn bị xóa, chuyển về COD
            if (selectedPaymentId === id) {
              setSelectedPaymentId('cod');
            }
          }
        }
      ]
    );
  };

  const handleAddPayment = () => {
    if (selectedType === 'card') {
      if (!cardNumber || !expiryDate || !cardholderName) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin thẻ');
        return;
      }
    } else {
      if (!accountNumber) {
        Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
        return;
      }
    }

    const newPayment: PaymentMethod = {
      id: Date.now().toString(),
      type: selectedType,
      name: getPaymentName(selectedType),
      accountNumber: selectedType !== 'card' ? accountNumber : undefined,
      cardNumber: selectedType === 'card' ? cardNumber : undefined,
      expiryDate: selectedType === 'card' ? expiryDate : undefined,
      isDefault: false,
    };

    setPaymentMethods(prev => [...prev, newPayment]);
    setShowAddModal(false);
    setAccountNumber('');
    setCardNumber('');
    setExpiryDate('');
    setCardholderName('');
  };

  const handleComplete = () => {
    let selectedPaymentMethod;

    if (selectedPaymentId === 'cod') {
      selectedPaymentMethod = {
        id: 'cod',
        type: 'cod',
        name: 'Thanh toán khi nhận hàng',
        accountNumber: undefined,
        cardNumber: undefined,
      };
    } else {
      const method = paymentMethods.find(m => m.id === selectedPaymentId);
      if (method) {
        selectedPaymentMethod = {
          id: method.id,
          type: method.type,
          name: method.name,
          accountNumber: method.accountNumber,
          cardNumber: method.cardNumber,
        };
      }
    }

    if (selectedPaymentMethod && route.params?.onSelectPayment) {
      route.params.onSelectPayment(selectedPaymentMethod); // Gửi dữ liệu về
      navigation.goBack(); // Quay về màn Checkout
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Cash on Delivery Option */}
        <TouchableOpacity
          style={[
            styles.paymentItem,
            selectedPaymentId === 'cod' && styles.selectedPaymentItem
          ]}
          onPress={() => setSelectedPaymentId('cod')}
        >
          <View style={styles.paymentInfo}>
            <View style={[styles.paymentIcon, { backgroundColor: '#FF9800' }]}>
              <FontAwesome5 name="money-bill-wave" size={16} color="#fff" />
            </View>
            <View style={styles.paymentDetails}>
              <Text style={[
                styles.paymentName,
                selectedPaymentId === 'cod' && styles.selectedPaymentText
              ]}>
                Thanh toán khi nhận hàng
              </Text>
              <Text style={[
                styles.paymentAccount,
                selectedPaymentId === 'cod' && styles.selectedPaymentSubText
              ]}>
                Trả tiền mặt khi nhận hàng
              </Text>
            </View>
          </View>
          <View style={styles.radioButton}>
            <View style={[
              styles.radioOuter,
              selectedPaymentId === 'cod' && styles.radioSelected
            ]}>
              {selectedPaymentId === 'cod' && <View style={styles.radioInner} />}
            </View>
          </View>
        </TouchableOpacity>

        {paymentMethods.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyState}>
            <FontAwesome5 name="credit-card" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>Chưa có phương thức thanh toán khác</Text>
            <Text style={styles.emptyDescription}>
              Thêm ví điện tử hoặc thẻ để thanh toán dễ dàng hơn
            </Text>
          </View>
        ) : (
          /* Payment Methods List */
          <View style={styles.paymentList}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentItem,
                  selectedPaymentId === method.id && styles.selectedPaymentItem
                ]}
                onPress={() => setSelectedPaymentId(method.id)}
              >
                <View style={styles.paymentInfo}>
                  {getPaymentIcon(method.type)}
                  <View style={styles.paymentDetails}>
                    <Text style={[
                      styles.paymentName,
                      selectedPaymentId === method.id && styles.selectedPaymentText
                    ]}>
                      {method.name}
                    </Text>
                    <Text style={[
                      styles.paymentAccount,
                      selectedPaymentId === method.id && styles.selectedPaymentSubText
                    ]}>
                      {method.accountNumber
                        ? `•••• •••• ${method.accountNumber.slice(-4)}`
                        : `•••• •••• •••• ${method.cardNumber?.slice(-4)}`
                      }
                    </Text>
                  </View>
                </View>
                <View style={styles.paymentActions}>
                  <View style={styles.radioButton}>
                    <View style={[
                      styles.radioOuter,
                      selectedPaymentId === method.id && styles.radioSelected
                    ]}>
                      {selectedPaymentId === method.id && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePayment(method.id)}
                  >
                    <Feather name="trash-2" size={18} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Add Payment Button */}
        <TouchableOpacity
          style={styles.addPaymentButton}
          onPress={() => setShowAddModal(true)}
        >
          <AntDesign name="plus" size={20} color="#795548" />
          <Text style={styles.addPaymentText}>Thêm phương thức thanh toán</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>Hoàn thành</Text>
        </TouchableOpacity>
      </View>

      <AddPaymentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        accountNumber={accountNumber}
        setAccountNumber={setAccountNumber}
        cardNumber={cardNumber}
        setCardNumber={setCardNumber}
        expiryDate={expiryDate}
        setExpiryDate={setExpiryDate}
        cardholderName={cardholderName}
        setCardholderName={setCardholderName}
        handleAddPayment={handleAddPayment}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  paymentList: {
    marginBottom: 20,
  },
  paymentItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPaymentItem: {
    borderColor: '#795548',
    backgroundColor: '#FFF8F5',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 4,
  },
  selectedPaymentText: {
    fontWeight: '600',
    color: '#795548',
  },
  paymentAccount: {
    fontSize: 14,
    color: '#666',
  },
  selectedPaymentSubText: {
    color: '#795548',
    fontWeight: '500',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  defaultText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  paymentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    marginRight: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#795548',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#795548',
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#795548',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  addPaymentButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#795548',
    borderStyle: 'dashed',
  },
  addPaymentText: {
    fontSize: 16,
    color: '#795548',
    fontWeight: '500',
    marginLeft: 8,
  },
  // Footer với nút Hoàn thành
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  completeButton: {
    backgroundColor: '#795548',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Modal Styles
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

export default PaymentMethodsScreen;