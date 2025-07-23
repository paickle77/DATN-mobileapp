import { NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getUserData, saveUserData } from '../screens/utils/storage';
import { BASE_URL } from '../services/api';

interface Voucher {
  _id: string;
  user_id: string;
  voucher_id: {
    _id: string;
    code: string;
    description: string;
    discount_percent: number;
    start_date: string;
    end_date: string;
  };
  status: string;
  start_date: string;
}

// Define RootStackParamList according to your navigation structure
type RootStackParamList = {
    Checkout: { selectedVoucher?: Voucher };
    // Add other routes here if needed
};

const VoucherCard = ({ voucher }: { voucher: Voucher }) => {
      const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { voucher_id, status } = voucher;
  const formattedStart = dayjs(voucher_id.start_date).format('DD/MM/YYYY');
  const formattedEnd = dayjs(voucher_id.end_date).format('DD/MM/YYYY');
  const [visible, setVisible] = useState(false);

  const handleDetail = () => {
    setVisible(true);
  };

  const handleUseNow = async () => {
    console.log('ok')
    Alert.alert('🎉 Áp dụng voucher', `Bạn đã chọn voucher ${voucher_id.code} để sử dụng`);
    await saveUserData({ value: voucher_id.discount_percent, key: 'discount_percent' });
    await saveUserData({ value: voucher_id.code, key: 'code' });
    console.log('Selected voucher:', voucher);
    navigation.navigate('Checkout');
  };

  return (
    <View style={styles.card}>
      {/* Modal Chi tiết */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎫 {voucher_id.code}</Text>
            <Text style={styles.modalDescription}>📄 {voucher_id.description}</Text>
            <Text style={styles.modalText}>💸 Giảm: {voucher_id.discount_percent}%</Text>
            <Text style={styles.modalText}>
              ⏰ {formattedStart} - {formattedEnd}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Nội dung thẻ */}
      <Text style={styles.code}>🎫 {voucher_id.code}</Text>
      {/* <Text style={styles.description}>{voucher_id.description}</Text> */}
      <Text style={styles.discount}>Giảm giá: {voucher_id.discount_percent}%</Text>
      <Text style={styles.date}>⏰ {formattedStart} - {formattedEnd}</Text>
      <Text style={[styles.status, status === 'active' ? styles.active : styles.inactive]}>
        Trạng thái: {status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
      </Text>

      {/* Nút bấm */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.detailButton} onPress={handleDetail}>
          <Text style={styles.buttonText}>Chi tiết</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.useButton} onPress={handleUseNow}>
          <Text style={styles.buttonText}>Sử dụng ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const VoucherCardList = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const userData = await getUserData('userData');
      const res = await axios.get(`${BASE_URL}/voucher_users/user/${userData}`);
      setVouchers(res.data.data);
    } catch (error) {
      console.error('❌ Lỗi tải voucher:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎟️ Danh sách Voucher của bạn</Text>
      <FlatList
        data={vouchers}
        refreshing={loading}
        onRefresh={fetchVouchers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <VoucherCard voucher={item} />}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

export default VoucherCardList;

const styles = StyleSheet.create({
    modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 16,
  width: '85%',
  alignItems: 'center',
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#5C4033',
  marginBottom: 10,
},
modalDescription: {
  fontSize: 14,
  marginBottom: 6,
  textAlign: 'center',
  color: '#444',
},
modalText: {
  fontSize: 13,
  color: '#333',
  marginBottom: 4,
},
closeButton: {
  marginTop: 16,
  backgroundColor: '#5C4033',
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 8,
},

  container: {
    padding: 16,
    backgroundColor: '#FFF8F2',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5C4033',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8DCC9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  code: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C4033',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  discount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C1442E',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  status: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 6,
  },
  active: {
    color: 'green',
  },
  inactive: {
    color: 'gray',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  detailButton: {
    backgroundColor: '#EADBC8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  useButton: {
    backgroundColor: '#5C4033',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
