import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
interface DeliveredOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'COD' | 'ONLINE';
  deliveredAt: string;
  deliveryTime: number; // minutes
  customerRating?: number;
  customerNote?: string;
  tips?: number;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface FilterOption {
  label: string;
  value: string;
  count: number;
}

const DeliveredOrders: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - dữ liệu cứng tạm
  const deliveredOrders: DeliveredOrder[] = [
    {
      id: '1',
      orderNumber: 'DH001',
      customerName: 'Trần Thị Lan',
      customerPhone: '0901234567',
      address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
      items: [
        { name: 'Phở bò tái', quantity: 2, price: 65000 },
        { name: 'Nước cam', quantity: 1, price: 25000 }
      ],
      subtotal: 155000,
      shippingFee: 15000,
      total: 170000,
      paymentMethod: 'COD',
      deliveredAt: '2024-01-15 14:30',
      deliveryTime: 25,
      customerRating: 5,
      tips: 10000
    },
    {
      id: '2',
      orderNumber: 'DH002',
      customerName: 'Lê Minh Đức',
      customerPhone: '0912345678',
      address: '456 Lê Lợi, Phường 2, Quận 3, TP.HCM',
      items: [
        { name: 'Bánh mì thịt nướng', quantity: 1, price: 35000 },
        { name: 'Cà phê sữa đá', quantity: 2, price: 20000 }
      ],
      subtotal: 75000,
      shippingFee: 12000,
      total: 87000,
      paymentMethod: 'ONLINE',
      deliveredAt: '2024-01-15 13:45',
      deliveryTime: 18,
      customerRating: 4,
      customerNote: 'Giao hàng nhanh, đóng gói cẩn thận'
    },
    {
      id: '3',
      orderNumber: 'DH003',
      customerName: 'Phạm Thu Hà',
      customerPhone: '0923456789',
      address: '789 Điện Biên Phủ, Phường 1, Quận Bình Thạnh, TP.HCM',
      items: [
        { name: 'Cơm gà Hải Nam', quantity: 1, price: 55000 },
        { name: 'Chè ba màu', quantity: 1, price: 18000 },
        { name: 'Trà đá', quantity: 2, price: 5000 }
      ],
      subtotal: 83000,
      shippingFee: 18000,
      total: 101000,
      paymentMethod: 'COD',
      deliveredAt: '2024-01-15 12:20',
      deliveryTime: 32,
      customerRating: 5,
      tips: 5000
    },
    {
      id: '4',
      orderNumber: 'DH004',
      customerName: 'Hoàng Văn Nam',
      customerPhone: '0934567890',
      address: '321 Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
      items: [
        { name: 'Bún bò Huế', quantity: 1, price: 45000 },
        { name: 'Nem nướng', quantity: 3, price: 15000 }
      ],
      subtotal: 90000,
      shippingFee: 10000,
      total: 100000,
      paymentMethod: 'ONLINE',
      deliveredAt: '2024-01-15 11:15',
      deliveryTime: 22
    },
    {
      id: '5',
      orderNumber: 'DH005',
      customerName: 'Nguyễn Thị Mai',
      customerPhone: '0945678901',
      address: '654 Pasteur, Phường 1, Quận 1, TP.HCM',
      items: [
        { name: 'Pizza hải sản', quantity: 1, price: 185000 },
        { name: 'Coca Cola', quantity: 2, price: 15000 }
      ],
      subtotal: 215000,
      shippingFee: 20000,
      total: 235000,
      paymentMethod: 'COD',
      deliveredAt: '2024-01-15 10:30',
      deliveryTime: 28,
      customerRating: 4,
      customerNote: 'Pizza còn nóng, rất ngon!'
    }
  ];

  const filterOptions: FilterOption[] = [
    { label: 'Tất cả', value: 'all', count: deliveredOrders.length },
    { label: 'COD', value: 'COD', count: deliveredOrders.filter(o => o.paymentMethod === 'COD').length },
    { label: 'Online', value: 'ONLINE', count: deliveredOrders.filter(o => o.paymentMethod === 'ONLINE').length },
    { label: 'Có tip', value: 'tips', count: deliveredOrders.filter(o => o.tips && o.tips > 0).length },
  ];

  const filteredOrders = deliveredOrders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'tips' ? (order.tips && order.tips > 0) : order.paymentMethod === selectedFilter);
    
    return matchesSearch && matchesFilter;
  });

  const totalEarnings = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalTips = filteredOrders.reduce((sum, order) => sum + (order.tips || 0), 0);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Đã cập nhật', 'Danh sách đơn hàng mới nhất');
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={14}
            color="#F59E0B"
          />
        ))}
      </View>
    );
  };

  const renderOrderCard = ({ item }: { item: DeliveredOrder }) => (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.8}
      onPress={() => Alert.alert('Chi tiết đơn hàng', `Đơn hàng ${item.orderNumber}`)}
    >
      {/* Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
          <Text style={styles.deliveryTime}>⏱️ {item.deliveryTime} phút</Text>
        </View>
        <View style={styles.paymentBadge}>
          <Text style={[styles.paymentText, { 
            color: item.paymentMethod === 'COD' ? '#DC2626' : '#059669' 
          }]}>
            {item.paymentMethod}
          </Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.customerSection}>
        <View style={styles.customerInfo}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <Text style={styles.customerName}>{item.customerName}</Text>
          <TouchableOpacity onPress={() => Alert.alert('Gọi điện', item.customerPhone)}>
            <Ionicons name="call-outline" size={16} color="#4F46E5" />
          </TouchableOpacity>
        </View>
        <View style={styles.addressInfo}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
        </View>
      </View>

      {/* Items Summary */}
      <View style={styles.itemsSection}>
        <Text style={styles.itemsTitle}>Món ăn ({item.items.length}):</Text>
        {item.items.map((orderItem, index) => (
          <Text key={index} style={styles.itemText}>
            • {orderItem.name} x{orderItem.quantity}
          </Text>
        ))}
      </View>

      {/* Rating & Note */}
      {(item.customerRating || item.customerNote) && (
        <View style={styles.feedbackSection}>
          {item.customerRating && (
            <View style={styles.ratingRow}>
              {renderStars(item.customerRating)}
              <Text style={styles.ratingText}>({item.customerRating}/5)</Text>
            </View>
          )}
          {item.customerNote && (
            <Text style={styles.customerNote}>💬 "{item.customerNote}"</Text>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.orderFooter}>
        <View style={styles.timeInfo}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.deliveredTime}>{formatTime(item.deliveredAt)}</Text>
        </View>
        <View style={styles.priceInfo}>
          {item.tips && (
            <Text style={styles.tips}>Tip: {formatCurrency(item.tips)}</Text>
          )}
          <Text style={styles.totalAmount}>{formatCurrency(item.total)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Không có đơn hàng</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào được giao'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <LinearGradient colors={['#1F2937', '#374151']} style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng đã giao</Text>
        <Text style={styles.headerSubtitle}>
          {filteredOrders.length} đơn • {formatCurrency(totalEarnings)}
          {totalTips > 0 && ` • Tip: ${formatCurrency(totalTips)}`}
        </Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên khách, mã đơn, địa chỉ..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterTab,
              selectedFilter === filter.value && styles.filterTabActive
            ]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.value && styles.filterTextActive
            ]}>
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 12,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customerSection: {
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  itemsSection: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  feedbackSection: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  customerNote: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveredTime: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  tips: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default DeliveredOrders;