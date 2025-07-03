import { Feather, Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import AddAddressModal from '../../component/AddAddressModal';
import EditAddressModal from '../../component/EditAddressModal';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

export interface Address {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  ward: string;
  district: string;
  city: string;
  detail_address: string;
  isDefault: boolean | string;
  latitude: string;
  longitude: string;
}

type RootStackParamList = {
  AddAddress: undefined;
  EditAddress: { address: Address };
};

const AddressListScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);  
const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [addModalVisible, setAddModalVisible] = useState(false);

  const fetchAddresses = async () => {
    try {
      const userID = await getUserData('userData');
      const response = await axios.get(`${BASE_URL}/GetAllAddress`);
      const allData = response.data?.data ?? [];

      const filtered = allData.filter((item: Address) => item.user_id?._id === userID);
      setAddresses(filtered);
      console.log('✅ Địa chỉ của user:', filtered);
    } catch (error) {
      console.error('❌ Lỗi lấy địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể tải địa chỉ. Vui lòng thử lại sau.');
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

const handleSetDefault = async (id: string) => {
  try {
    const userID = await getUserData('userData');

    // Bước 1: Lặp qua danh sách địa chỉ để xác định các địa chỉ của user
    const updates = addresses.map(addr => {
      const shouldBeDefault = addr._id === id;
      return axios.put(`${BASE_URL}/set-default/${addr._id}`, {
        isDefault: shouldBeDefault
      });
    });

    await Promise.all(updates); // Gửi đồng thời các request PUT

    // Bước 2: Cập nhật lại state local để đồng bộ UI
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr._id === id
      }))
    );

    Alert.alert('Thành công', 'Đã đặt địa chỉ mặc định');
  } catch (error) {
    console.error('❌ Lỗi cập nhật địa chỉ mặc định:', error);
    Alert.alert('Lỗi', 'Không thể cập nhật địa chỉ mặc định');
  }
};


  const handleDeleteAddress = (id: string) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa địa chỉ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/addresses/${id}`);
            setAddresses(prev => prev.filter(addr => addr._id !== id));
            Alert.alert('Thành công', 'Đã xóa địa chỉ');
          } catch (error) {
            console.error('❌ Lỗi xóa địa chỉ:', error);
            Alert.alert('Lỗi', 'Không thể xóa địa chỉ. Vui lòng thử lại.');
          }
        }
      }
    ]);
  };

  const renderAddressItem = ({ item }: { item: Address }) => {
    const isDefault = item.isDefault === true || item.isDefault === 'true';

    return (
      <View style={styles.addressItem}>
        <View style={styles.addressHeader}>
          <View style={styles.namePhoneContainer}>
            <Text style={styles.addressName}>{item.user_id?.name}</Text>
            <Text style={styles.addressPhone}>{item.user_id?.phone}</Text>
          </View>
          {isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Mặc định</Text>
            </View>
          )}
        </View>

        <Text style={styles.addressText}>
          {item.detail_address}, {item.ward}, {item.district}, {item.city}
        </Text>

        <View style={styles.addressActions}>
          <TouchableOpacity
            style={styles.actionButton}
           onPress={() => {
            setSelectedAddress(item);
            setEditModalVisible(true);
}}

          >
            <Feather name="edit-3" size={16} color="#795548" />
            <Text style={styles.actionText}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAddress(item._id)}
          >
            <Feather name="trash-2" size={16} color="#F44336" />
            <Text style={[styles.actionText, { color: '#F44336' }]}>Xóa</Text>
          </TouchableOpacity>

          {!isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetDefault(item._id)}
            >
              <Feather name="check-circle" size={16} color="#4CAF50" />
              <Text style={[styles.actionText, { color: '#4CAF50' }]}>Đặt mặc định</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách địa chỉ</Text>
        <TouchableOpacity
          style={styles.addButton}
         onPress={() => setAddModalVisible(true)}

        >
          <Ionicons name="add" size={24} color="#795548" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        renderItem={renderAddressItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

<TouchableOpacity
  style={styles.addAddressButton}
  onPress={() => setAddModalVisible(true)}
>
  <Ionicons name="add" size={20} color="#fff" />
  <Text style={styles.addAddressText}>Thêm địa chỉ mới</Text>
</TouchableOpacity>

      <EditAddressModal
  visible={editModalVisible}
  address={selectedAddress}
  onClose={() => setEditModalVisible(false)}
  onSaved={fetchAddresses}
/>

<AddAddressModal
  visible={addModalVisible}
  onClose={() => setAddModalVisible(false)}
  onSaved={fetchAddresses}
/>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#222' },
  addButton: { padding: 8 },
  listContainer: { padding: 16, paddingBottom: 100 },
  addressItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  namePhoneContainer: { flex: 1 },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  addressPhone: { fontSize: 14, color: '#666' },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 16,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#795548',
    marginLeft: 4,
    fontWeight: '500',
  },
  addAddressButton: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: '#795548',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addAddressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AddressListScreen;
