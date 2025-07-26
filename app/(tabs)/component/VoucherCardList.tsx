import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserVoucher } from '../services/VoucherService';

interface UserVoucherListProps {
  data: UserVoucher[];
  navigation: any;
  onSelectVoucher?: (voucher: UserVoucher | null) => void;
  selectedVoucherId?: string | null;
}

const VoucherCard = ({ 
  data, 
  navigation, 
  onSelectVoucher, 
  selectedVoucherId = null 
}: UserVoucherListProps) => {
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);

  const formatDate = (date: string) => dayjs(date).format('DD/MM/YYYY');

  const handleShowDetail = (item: UserVoucher) => {
    setSelectedVoucher(item);
  };

  const handleCloseModal = () => {
    setSelectedVoucher(null);
  };

  const handleSelectVoucher = (voucher: UserVoucher | null) => {
    if (onSelectVoucher) {
      onSelectVoucher(voucher);
    }
    // Auto navigate back after selection
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  // Header với nút back đẹp
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Mã giảm giá</Text>
        <Text style={styles.headerSubtitle}>Chọn voucher để tiết kiệm</Text>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.voucherIcon}>
          <Ionicons name="pricetag" size={24} color="#fff" />
        </View>
      </View>
    </View>
  );

  // Nút "Không sử dụng voucher" với thiết kế đẹp
  const renderNoVoucherOption = () => (
    <View style={styles.noVoucherSection}>
      <Text style={styles.sectionLabel}>💳 Tùy chọn thanh toán</Text>
      <TouchableOpacity 
        style={[
          styles.noVoucherCard,
          selectedVoucherId === null && styles.selectedNoVoucherCard
        ]}
        onPress={() => handleSelectVoucher(null)}
      >
        <View style={styles.noVoucherLeft}>
          <View style={styles.noVoucherIconContainer}>
            <Ionicons name="wallet-outline" size={24} color="#666" />
          </View>
          <View style={styles.noVoucherTextContainer}>
            <Text style={styles.noVoucherTitle}>Thanh toán giá gốc</Text>
            <Text style={styles.noVoucherDesc}>Không áp dụng mã giảm giá</Text>
          </View>
        </View>
        <View style={styles.noVoucherRight}>
          {selectedVoucherId === null ? (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
          ) : (
            <View style={styles.unselectedIndicator}>
              <View style={styles.radioCircle} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  // Render từng voucher item với thiết kế đẹp
  const renderVoucherItem = (item: UserVoucher) => {
    const v = typeof item.voucher_id === 'object' ? item.voucher_id : null;
    if (!v) return null;

    const isSelected = selectedVoucherId === item._id;
    const daysLeft = dayjs(v.end_date).diff(dayjs(), 'day');
    const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;

    return (
      <View key={item._id} style={[
        styles.voucherCard,
        isSelected && styles.selectedVoucherCard
      ]}>
        {/* Voucher Header */}
        <View style={styles.voucherHeader}>
          <View style={styles.voucherTopRow}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{v.discount_percent}%</Text>
            </View>
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.selectedText}>Đã chọn</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.voucherCode}>{v.code}</Text>
          <Text style={styles.voucherDescription} numberOfLines={2}>
            {v.description}
          </Text>
        </View>

        {/* Voucher Info */}
        <View style={styles.voucherInfo}>
          <View style={styles.timeInfo}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.dateText}>
              HSD: {formatDate(v.end_date)}
            </Text>
            {isExpiringSoon && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>Sắp hết hạn</Text>
              </View>
            )}
          </View>
          
          <Text style={[
            styles.daysLeft,
            isExpiringSoon ? styles.daysLeftUrgent : styles.daysLeftNormal
          ]}>
            {daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Hết hạn hôm nay'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[
              styles.selectButton,
              isSelected ? styles.selectedActionButton : styles.unselectedActionButton
            ]}
            onPress={() => handleSelectVoucher(isSelected ? null : item)}
          >
            <Ionicons 
              name={isSelected ? "checkmark-circle" : "add-circle-outline"} 
              size={18} 
              color={isSelected ? "#fff" : "#5C4033"} 
            />
            <Text style={[
              styles.selectButtonText,
              isSelected ? styles.selectedActionText : styles.unselectedActionText
            ]}>
              {isSelected ? 'Bỏ chọn' : 'Chọn'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.detailButton}
            onPress={() => handleShowDetail(item)}
          >
            <Ionicons name="information-circle-outline" size={18} color="#5C4033" />
            <Text style={styles.detailButtonText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>

        {/* Decorative elements */}
        <View style={styles.decorativeLeft} />
        <View style={styles.decorativeRight} />
      </View>
    );
  };

  // ✅ Chỉ lấy voucher còn hạn và có trạng thái active
