import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [refreshing, setRefreshing] = useState(false);

  

  // Load user vouchers nếu không có data truyền vào
  useEffect(() => {
    if (data && data.length > 0) {
      // Nếu có data từ props, sử dụng data đó
      setUserVouchers(data);
    } else if (userVouchers.length === 0) {
      // Chỉ load từ API nếu chưa có data và userVouchers rỗng
      loadUserVouchers();
    }
  }, []); // Chỉ chạy một lần khi mount

  // Separate useEffect for selectedVoucherId
  useEffect(() => {
    setSelectedVoucherIdLocal(selectedVoucherId);
  }, [selectedVoucherId]);

  const loadUserVouchers = async () => {
    try {
      setLoading(true);
      const response = await voucherService.getUserVouchers();
      
      if (response.success) {
        console.log('✅ Loaded vouchers:', response.data?.length || 0);
        setUserVouchers(response.data || []);
      } else {
        console.error('❌ API Error:', response.message);
        Alert.alert('Lỗi', response.message || 'Không thể tải danh sách voucher');
      }
    } catch (error: any) {
      console.error('💥 Load vouchers error:', error);
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

  // Hàm điều hướng đến VoucherScreen tab "Có sẵn"
  const navigateToAvailableVouchers = () => {
    navigation.navigate('VoucherScreen', { 
      activeTab: 'AvailableVoucherList' // Focus vào tab "Có sẵn"
    });
  };

  const handleShowDetail = (item: UserVoucher) => {
    setSelectedVoucher(item);
  };

  const handleCloseModal = () => {
    setSelectedVoucher(null);
  };

  // Toggle voucher selection - nếu đã chọn thì bỏ chọn, chưa chọn thì chọn
  const handleSelectVoucher = (voucher: UserVoucher) => {
    const voucherData = typeof voucher.voucher_id === 'object' ? voucher.voucher_id : null;
    
    // Kiểm tra điều kiện min_order_value
    if (voucherData && voucherData.min_order_value && orderValue < voucherData.min_order_value) {
      Alert.alert(
        'Không đủ điều kiện', 
        `Đơn hàng tối thiểu ${voucherData.min_order_value.toLocaleString('vi-VN')}₫ để sử dụng voucher này.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

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
      console.log('🎯 Voucher đã chọn (VoucherCardList):', typeof voucher.voucher_id === 'object' ? voucher.voucher_id?.code : voucher.voucher_id);
    }

    // Quay lại Checkout sau một khoảng thời gian ngắn
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserVouchers();
    setRefreshing(false);
  }, []);

  // Điều hướng đến AvailableVoucherList
  const handleNavigateToAvailableVouchers = () => {
      navigation.navigate('VoucherScreen', { activeTab: 'available' });
    };

  // Sắp xếp voucher theo độ ưu tiên
  const sortedVouchers = useMemo(() => {
    return [...userVouchers].sort((a, b) => {
      const voucherA = typeof a.voucher_id === 'object' ? a.voucher_id : null;
      const voucherB = typeof b.voucher_id === 'object' ? b.voucher_id : null;
      
      if (!voucherA || !voucherB) return 0;
      
      // Kiểm tra điều kiện min_order_value
      const isValidA = !voucherA.min_order_value || orderValue >= voucherA.min_order_value;
      const isValidB = !voucherB.min_order_value || orderValue >= voucherB.min_order_value;
      
      // Voucher hợp lệ lên trên
      if (isValidA && !isValidB) return -1;
      if (!isValidA && isValidB) return 1;
      
      // Nếu cùng trạng thái, sắp xếp theo ngày hết hạn
      return dayjs(voucherA.end_date).diff(dayjs(voucherB.end_date));
    });
  }, [userVouchers, orderValue]);

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
    
    // 🎯 Kiểm tra điều kiện min_order_value
    const minOrderValue = v.min_order_value || 0;
    const isEligible = orderValue >= minOrderValue;
    const isDisabled = !isEligible && minOrderValue > 0;

    return (
      <TouchableOpacity 
        key={item._id}
        style={[
          styles.voucherCard, 
          isSelected && styles.selectedCard,
          isDisabled && styles.disabledCard
        ]}
        onPress={() => handleSelectVoucher(item)}
        disabled={isDisabled}
      >
        {/* Voucher Badge */}
        <View style={[styles.voucherBadge, isDisabled && styles.disabledBadge]}>
          <Text style={[styles.badgeText, isDisabled && styles.disabledBadgeText]}>
            {isDisabled ? 'KHÔNG ĐỦ ĐK' : 'VOUCHER'}
          </Text>
        </View>

        {/* Overlay for disabled vouchers */}
        {isDisabled && (
          <View style={styles.disabledOverlay}>
            <View style={styles.disabledContent}>
              <Ionicons name="lock-closed" size={20} color="#999" />
              <Text style={styles.disabledText}>
                Cần đơn tối thiểu {minOrderValue.toLocaleString('vi-VN')}₫
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.voucherBody, isDisabled && styles.disabledBody]}>
          <View style={styles.voucherLeft}>
            {/* Discount Circle */}
            <View style={[styles.discountCircle, isDisabled && styles.disabledCircle]}>
              <Text style={[styles.discountPercent, isDisabled && styles.disabledCircleText]}>
                {v.discount_percent ? `${v.discount_percent}%` : 'SALE'}
              </Text>
              <Text style={[styles.discountLabel, isDisabled && styles.disabledCircleText]}>OFF</Text>
            </View>
            
            <View style={styles.voucherContent}>
              <Text style={[styles.voucherTitle, isDisabled && styles.disabledText]} numberOfLines={2}>
                {v.description}
              </Text>
              <Text style={[styles.voucherCode, isDisabled && styles.disabledText]}>Mã: {v.code}</Text>
              {v.min_order_value && v.min_order_value > 0 && (
                <Text style={[
                  styles.minOrderText,
                  isDisabled ? styles.disabledMinOrderText : styles.enabledMinOrderText
                ]}>
                  Đơn tối thiểu: {v.min_order_value.toLocaleString('vi-VN')}₫
                </Text>
              )}
              
              {/* Expiry Info */}
              <View style={styles.expiryContainer}>
                <Ionicons name="time-outline" size={14} color={isDisabled ? "#ccc" : "#999"} />
                <Text style={[
                  styles.expiryText,
                  isExpiringSoon && !isDisabled && styles.expiryUrgent,
                  isDisabled && styles.disabledText
                ]}>
                  {daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Hết hạn hôm nay'}
                </Text>
                {isExpiringSoon && !isDisabled && (
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
              <View style={[styles.radioUnselected, isDisabled && styles.disabledRadio]} />
            )}
            
            {/* Detail Button */}
            <TouchableOpacity 
              style={[styles.detailButton, isDisabled && styles.disabledDetailButton]}
              onPress={() => handleShowDetail(item)}
            >
              <Text style={[styles.detailButtonText, isDisabled && styles.disabledText]}>Điều Kiện</Text>
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

  // Filter valid vouchers - sử dụng useMemo để tránh tính toán lại liên tục
  const sourceVouchers = data && data.length > 0 ? data : userVouchers;
  
  const validVouchers = useMemo(() => {
    if (!Array.isArray(sourceVouchers)) {
      return [];
    }

    const filtered = sourceVouchers.filter(item => {
      const v = item.voucher_id;
      const isValidStatus = item.status === 'active' || item.status === 'available';
      const hasValidVoucherObject = typeof v === 'object' && v.end_date;
      const isNotExpired = hasValidVoucherObject ? dayjs(v.end_date).isAfter(dayjs()) : false;
      
      return isValidStatus && hasValidVoucherObject && isNotExpired;
    });

    // 🎯 Sắp xếp voucher: voucher đủ điều kiện lên đầu
    return filtered.sort((a, b) => {
      const voucherA = typeof a.voucher_id === 'object' ? a.voucher_id : null;
      const voucherB = typeof b.voucher_id === 'object' ? b.voucher_id : null;
      
      if (!voucherA || !voucherB) return 0;
      
      const minOrderA = voucherA.min_order_value || 0;
      const minOrderB = voucherB.min_order_value || 0;
      
      const isEligibleA = orderValue >= minOrderA;
      const isEligibleB = orderValue >= minOrderB;
      
      // Voucher đủ điều kiện lên trên
      if (isEligibleA && !isEligibleB) return -1;
      if (!isEligibleA && isEligibleB) return 1;
      
      // Nếu cùng trạng thái, sắp xếp theo discount_percent giảm dần
      return (voucherB.discount_percent || 0) - (voucherA.discount_percent || 0);
    });
  }, [sourceVouchers, orderValue]);

  console.log('📊 VoucherCard - Source:', sourceVouchers?.length || 0, 'Valid:', validVouchers.length);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {renderHeader()}

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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

        {/* Nút Lưu thêm voucher */}
        <TouchableOpacity 
          style={styles.addMoreVoucherButton}
          onPress={handleNavigateToAvailableVouchers}
        >
          <View style={styles.addVoucherContent}>
            <Ionicons name="add-circle" size={24} color="#5C4033" />
            <View style={styles.addVoucherTextContainer}>
              <Text style={styles.addVoucherTitle}>Lưu thêm voucher</Text>
              <Text style={styles.addVoucherSubtitle}>Khám phá thêm ưu đãi hấp dẫn</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

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
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Voucher của Shop ({validVouchers.length})
                </Text>
              </View>
              
              {validVouchers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="ticket-outline" size={64} color="#ddd" />
                  <Text style={styles.emptyTitle}>Không có voucher khả dụng</Text>
                  <Text style={styles.emptyDesc}>
                    Bạn chưa có voucher nào hoặc voucher đã hết hạn
                  </Text>
                  <TouchableOpacity 
                    style={styles.exploreVouchersButton}
                    onPress={handleNavigateToAvailableVouchers}
                  >
                    <Text style={styles.exploreVouchersText}>Khám phá voucher</Text>
                  </TouchableOpacity>
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
                        {selectedVoucher.voucher_id.discount_percent ? `${selectedVoucher.voucher_id.discount_percent}%` : 'SALE'}
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
                    {selectedVoucher.voucher_id.min_order_value && selectedVoucher.voucher_id.min_order_value > 0 && (
                      <View style={styles.modalCondition}>
                        <Ionicons name="card-outline" size={16} color="#007AFF" />
                        <Text style={styles.modalConditionText}>
                          Đơn hàng tối thiểu {selectedVoucher.voucher_id.min_order_value.toLocaleString('vi-VN')}₫
                        </Text>
                      </View>
                    )}
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
  minOrderText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
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
  // 🎯 Styles cho disabled vouchers
  disabledCard: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  disabledBadge: {
    backgroundColor: '#ccc',
  },
  disabledBadgeText: {
    color: '#888',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 30,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  disabledContent: {
    alignItems: 'center',
    padding: 16,
  },
  disabledBody: {
    opacity: 0.7,
  },
  disabledCircle: {
    backgroundColor: '#ccc',
  },
  disabledCircleText: {
    color: '#888',
  },
  disabledText: {
    color: '#999',
  },
  disabledMinOrderText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  enabledMinOrderText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  disabledRadio: {
    borderColor: '#ccc',
  },
  disabledDetailButton: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  // 🎯 Styles cho section header và buttons
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  exploreVouchersButton: {
    backgroundColor: '#5C4033',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  exploreVouchersText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Styles cho nút "Lưu thêm voucher"
  addMoreVoucherButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#5C4033',
  },
  addVoucherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addVoucherTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  addVoucherTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  addVoucherSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default VoucherCard;