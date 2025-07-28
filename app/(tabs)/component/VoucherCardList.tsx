import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import voucherService, { UserVoucher } from '../services/VoucherService';

interface UserVoucherListProps {
  data?: UserVoucher[];
  navigation: any;
  onSelectVoucher?: (voucher: UserVoucher | null) => void;
  selectedVoucherId?: string | null;
  orderValue?: number; // Giá trị đơn hàng để validate voucher
}

const VoucherCard = ({ navigation, route }: any) => {
  const {
    onSelectVoucher,
    selectedVoucherId = null,
    orderValue = 0,
    data = []
  } = route.params || {};

  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [selectedVoucherIdLocal, setSelectedVoucherIdLocal] = useState<string | null>(selectedVoucherId);
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user vouchers nếu không có data truyền vào
  useEffect(() => {
    if (!data || data.length === 0) {
      loadUserVouchers();
    }
    setSelectedVoucherIdLocal(selectedVoucherId);
  }, [selectedVoucherId]);

  const loadUserVouchers = async () => {
    try {
      setLoading(true);
      const response = await voucherService.getUserVouchers();
      if (response.success) {
        setUserVouchers(response.data);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải danh sách voucher');
      }
    } catch (error: any) {
      console.error('Lỗi load vouchers:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách voucher. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => dayjs(date).format('DD/MM/YYYY');
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleShowDetail = (item: UserVoucher) => {
    setSelectedVoucher(item);
  };

  const handleCloseModal = () => {
    setSelectedVoucher(null);
  };

  // Toggle voucher selection - nếu đã chọn thì bỏ chọn, chưa chọn thì chọn
  const handleSelectVoucher = (voucher: UserVoucher) => {
    const isCurrentlySelected = selectedVoucherIdLocal === voucher._id;
    
    if (isCurrentlySelected) {
      // Nếu voucher đang được chọn, bỏ chọn
      setSelectedVoucherIdLocal(null);
      if (onSelectVoucher) {
        onSelectVoucher(null);
      }
      console.log('🧹 Đã bỏ chọn voucher');
    } else {
      // Nếu voucher chưa được chọn, chọn nó
      setSelectedVoucherIdLocal(voucher._id);
      if (onSelectVoucher) {
        onSelectVoucher(voucher);
      }
      console.log('🎯 Voucher đã chọn (VoucherCardList):', voucher.voucher_id?.code);
    }

    // Quay lại Checkout sau một khoảng thời gian ngắn
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  // Header theo phong cách Shopee/Lazada
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Chọn Voucher</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerIconButton}>
          <Ionicons name="help-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render voucher item theo phong cách e-commerce
  const renderVoucherItem = (item: UserVoucher) => {
    const v = typeof item.voucher_id === 'object' ? item.voucher_id : null;
    if (!v) return null;

    const isSelected = selectedVoucherIdLocal === item._id;
    const daysLeft = dayjs(v.end_date).diff(dayjs(), 'day');
    const isExpiringSoon = daysLeft <= 3 && daysLeft > 0;
    const discountAmount = (orderValue * v.discount_percent) / 100;

    return (
      <TouchableOpacity 
        key={item._id}
        style={[styles.voucherCard, isSelected && styles.selectedCard]}
        onPress={() => handleSelectVoucher(item)}
      >
        {/* Voucher Badge */}
        <View style={styles.voucherBadge}>
          <Text style={styles.badgeText}>VOUCHER</Text>
        </View>

        <View style={styles.voucherBody}>
          <View style={styles.voucherLeft}>
            {/* Discount Circle */}
            <View style={styles.discountCircle}>
              <Text style={styles.discountPercent}>{v.discount_percent}%</Text>
              <Text style={styles.discountLabel}>OFF</Text>
            </View>
            
            <View style={styles.voucherContent}>
              <Text style={styles.voucherTitle} numberOfLines={1}>
                Giảm {v.discount_percent}% cho đơn hàng
              </Text>
              <Text style={styles.voucherCode}>Mã: {v.code}</Text>
              
              {/* Expiry Info */}
              <View style={styles.expiryContainer}>
                <Ionicons name="time-outline" size={14} color="#999" />
                <Text style={[
                  styles.expiryText,
                  isExpiringSoon && styles.expiryUrgent
                ]}>
                  {daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Hết hạn hôm nay'}
                </Text>
                {isExpiringSoon && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>Sắp hết hạn</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.voucherRight}>
            {/* Selection Radio */}
            {isSelected ? (
              <View style={styles.radioSelected}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            ) : (
              <View style={styles.radioUnselected} />
            )}
            
            {/* Detail Button */}
            <TouchableOpacity 
              style={styles.detailButton}
              onPress={() => handleShowDetail(item)}
            >
              <Text style={styles.detailButtonText}>Điều Kiện</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Indicator */}
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedIndicatorText}>✓ Đang sử dụng</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Filter valid vouchers
  const validVouchers = Array.isArray(userVouchers)
    ? userVouchers.filter(item => {
        const v = item.voucher_id;
        return (
          item.status === 'active' &&
          !item.is_used &&
          typeof v === 'object' &&
          v.end_date &&
          dayjs(v.end_date).isAfter(dayjs()) &&
          (v.is_active !== false)
        );
      })
    : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {renderHeader()}

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Summary */}
        {orderValue > 0 && (
          <View style={styles.orderSummaryCard}>
            <View style={styles.orderSummaryHeader}>
              <Ionicons name="receipt-outline" size={20} color="#5C4033" />
              <Text style={styles.orderSummaryTitle}>Giá trị đơn hàng</Text>
            </View>
            <Text style={styles.orderValue}>{formatCurrency(orderValue)}</Text>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5C4033" />
            <Text style={styles.loadingText}>Đang tải voucher...</Text>
          </View>
        )}

        {!loading && (
          <>
            {/* Vouchers List */}
            <View style={styles.voucherSection}>
              <Text style={styles.sectionTitle}>
                Voucher của Shop ({validVouchers.length})
              </Text>
              
              {validVouchers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="ticket-outline" size={64} color="#ddd" />
                  <Text style={styles.emptyTitle}>Không có voucher khả dụng</Text>
                  <Text style={styles.emptyDesc}>
                    Bạn chưa có voucher nào hoặc voucher đã hết hạn
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.instructionText}>
                    {selectedVoucherIdLocal 
                      ? "Nhấn vào voucher đang chọn để bỏ sử dụng" 
                      : "Chọn một voucher để áp dụng giảm giá"
                    }
                  </Text>
                  {validVouchers.map(item => renderVoucherItem(item))}
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Enhanced Modal for Voucher Details */}
      <Modal visible={!!selectedVoucher} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedVoucher && typeof selectedVoucher.voucher_id === 'object' && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết Voucher</Text>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                {/* Modal Content */}
                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalVoucherCard}>
                    <View style={styles.modalDiscountCircle}>
                      <Text style={styles.modalDiscountPercent}>
                        {selectedVoucher.voucher_id.discount_percent}%
                      </Text>
                      <Text style={styles.modalDiscountLabel}>OFF</Text>
                    </View>
                    <View style={styles.modalVoucherInfo}>
                      <Text style={styles.modalVoucherTitle}>
                        {selectedVoucher.voucher_id.description}
                      </Text>
                      <Text style={styles.modalVoucherCode}>
                        Mã: {selectedVoucher.voucher_id.code}
                      </Text>
                    </View>
                  </View>

                  {/* Terms and Conditions */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Điều kiện sử dụng</Text>
                    <View style={styles.modalCondition}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.modalConditionText}>
                        Áp dụng cho tất cả sản phẩm
                      </Text>
                    </View>
                    <View style={styles.modalCondition}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.modalConditionText}>
                        Có hiệu lực đến {formatDate(selectedVoucher.voucher_id.end_date)}
                      </Text>
                    </View>
                    <View style={styles.modalCondition}>
                      <Ionicons name="person-outline" size={16} color="#666" />
                      <Text style={styles.modalConditionText}>
                        Mỗi khách hàng chỉ sử dụng 1 lần
                      </Text>
                    </View>
                  </View>
                </ScrollView>
                
                {/* Modal Footer */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    onPress={handleCloseModal} 
                    style={styles.modalButton}
                  >
                    <Text style={styles.modalButtonText}>Đã hiểu</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#5C4033',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerIconButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  orderSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderSummaryTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  orderValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C4033',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  voucherSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
  voucherCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: '#5C4033',
    backgroundColor: '#fff5f5',
  },
  voucherBadge: {
    backgroundColor: '#e44848ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  voucherBody: {
    flexDirection: 'row',
    padding: 16,
  },
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  discountCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#966852ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  discountPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  discountLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  voucherContent: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  voucherCode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  expiryUrgent: {
    color: '#5C4033',
  },
  urgentBadge: {
    backgroundColor: '#ff0000ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  urgentBadgeText: {
    fontSize: 10,
    color: '#f7f7f7ff',
    fontWeight: 'bold',
  },
  voucherRight: {
    alignItems: 'center',
    marginLeft: 12,
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5C4033',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  detailButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#5C4033',
    backgroundColor: '#fff',
  },
  detailButtonText: {
    fontSize: 12,
    color: '#5C4033',
    fontWeight: '500',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#5C4033',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalVoucherCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  modalDiscountCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5C4033',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalDiscountPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalDiscountLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalVoucherInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  modalVoucherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalVoucherCode: {
    fontSize: 14,
    color: '#666',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modalCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalConditionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    backgroundColor: '#5C4033',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VoucherCard;