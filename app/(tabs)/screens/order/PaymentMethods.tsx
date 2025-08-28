import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react'; // ✅ Thêm useEffect
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  canUseCOD?: boolean; // ✅ Thêm prop COD eligibility
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
  ]);

  const route = useRoute<RouteProp<Record<string, PaymentMethodsRouteParams>, string>>();
  const initialSelectedId = route.params?.selectedPaymentMethod?.id ?? 'cod';
  const canUseCOD = route.params?.canUseCOD ?? true; // ✅ Lấy thông tin COD eligibility
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(initialSelectedId);
  const [hasShownAutoSelectAlert, setHasShownAutoSelectAlert] = useState(false); // ✅ Kiểm soát alert

  // ✅ Tự động chuyển sang phương thức khác nếu COD bị disable và đang được chọn
  useEffect(() => {
    if (!canUseCOD && selectedPaymentId === 'cod' && !hasShownAutoSelectAlert) {
      // Tự động chọn VNPAY nếu có sẵn
      const firstOnlineMethod = paymentMethods[0]; // Chọn phương thức đầu tiên
      if (firstOnlineMethod) {
        setSelectedPaymentId(firstOnlineMethod.id);
        // ✅ Hiển thị thông báo tự động chuyển phương thức
        Alert.alert(
          'Tự động chuyển phương thức thanh toán',
          `Do bạn đã từng từ chối nhận hàng COD, hệ thống đã tự động chọn "${firstOnlineMethod.name}" cho bạn.`,
          [{ text: 'Đã hiểu' }]
        );
        setHasShownAutoSelectAlert(true);
      } else {
        // Nếu không có phương thức nào, chọn VNPAY sandbox mặc định
        setSelectedPaymentId('vnpay-sandbox');
        Alert.alert(
          'Tự động chọn phương thức thanh toán',
          'Do bạn đã từng từ chối nhận hàng COD, hệ thống đã tự động chọn "VNPAY - Sandbox" cho bạn.',
          [{ text: 'Đã hiểu' }]
        );
        setHasShownAutoSelectAlert(true);
      }
    }
  }, [canUseCOD, selectedPaymentId, paymentMethods, hasShownAutoSelectAlert]);


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
      // ✅ Gửi dữ liệu về Checkout ngay lập tức, không cần alert xác nhận
      route.params.onSelectPayment(selectedPaymentMethod);
      navigation.goBack();
    } else {
      // ✅ Hiển thị thông báo lỗi nếu không có phương thức nào được chọn
      Alert.alert(
        'Lỗi',
        'Vui lòng chọn một phương thức thanh toán hợp lệ.',
        [{ text: 'OK' }]
      );
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
            selectedPaymentId === 'cod' && styles.selectedPaymentItem,
            !canUseCOD && styles.disabledPaymentItem // ✅ Style cho disabled COD
          ]}
          onPress={() => {
            if (!canUseCOD) {
              // ✅ Hiển thị alert khi user cố chọn COD mà không được phép
              Alert.alert(
                'Không thể chọn COD',
                'Bạn đã từng từ chối nhận hàng khi chọn thanh toán khi nhận. Vui lòng chọn thanh toán online để tiếp tục.',
                [{ text: 'OK' }]
              );
              return;
            }
            setSelectedPaymentId('cod');
          }}
          disabled={!canUseCOD} // ✅ Disable khi không được phép dùng COD
        >
          <View style={styles.paymentInfo}>
            <View style={[
              styles.paymentIcon, 
              { backgroundColor: canUseCOD ? '#FF9800' : '#ccc' } // ✅ Màu khác khi disabled
            ]}>
              <FontAwesome5 name="money-bill-wave" size={16} color="#fff" />
            </View>
            <View style={styles.paymentDetails}>
              <Text style={[
                styles.paymentName,
                selectedPaymentId === 'cod' && styles.selectedPaymentText,
                !canUseCOD && styles.disabledPaymentText // ✅ Style cho text disabled
              ]}>
                Thanh toán khi nhận hàng
                {!canUseCOD && ' (Không khả dụng)'} 
              </Text>
              <Text style={[
                styles.paymentAccount,
                selectedPaymentId === 'cod' && styles.selectedPaymentSubText,
                !canUseCOD && styles.disabledPaymentText // ✅ Style cho text disabled
              ]}>
                {canUseCOD 
                  ? 'Trả tiền mặt khi nhận hàng'
                  : 'Bạn đã từng từ chối nhận hàng COD'
                }
              </Text>
            </View>
          </View>
          <View style={styles.radioButton}>
            <View style={[
              styles.radioOuter,
              selectedPaymentId === 'cod' && styles.radioSelected,
              !canUseCOD && styles.disabledRadio // ✅ Style cho radio disabled
            ]}>
              {selectedPaymentId === 'cod' && canUseCOD && <View style={styles.radioInner} />}
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
                <View style={styles.radioButton}>
                  <View style={[
                    styles.radioOuter,
                    selectedPaymentId === method.id && styles.radioSelected
                  ]}>
                    {selectedPaymentId === method.id && <View style={styles.radioInner} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  // ✅ Thêm styles cho disabled COD
  disabledPaymentItem: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
  disabledPaymentText: {
    color: '#999',
  },
  disabledRadio: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
});

export default PaymentMethodsScreen;