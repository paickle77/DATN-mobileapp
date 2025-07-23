import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserVoucher } from '../services/VoucherService';

const UserVoucherList = ({ data }: { data: UserVoucher[] }) => {
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);

  const formatDate = (date: string) => dayjs(date).format('DD/MM/YYYY');

  const handleShowDetail = (item: UserVoucher) => {
    setSelectedVoucher(item);
  };

  const handleCloseModal = () => {
    setSelectedVoucher(null);
  };

  // ✅ Chỉ lấy voucher còn hạn và có trạng thái active
  const validVouchers = data.filter(item => {
    const v = item.voucher_id;
    return (
      item.status === 'active' &&
      typeof v === 'object' &&
      v.end_date &&
      dayjs(v.end_date).isAfter(dayjs())
    );
  });

  return (
    <View>
      <Text style={styles.header}>🎟️ Voucher đã thu thập</Text>

      {validVouchers.map(item => {
        const v = typeof item.voucher_id === 'object' ? item.voucher_id : null;
        if (!v) return null;

        return (
          <View key={item._id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.code}>{v.code}</Text>
              <TouchableOpacity onPress={() => handleShowDetail(item)}>
                <Text style={styles.detailBtn}>Chi tiết</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.discount_percent}>Giảm {v.discount_percent}%</Text>
            <Text style={styles.line}>
              {formatDate(v.start_date)} - {formatDate(v.end_date)}
            </Text>
          </View>
        );
      })}

      {/* MODAL CHI TIẾT */}
      <Modal visible={!!selectedVoucher} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedVoucher && typeof selectedVoucher.voucher_id === 'object' && (
              <>
                <Text style={styles.modalTitle}>Chi tiết Voucher</Text>
                <Text style={styles.modalLabel}>🎫 Mã: {selectedVoucher.voucher_id.code}</Text>
                <Text style={styles.modalLabel}>📜 Mô tả: {selectedVoucher.voucher_id.description}</Text>
                <Text style={styles.modalLabel}>💸 Giảm: {selectedVoucher.voucher_id.discount_percent}%</Text>
                <Text style={styles.modalLabel}>
                  🕒 Hiệu lực: {formatDate(selectedVoucher.start_date)} - {formatDate(selectedVoucher.voucher_id.end_date)}
                </Text>
                <Text style={styles.modalLabel}>📌 Trạng thái: {selectedVoucher.status}</Text>
                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
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
  discount_percent: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#cc4747ff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#5C4033',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF8F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderColor: '#EBDDC9',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  code: { fontWeight: 'bold', fontSize: 16, color: '#5C4033' },
  desc: { color: '#444', fontSize: 14, marginBottom: 4 },
  line: { fontSize: 13, color: '#666' },
  status: {
    marginTop: 6,
    fontWeight: 'bold',
    fontSize: 13,
  },
  active: { color: 'green' },
  inactive: { color: 'gray' },
  detailBtn: {
    color: '#5C4033',
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#5C4033',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    backgroundColor: '#5C4033',
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserVoucherList;
