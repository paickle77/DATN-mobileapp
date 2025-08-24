import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import moment from 'moment';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

export default function CommissionScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'day' | 'month'>('month');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM'));
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false); 

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const shipperId = await getUserData('shipperID');
      const res = await axios.get(`${BASE_URL}/GetAllBills`);
      const data = res.data.data;
      const ordersData = data.filter(
        (order: any) => order.shipper_id === shipperId && order.status === 'done'
      );

      const filtered = ordersData.filter((order: any) => {
        const date = moment(order.delivered_at);
        return filterType === 'month'
          ? date.format('YYYY-MM') === selectedDate
          : date.format('YYYY-MM-DD') === selectedDate;
      });

      setOrders(filtered);

      const commission = filtered.reduce((sum: number, order: any) => {
        return sum + (order.shipping_fee || 0) * 0.5;
      }, 0);

      setTotalCommission(commission);
    } catch (error) {
      console.error('❌ Lỗi load hoa hồng:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [filterType, selectedDate])
  );

  const onChangeDate = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) {
      if (filterType === 'month') {
        setSelectedDate(moment(date).format('YYYY-MM'));
      } else {
        setSelectedDate(moment(date).format('YYYY-MM-DD'));
      }
    }
  };

  // Hàm lùi ngày/tháng
  const handlePrev = () => {
    if (filterType === 'day') {
      setSelectedDate(moment(selectedDate, 'YYYY-MM-DD').subtract(1, 'day').format('YYYY-MM-DD'));
    } else {
      setSelectedDate(moment(selectedDate, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM'));
    }
  };

  // Hàm tiến ngày/tháng
  const handleNext = () => {
    if (filterType === 'day') {
      setSelectedDate(moment(selectedDate, 'YYYY-MM-DD').add(1, 'day').format('YYYY-MM-DD'));
    } else {
      setSelectedDate(moment(selectedDate, 'YYYY-MM').add(1, 'month').format('YYYY-MM'));
    }
  };

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderIdText}>#{item._id.slice(-6)}</Text>
        <Text style={styles.commissionText}>
          +{(item.shipping_fee * 0.5)?.toLocaleString()}đ
        </Text>
      </View>
      <Text style={styles.orderValueText}>
        Giá trị đơn hàng: {item.total?.toLocaleString()}đ
      </Text>
      <Text style={styles.dateText}>
        {moment(item.delivered_at).format('DD/MM/YYYY HH:mm')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Hoa hồng</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Tổng thu nhập</Text>
          <Text style={styles.totalAmount}>
            {totalCommission.toLocaleString()}đ
          </Text>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'day' && styles.filterButtonActive
            ]}
            onPress={() => {
              setFilterType('day');
              setSelectedDate(moment().format('YYYY-MM-DD'));
            }}
          >
            <Text style={[
              styles.filterButtonText,
              filterType === 'day' && styles.filterButtonTextActive
            ]}>
              Theo ngày
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'month' && styles.filterButtonActive
            ]}
            onPress={() => {
              setFilterType('month');
              setSelectedDate(moment().format('YYYY-MM'));
            }}
          >
            <Text style={[
              styles.filterButtonText,
              filterType === 'month' && styles.filterButtonTextActive
            ]}>
              Theo tháng
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateSelector}>
          <TouchableOpacity 
            style={styles.navigationButton}
            onPress={handlePrev}
          >
            <Text style={styles.navigationIcon}>‹</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dateSelectorCenter}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.dateSelectorText}>
              {filterType === 'month' ? 
                moment(selectedDate, 'YYYY-MM').format('MM/YYYY') :
                moment(selectedDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
              }
            </Text>
            <Text style={styles.dateSelectorIcon}>📅</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navigationButton}
            onPress={handleNext}
          >
            <Text style={styles.navigationIcon}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={moment(selectedDate, filterType === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD').toDate()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
        />
      )}

      {/* Orders List */}
      <View style={styles.ordersList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#634838" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrder}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>📭</Text>
                <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
                <Text style={styles.emptySubtitle}>
                  Không có đơn hàng nào trong khoảng thời gian này
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  // Header Styles
  headerSection: {
    backgroundColor: '#634838',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  totalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Filter Styles
  filterSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterButtons: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#634838',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateSelectorCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  navigationButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#634838',
  },
  dateSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#634838',
  },
  dateSelectorIcon: {
    fontSize: 18,
  },

  // Orders List Styles
  ordersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  commissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  orderValueText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});