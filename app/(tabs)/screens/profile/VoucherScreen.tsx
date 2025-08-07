import { Feather } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
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
  const navigation = useNavigation();
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

  const handleGoBack = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'TabNavigator', params: { screen: 'Profile' } }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#5C4033" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
        
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voucher & Khuyến mãi</Text>
        <View style={styles.editButton} />
      </View>

      <View style={styles.container}>
        {/* Tab Container with improved design */}
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
                activeTab === 'available' ? styles.activeTabText : styles.inactiveTabText,
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
                activeTab === 'saved' ? styles.activeTabText : styles.inactiveTabText,
              ]}
            >
              🎉 Đã lưu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'available' ? (
            <AvailableVoucherList
              data={availableVouchers}
              userVouchers={userVouchers}
              onSave={handleVoucherSaved}
            />
          ) : (
            <UserVoucherList data={userVouchers} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#5C4033',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#5C4033',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F6F4',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 25,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#5C4033',
    elevation: 2,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  activeTabText: {
    color: '#fff',
  },
  inactiveTabText: {
    color: '#5C4033',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  editButton: {
    padding: 8,
  },
});

export default VoucherScreen;