const validVouchers = Array.isArray(data)
  ? data.filter(item => {
      const v = item.voucher_id;
      return (
        item.status === 'active' &&
        typeof v === 'object' &&
        v.end_date &&
        dayjs(v.end_date).isAfter(dayjs())
      );
    })
  : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Beautiful Header */}
      {renderHeader()}

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* No Voucher Option */}
        {renderNoVoucherOption()}

        {/* Vouchers Section */}
        <View style={styles.vouchersSection}>
          <Text style={styles.sectionLabel}>🎟️ Voucher khả dụng ({validVouchers.length})</Text>
          
          {validVouchers.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="ticket-outline" size={48} color="#ccc" />
              </View>
              <Text style={styles.emptyTitle}>Chưa có voucher nào</Text>
              <Text style={styles.emptyDesc}>
                Bạn chưa có voucher nào có thể sử dụng.{'\n'}
                Hãy thu thập voucher để nhận ưu đãi!
              </Text>
            </View>
          ) : (
            validVouchers.map(item => renderVoucherItem(item))
          )}
        </View>
      </ScrollView>

      {/* Enhanced Modal */}
      <Modal visible={!!selectedVoucher} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedVoucher && typeof selectedVoucher.voucher_id === 'object' && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleContainer}>
                      <Text style={styles.modalTitle}>Chi tiết voucher</Text>
                      <Text style={styles.modalCode}>{selectedVoucher.voucher_id.code}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleCloseModal}
                      style={styles.closeButton}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                    <View style={styles.modalDiscountCard}>
                      <Text style={styles.modalDiscountText}>
                        -{selectedVoucher.voucher_id.discount_percent}%
                      </Text>
                      <Text style={styles.modalDiscountLabel}>Giảm giá</Text>
                    </View>

                    <View style={styles.modalInfoSection}>
                      <View style={styles.modalInfoItem}>
                        <Ionicons name="document-text-outline" size={20} color="#5C4033" />
                        <View style={styles.modalInfoText}>
                          <Text style={styles.modalInfoLabel}>Mô tả</Text>
                          <Text style={styles.modalInfoValue}>{selectedVoucher.voucher_id.description}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.modalInfoItem}>
                        <Ionicons name="calendar-outline" size={20} color="#5C4033" />
                        <View style={styles.modalInfoText}>
                          <Text style={styles.modalInfoLabel}>Thời gian áp dụng</Text>
                          <Text style={styles.modalInfoValue}>
                            {formatDate(selectedVoucher.start_date)} - {formatDate(selectedVoucher.voucher_id.end_date)}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.modalInfoItem}>
                        <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
                        <View style={styles.modalInfoText}>
                          <Text style={styles.modalInfoLabel}>Trạng thái</Text>
                          <Text style={[styles.modalInfoValue, styles.activeStatus]}>
                            Đang hoạt động
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ScrollView>
                  
                  <View style={styles.modalFooter}>
                    <TouchableOpacity 
                      onPress={handleCloseModal} 
                      style={styles.modalCloseButton}
                    >
                      <Text style={styles.modalCloseText}>Đóng</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#5C4033',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerRight: {
    marginLeft: 16,
  },
  voucherIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  noVoucherSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  noVoucherCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedNoVoucherCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  noVoucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  noVoucherIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  noVoucherTextContainer: {
    flex: 1,
  },
  noVoucherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noVoucherDesc: {
    fontSize: 14,
    color: '#666',
  },
  noVoucherRight: {
    marginLeft: 16,
  },
  selectedIndicator: {
    // Already styled by Ionicons
  },
  unselectedIndicator: {
    // Container for radio circle
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  vouchersSection: {
    // Container for vouchers
  },
  voucherCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  selectedVoucherCard: {
    borderColor: '#5C4033',
    backgroundColor: '#fdf8f6',
    transform: [{ scale: 1.02 }],
  },
  voucherHeader: {
    marginBottom: 16,
  },
  voucherTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountBadge: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  discountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedBadge: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  voucherCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C4033',
    marginBottom: 8,
  },
  voucherDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  voucherInfo: {
    marginBottom: 20,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  urgentBadge: {
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  urgentText: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  daysLeft: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysLeftNormal: {
    color: '#4CAF50',
  },
  daysLeftUrgent: {
    color: '#FF9800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  selectedActionButton: {
    backgroundColor: '#5C4033',
  },
  unselectedActionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#5C4033',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedActionText: {
    color: '#fff',
  },
  unselectedActionText: {
    color: '#5C4033',
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    gap: 4,
  },
  detailButtonText: {
    fontSize: 14,
    color: '#5C4033',
    fontWeight: '500',
  },
  decorativeLeft: {
    position: 'absolute',
    left: -10,
    top: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
  },
  decorativeRight: {
    position: 'absolute',
    right: -10,
    top: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyDesc: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#5C4033',
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  modalCode: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  modalBody: {
    padding: 24,
  },
  modalDiscountCard: {
    backgroundColor: '#FF4757',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  modalDiscountText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  modalDiscountLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  modalInfoSection: {
    gap: 20,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activeStatus: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  modalFooter: {
    padding: 24,
    paddingTop: 0,
  },
  modalCloseButton: {
    backgroundColor: '#5C4033',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VoucherCard;