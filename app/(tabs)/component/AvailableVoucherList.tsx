import dayjs from 'dayjs';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
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

const { width } = Dimensions.get('window');

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
      Alert.alert('Thông báo', 'Voucher này đã được lưu rồi!', [
        { text: 'OK', style: 'default' }
      ]);
      return;
    }

    try {
      await voucherService.addVoucherToUser(v._id);
      Alert.alert('Thành công', '✅ Đã lưu voucher!', [
        { text: 'OK', style: 'default' }
      ]);
      if (onSave) onSave(v);
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', '❌ Lỗi khi lưu voucher', [
        { text: 'OK', style: 'default' }
      ]);
    }
  };

  // 🔥 Chỉ lọc voucher còn hạn sử dụng
  const validVouchers = data.filter((v) => dayjs(v.end_date).isAfter(dayjs()));

  if (validVouchers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎫</Text>
        <Text style={styles.emptyText}>Hiện tại không có voucher nào</Text>
        <Text style={styles.emptySubText}>Hãy quay lại sau nhé!</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.header}>📢 Voucher có sẵn</Text>
      {validVouchers.map((v) => {
        const isAlreadySaved = userVouchers.some(
          (uv) => uv.voucher_id._id === v._id
        );
        
        return (
          <View key={v._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.codeContainer}>
                <Text style={styles.code}>{v.code}</Text>
                {isAlreadySaved && (
                  <View style={styles.savedBadge}>
                    <Text style={styles.savedText}>✓ Đã lưu</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity 
                onPress={() => setSelectedVoucher(v)}
                style={styles.detailBtn}
              >
                <Text style={styles.detailBtnText}>Chi tiết</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.discountContainer}>
              <Text style={styles.discount}>Giảm {v.discount_percent}%</Text>
            </View>
            
            <Text style={styles.dateRange}>
              📅 {formatDate(v.start_date)} - {formatDate(v.end_date)}
            </Text>
            
            <TouchableOpacity
              onPress={() => handleSave(v)}
              style={[
                styles.saveButton,
                isAlreadySaved && styles.disabledButton
              ]}
              disabled={isAlreadySaved}
            >
              <Text style={[
                styles.saveText,
                isAlreadySaved && styles.disabledText
              ]}>
                {isAlreadySaved ? '✓ Đã lưu' : '💾 Lưu Voucher'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Modal chi tiết */}
      <Modal visible={!!selectedVoucher} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedVoucher && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết Voucher</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedVoucher(null)}
                    style={styles.closeIconButton}
                  >
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalBody}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalIcon}>🎫</Text>
                    <View style={styles.modalTextContainer}>
                      <Text style={styles.modalLabelTitle}>Mã voucher</Text>
                      <Text style={styles.modalValue}>{selectedVoucher.code}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalRow}>
                    <Text style={styles.modalIcon}>📜</Text>
                    <View style={styles.modalTextContainer}>
                      <Text style={styles.modalLabelTitle}>Mô tả</Text>
                      <Text style={styles.modalValue}>{selectedVoucher.description}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalRow}>
                    <Text style={styles.modalIcon}>💸</Text>
                    <View style={styles.modalTextContainer}>
                      <Text style={styles.modalLabelTitle}>Giảm giá</Text>
                      <Text style={styles.modalValueHighlight}>{selectedVoucher.discount_percent}%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalRow}>
                    <Text style={styles.modalIcon}>🕒</Text>
                    <View style={styles.modalTextContainer}>
                      <Text style={styles.modalLabelTitle}>Thời gian hiệu lực</Text>
                      <Text style={styles.modalValue}>
                        {formatDate(selectedVoucher.start_date)} - {formatDate(selectedVoucher.end_date)}
                      </Text>
                    </View>
                  </View>
                </View>
                
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
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#5C4033',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#5C4033',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  codeContainer: {
    flex: 1,
  },
  code: { 
    fontWeight: 'bold', 
    fontSize: 18, 
    color: '#5C4033',
    marginBottom: 4,
  },
  savedBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  savedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  discountContainer: {
    backgroundColor: '#FFF3F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  discount: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#D32F2F',
  },
  dateRange: { 
    fontSize: 14, 
    color: '#666',
    marginBottom: 16,
  },
  detailBtn: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#5C4033',
  },
  detailBtnText: {
    color: '#5C4033',
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#5C4033',
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    elevation: 0,
    shadowOpacity: 0,
  },
  saveText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledText: {
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C4033',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C4033',
  },
  closeIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  modalTextContainer: {
    flex: 1,
  },
  modalLabelTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  modalValueHighlight: {
    fontSize: 18,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#5C4033',
    paddingVertical: 14,
    borderRadius: 12,
  },
  closeText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AvailableVoucherList;