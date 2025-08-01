import { Feather, Ionicons } from '@expo/vector-icons';
import { NavigationProp, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState, } from 'react';
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
import { getUserData, saveUserData } from '../utils/storage';

export interface Address {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  name: string;
  phone: number;
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
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const route = useRoute();
  const mode = (route.params as any)?.mode ?? 'view';

  const fetchAddresses = async () => {
    try {
      const user = await getUserData('userData');
      const userID = user;
      const response = await axios.get(`${BASE_URL}/GetAllAddress`);
      const allData = response.data?.data ?? [];
      const filtered = allData.filter((item: Address) => item.user_id?._id === userID);
      setAddresses(filtered);
    } catch (error) {
      console.error('❌ Lỗi lấy địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể tải địa chỉ. Vui lòng thử lại sau.');
    }
  };



  useEffect(() => {
    const init = async () => {
      await fetchAddresses();

      if (mode === 'select') {
        const selected = await getUserData('selectedAddress');
        if (selected && selected._id) {
          setSelectedAddressId(selected._id);
        }
      }
    };

    init();
  }, []);

  const handleSetDefault = async (id: string) => {
    try {
      await axios.put(`${BASE_URL}/set-default/${id}`);
      fetchAddresses();
      Alert.alert('Thành công', 'Đã đặt địa chỉ mặc định');
    } catch (error) {
      console.error('❌ Lỗi cập nhật địa chỉ mặc định:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật địa chỉ mặc định');
    }
  };

  const handleDeleteAddress = (id: string) => {
    const addressToDelete = addresses.find(addr => addr._id === id);

    if (addressToDelete?.isDefault === true || addressToDelete?.isDefault === 'true') {
      Alert.alert('Không thể xóa', 'Đây là địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước khi xóa.');
      return;
    }

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

  const handleSelectAddress = async (address: Address) => {
    setSelectedAddressId(address._id);
    await saveUserData({ key: 'selectedAddress', value: address });
    // Có thể thêm delay nhỏ để user thấy animation
    setTimeout(() => {
      navigation.goBack();
    }, 200);
  };

  const renderAddressItem = ({ item }: { item: Address }) => {
    const isDefault = item.isDefault === true || item.isDefault === 'true';
    const isSelected = selectedAddressId === item._id;

    return (
      <TouchableOpacity
        style={[
          styles.addressItem,
          mode === 'select' && styles.selectModeItem,
          mode === 'select' && isSelected && styles.selectedItem
        ]}
        onPress={mode === 'select' ? () => handleSelectAddress(item) : undefined}
        activeOpacity={mode === 'select' ? 0.7 : 1}
      >
        <View style={styles.addressContent}>
          {/* Radio button cho mode select */}
          {mode === 'select' && (
            <View style={styles.radioButtonContainer}>
              <View style={[
                styles.radioButton,
                isSelected && styles.radioButtonSelected
              ]}>
                {isSelected && <View style={styles.radioButtonInner} />}
              </View>
            </View>
          )}

          <View style={styles.addressInfo}>
            <View style={styles.addressHeader}>
              <View style={styles.namePhoneContainer}>
                <Text style={styles.addressName}>{item.name}</Text>
                <Text style={styles.addressPhone}>{item.phone}</Text>
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

            {/* Actions cho mode view */}
            {mode !== 'select' && (
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
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'select' ? 'Chọn địa chỉ giao hàng' : 'Danh sách địa chỉ'}
        </Text>
        {mode !== 'select' ? (
          <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <Ionicons name="add" size={24} color="#795548" />
          </TouchableOpacity>
        ) : (
          <View style={styles.addButton} />
        )}
      </View>

      <FlatList
        data={addresses}
        renderItem={renderAddressItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {mode !== 'select' && (
        <TouchableOpacity
          style={styles.addAddressButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addAddressText}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      )}

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
  selectModeItem: {
    borderWidth: 2,
    borderColor: '#e8e8e8',
  },
  selectedItem: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF8F6',
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 80,
  },
  addressInfo: {
    flex: 1,
  },
  radioButtonContainer: {
    paddingRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minHeight: 80,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B35',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
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

  // Styles cho radio button (thay thế cho nút select cũ)
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