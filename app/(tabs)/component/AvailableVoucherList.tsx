import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import voucherService, {
    UserVoucher,
    Voucher,
} from '../services/VoucherService';

type Props = {
  data: Voucher[];
  userVouchers: UserVoucher[];
  onSave: (v: Voucher) => void;
};

const AvailableVoucherList: React.FC<Props> = ({ data, userVouchers, onSave }) => {
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const formatDate = (date: string) => dayjs(date).format('DD/MM/YYYY');

  const handleSave = async (v: Voucher) => {
    const alreadySaved = userVouchers.some(
      (uv) => uv.voucher_id._id === v._id
    );

    if (alreadySaved) {
      Alert.alert('Voucher này đã được lưu rồi!');
      return;
    }

    try {
      await voucherService.addVoucherToUser(v._id);
      Alert.alert('✅ Đã lưu voucher!');
      if (onSave) onSave(v); // Gọi lại loadData từ parent
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Lỗi khi lưu voucher');
    }
  };

  // 🔥 Chỉ lọc voucher còn hạn sử dụng
  const validVouchers = data.filter((v) => dayjs(v.end_date).isAfter(dayjs()));

  return (
    <View>
      <Text style={styles.header}>📢 Voucher có sẵn</Text>
      {validVouchers.map((v) => (
        <View key={v._id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.code}>{v.code}</Text>
            <TouchableOpacity onPress={() => setSelectedVoucher(v)}>
              <Text style={styles.detailBtn}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.discount}>Giảm {v.discount_percent}%</Text>
          <Text style={styles.line}>
            {formatDate(v.start_date)} - {formatDate(v.end_date)}
          </Text>
          <TouchableOpacity
            onPress={() => handleSave(v)}
            style={styles.saveButton}
          >
            <Text style={styles.saveText}>Lưu Voucher</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Modal chi tiết */}
      <Modal visible={!!selectedVoucher} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedVoucher && (
              <>
                <Text style={styles.modalTitle}>Chi tiết Voucher</Text>
                <Text style={styles.modalLabel}>
                  🎫 Mã: {selectedVoucher.code}
                </Text>
                <Text style={styles.modalLabel}>
                  📜 Mô tả: {selectedVoucher.description}
                </Text>
                <Text style={styles.modalLabel}>
                  💸 Giảm: {selectedVoucher.discount_percent}%
                </Text>
                <Text style={styles.modalLabel}>
                  🕒 Hiệu lực: {formatDate(selectedVoucher.start_date)} -{' '}
                  {formatDate(selectedVoucher.end_date)}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedVoucher(null)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#5C4033',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#EFE9E1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderColor: '#D6CBBE',
    borderWidth: 1,
  },
  code: { fontWeight: 'bold', fontSize: 16, color: '#5C4033' },
  desc: { color: '#444', fontSize: 14, marginBottom: 4 },
  discount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#cc4747ff',
  },
  line: { fontSize: 13, color: '#666' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailBtn: {
    color: '#5C4033',
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#5C4033',
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: '#5C4033',
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#5C4033',
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#999',
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AvailableVoucherList;
