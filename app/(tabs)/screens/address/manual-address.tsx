import { NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import data from './vietnamAddress.json';

type RootStackParamList = {
    Address: {
        address?: string;
        email?: string;
        password?: string;
        fullName?: string;
        phone?: string;
        gender?: string;
        avatar?: string;
        account_id: string;
        user_id?: string;
    };
    ManualAddress: {
        email?: string;
        password?: string;
        fullName?: string;
        phone?: string;
        gender?: string;
        avatar?: string;
        account_id: string;
        user_id?: string;
    };
};

interface Province {
  Id: string;
  Name: string;
  Districts: District[];
}

interface District {
  Id: string;
  Name: string;
  Wards: Ward[];
}

interface Ward {
  Id: string;
  Name: string;
}

interface AddressSelection {
  province: Province | null;
  district: District | null;
  ward: Ward | null;
  detail?: string;
}

interface Props {
  onAddressChange?: (address: AddressSelection) => void;
}

const HierarchicalAddressSelector: React.FC<Props> = ({ onAddressChange }) => {

  const haNoi = data.find((p) => p.Name === 'Thành phố Hà Nội') || null;

  const [selectedAddress, setSelectedAddress] = useState<AddressSelection>({
    province: haNoi,
    district: null,
    ward: null,
    detail: '',
  });

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ManualAddress'>>();
  
  const [modalType, setModalType] = useState<'province' | 'district' | 'ward' | null>(null);

  const provinces = data;
  const districts = selectedAddress.province?.Districts || [];
  const wards = selectedAddress.district?.Wards || [];

  const handleSelectProvince = (province: Province) => {
    const newAddress = { province, district: null, ward: null, detail: '' };
    setSelectedAddress(newAddress);
    setModalType(null);
    onAddressChange?.(newAddress);
  };

  const handleSelectDistrict = (district: District) => {
    const newAddress = { ...selectedAddress, district, ward: null };
    setSelectedAddress(newAddress);
    setModalType(null);
    onAddressChange?.(newAddress);
  };

  const handleSelectWard = (ward: Ward) => {
    const newAddress = { ...selectedAddress, ward };
    setSelectedAddress(newAddress);
    setModalType(null);
    onAddressChange?.(newAddress);
  };

  const handleDetailChange = (text: string) => {
    const newAddress = { ...selectedAddress, detail: text };
    setSelectedAddress(newAddress);
    onAddressChange?.(newAddress);
  };

  const handleConfirmLocation = () => {
    if (selectedAddress.province && selectedAddress.district && selectedAddress.ward) {
      // Tạo địa chỉ đầy đủ
      const fullAddress = `${selectedAddress.detail ? selectedAddress.detail + ', ' : ''}${selectedAddress.ward?.Name}, ${selectedAddress.district?.Name}, ${selectedAddress.province?.Name}`;
      
      console.log('[ManualAddress] Navigating back to Address with:', {
        address: fullAddress,
        account_id: route.params?.account_id,
        user_id: route.params?.user_id
      });

      (navigation as any).navigate('Address', {
        address: fullAddress,
        // Đảm bảo truyền lại tất cả thông tin bao gồm ID
        account_id: route.params?.account_id,
        user_id: route.params?.user_id,
        email: route.params?.email,
        password: route.params?.password,
        fullName: route.params?.fullName,
        phone: route.params?.phone,
        gender: route.params?.gender,
        avatar: route.params?.avatar,
      });
    } else {
      Alert.alert('Vui lòng chọn đầy đủ Tỉnh, Huyện và Xã');
    }
  };

  const renderModal = (
    type: 'province' | 'district' | 'ward',
    options: any[],
    onSelect: (item: any) => void
  ) => (
    <Modal visible={modalType === type} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Chọn {type === 'province' ? 'Tỉnh/Thành phố' : type === 'district' ? 'Quận/Huyện' : 'Phường/Xã'}
          </Text>
        </View>
        <FlatList
          data={options}
          keyExtractor={(item) => item.Id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelect(item)} style={styles.optionItem}>
              <Text style={styles.optionText}>{item.Name}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity onPress={() => setModalType(null)} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Hủy</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const isAddressComplete =
    !!selectedAddress.province && !!selectedAddress.district && !!selectedAddress.ward;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn địa chỉ</Text>
      

      <Text style={styles.label}>Tỉnh/Thành phố</Text>
      <TouchableOpacity style={styles.selectBox} onPress={() => setModalType('province')}>
        <Text style={styles.selectText}>
          {selectedAddress.province?.Name || 'Chọn Tỉnh/Thành phố'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Quận/Huyện</Text>
      <TouchableOpacity
        style={[styles.selectBox, !selectedAddress.province && styles.selectBoxDisabled]}
        onPress={() => selectedAddress.province && setModalType('district')}
        disabled={!selectedAddress.province}
      >
        <Text style={[styles.selectText, !selectedAddress.province && styles.selectTextDisabled]}>
          {selectedAddress.district?.Name || 'Chọn Quận/Huyện'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Phường/Xã</Text>
      <TouchableOpacity
        style={[styles.selectBox, !selectedAddress.district && styles.selectBoxDisabled]}
        onPress={() => selectedAddress.district && setModalType('ward')}
        disabled={!selectedAddress.district}
      >
        <Text style={[styles.selectText, !selectedAddress.district && styles.selectTextDisabled]}>
          {selectedAddress.ward?.Name || 'Chọn Phường/Xã'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Địa chỉ chi tiết</Text>
      <TextInput
        style={styles.inputBox}
        placeholder="Số nhà, tên đường..."
        value={selectedAddress.detail}
        onChangeText={handleDetailChange}
      />

      {selectedAddress.ward && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Địa chỉ đã chọn:</Text>
          <Text style={styles.resultText}>
            {selectedAddress.detail ? selectedAddress.detail + ', ' : ''}
            {selectedAddress.ward.Name}, {selectedAddress.district?.Name},{' '}
            {selectedAddress.province?.Name}
          </Text>
        </View>
      )}

      {renderModal('province', provinces, handleSelectProvince)}
      {renderModal('district', districts, handleSelectDistrict)}
      {renderModal('ward', wards, handleSelectWard)}

      <TouchableOpacity
        style={[styles.confirmButton, !isAddressComplete && styles.confirmButtonDisabled]}
        onPress={handleConfirmLocation}
        disabled={!isAddressComplete}
      >
        <Text style={[styles.confirmButtonText, !isAddressComplete && styles.confirmButtonTextDisabled]}>
          Xác nhận vị trí
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  debugContainer: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    color: '#333',
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  selectBoxDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  selectTextDisabled: {
    color: '#999',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginTop: 4,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  resultBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 16,
    color: '#2e7d32',
  },
  confirmButton: {
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: '#6B4F35',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmButtonTextDisabled: {
    color: '#999',
  },
});

export default HierarchicalAddressSelector;