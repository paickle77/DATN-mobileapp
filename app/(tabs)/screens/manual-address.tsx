import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import data from './vietnamAddress.json';

type RootStackParamList = {
  Address: {
    address?: string;
  };
  SelectLocation: undefined;
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
  const [selectedAddress, setSelectedAddress] = useState<AddressSelection>({
    province: null,
    district: null,
    ward: null,
    detail: '',
  });

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
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
      const fullAddress = `${selectedAddress.detail ? selectedAddress.detail + ', ' : ''}${selectedAddress.ward.Name}, ${selectedAddress.district.Name}, ${selectedAddress.province.Name}`;
      navigation.navigate('Address', {
        address: fullAddress,
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
        <FlatList
          data={options}
          keyExtractor={(item) => item.Id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelect(item)} style={styles.optionItem}>
              <Text>{item.Name}</Text>
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
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
        Chọn địa chỉ
      </Text>
      <Text style={styles.label}>Tỉnh/Thành phố</Text>
      <TouchableOpacity style={styles.selectBox} onPress={() => setModalType('province')}>
        <Text>{selectedAddress.province?.Name || 'Chọn Tỉnh/Thành phố'}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Quận/Huyện</Text>
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => selectedAddress.province && setModalType('district')}
        disabled={!selectedAddress.province}
      >
        <Text>{selectedAddress.district?.Name || 'Chọn Quận/Huyện'}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Phường/Xã</Text>
      <TouchableOpacity
        style={styles.selectBox}
        onPress={() => selectedAddress.district && setModalType('ward')}
        disabled={!selectedAddress.district}
      >
        <Text>{selectedAddress.ward?.Name || 'Chọn Phường/Xã'}</Text>
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
          <Text style={styles.resultText}>Địa chỉ đã chọn:</Text>
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

      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#007aff',
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: 'center',
            opacity: isAddressComplete ? 1 : 0.5,
          }}
          onPress={handleConfirmLocation}
          disabled={!isAddressComplete}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
            Xác nhận vị trí
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  optionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelButton: {
    marginTop: 20,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  cancelText: {
    color: 'red',
  },
  resultBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#e6ffed',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 14,
  },
});

export default HierarchicalAddressSelector;
