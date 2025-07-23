import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AvailableVoucherList from '../../component/AvailableVoucherList';
import UserVoucherList from '../../component/UserVoucherList';
import voucherService, {
    UserVoucher,
    Voucher,
} from '../../services/VoucherService';

const VoucherScreen = () => {
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'saved'>('available');

  const loadData = async () => {
    try {
      const [vouchersRes, userVouchersRes] = await Promise.all([
        voucherService.getAllVouchers(),
        voucherService.getUserVouchers(),
      ]);
      setAvailableVouchers(vouchersRes.data);
      setUserVouchers(userVouchersRes.data);
    } catch (err) {
      console.error('❌ Lỗi khi load dữ liệu:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVoucherSaved = async (voucher: Voucher) => {
    await loadData(); // ✅ Cập nhật lại UI sau khi lưu
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'available' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('available')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab !== 'available' && { color: '#5C4033' },
            ]}
          >
            📢 Có sẵn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'saved' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('saved')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab !== 'saved' && { color: '#5C4033' },
            ]}
          >
            🎉 Đã lưu
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {activeTab === 'available' ? (
          <AvailableVoucherList
  data={availableVouchers}
  userVouchers={userVouchers} // ✅ truyền thêm props này
  onSave={handleVoucherSaved}
/>

        ) : (
          <UserVoucherList data={userVouchers} />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'center',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#EFE9E1',
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D6CBBE',
  },
  activeTab: {
    backgroundColor: '#5C4033',
  },
  tabText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default VoucherScreen;
