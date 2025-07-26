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

  if (validVouchers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎟️</Text>
        <Text style={styles.emptyText}>Chưa có voucher nào được lưu</Text>
        <Text style={styles.emptySubText}>Hãy thu thập voucher từ tab "Có sẵn"</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.header}>🎟️ Voucher đã thu thập</Text>

      {validVouchers.map(item => {
        const v = typeof item.voucher_id === 'object' ? item.voucher_id : null;
        if (!v) return null;

        const daysLeft = dayjs(v.end_date).diff(dayjs(), 'day');
        const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;

        return (
          <View key={item._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.codeContainer}>
                <Text style={styles.code}>{v.code}</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, styles.activeBadge]}>
                    <Text style={styles.statusText}>✓ Hoạt động</Text>
                  </View>
                  {isExpiringSoon && (
                    <View style={styles.warningBadge}>
                      <Text style={styles.warningText}>⚠️ Sắp hết hạn</Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => handleShowDetail(item)}
                style={styles.detailBtn}
              >
                <Text style={styles.detailBtnText}>Chi tiết</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.discountContainer}>
              <Text style={styles.discount_percent}>Giảm {v.discount_percent}%</Text>
            </View>
            
            <Text style={styles.dateRange}>
              📅 {formatDate(v.start_date)} - {formatDate(v.end_date)}
            </Text>
            
            <View style={styles.timeLeftContainer}>
              <Text style={[
                styles.timeLeft,
                isExpiringSoon ? styles.timeLeftWarning : styles.timeLeftNormal
              ]}>
                {daysLeft > 0 ? `⏰ Còn ${daysLeft} ngày` : '⏰ Hết hạn hôm nay'}
              </Text>
            </View>
          </View>
        );
      })}

      {/* MODAL CHI TIẾT */}
      <Modal visible={!!selectedVoucher} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedVoucher && typeof selectedVoucher.voucher_id === 'object' && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết Voucher</Text>
                  <TouchableOpacity
                    onPress={handleCloseModal}
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
                      <Text style={styles.modalValue}>{selectedVoucher.voucher_id.code}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalRow}>
                    <Text style={styles.modalIcon}>📜</Text>
                    <View style={styles.modalTextContainer}>
                      <Text style={styles.modalLabelTitle}>Mô tả</Text>
                      <Text style={styles.modalValue}>{selectedVoucher.voucher_id.description}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalRow}>
                    <Text style={styles.modalIcon}>💸</Text>
                    <View style={styles.modalTextContainer}>
                      <Text style={styles.modalLabelTitle}>Giảm giá</Text>
                      <Text style={styles.modalValueHighlight}>{selectedVoucher.voucher_id.discount_percent}%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalRow}>
                    <Text style={styles.modalIcon}>🕒</Text>
                    <View style={styles.modalTextContainer}>
                      <Text style={styles.modalLabelTitle}>Thời gian hiệu lực</Text>
                      <Text style={styles.modalValue}>
                        {formatDate(selectedVoucher.start_date)} - {formatDate(selectedVoucher.voucher_id.end_date)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalRow}>
                    <Text style={styles.modalIcon}>📌</Text>
                    <View style={styles.modalTextContainer}>
                      <Text style={styles.modalLabelTitle}>Trạng thái</Text>
                      <Text style={[styles.modalValue, styles.modalStatusActive]}>
                        {selectedVoucher.status === 'active' ? 'Hoạt động' : selectedVoucher.status}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity 
                  onPress={handleCloseModal} 
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
    borderLeftColor: '#4CAF50',
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
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  warningBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  warningText: {
    color: '#FF9800',
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
  discount_percent: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#D32F2F',
  },
  dateRange: { 
    fontSize: 14, 
    color: '#666',
    marginBottom: 12,
  },
  timeLeftContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  timeLeft: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeLeftNormal: {
    color: '#4CAF50',
  },
  timeLeftWarning: {
    color: '#FF9800',
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
  modalStatusActive: {
    color: '#4CAF50',
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
    fontSize: 16,}
});

export default UserVoucherList;
