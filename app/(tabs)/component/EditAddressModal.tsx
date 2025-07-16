import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import data from '../../(tabs)/screens/address/vietnamAddress.json';
import { Address } from '../screens/profile/AddressList';
import { BASE_URL } from '../services/api';

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

interface EditAddressModalProps {
  visible: boolean;
  address: Address | null;
  onClose: () => void;
  onSaved: () => void;
}

const EditAddressModal: React.FC<EditAddressModalProps> = ({
  visible,
  address,
  onClose,
  onSaved
}) => {
  const [detailAddress, setDetailAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Hierarchical selection state
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [modalType, setModalType] = useState<'province' | 'district' | 'ward' | null>(null);

  // Normalize the data to ensure all Districts and Wards have Id and Name
  const normalizeProvinces = (provincesData: any[]): Province[] => {
    return provincesData.map((province) => ({
      Id: province.Id,
      Name: province.Name,
      Districts: (province.Districts || []).map((district: any) => ({
        Id: district.Id,
        Name: district.Name,
        Wards: (district.Wards || []).map((ward: any, idx: number) => ({
          Id: ward.Id ?? `${district.Id}_${idx}`,
          Name: ward.Name ?? '',
        })),
      })),
    }));
  };
  
  const provinces: Province[] = normalizeProvinces(data);
  const districts = selectedProvince?.Districts || [];
  const wards = selectedDistrict?.Wards || [];

  // Find province, district, ward by name
  const findProvinceByName = (name: string): Province | null => {
    return provinces.find(province => province.Name === name) || null;
  };

  const findDistrictByName = (province: Province, name: string): District | null => {
    return province.Districts.find(district => district.Name === name) || null;
  };

  const findWardByName = (district: District, name: string): Ward | null => {
    return district.Wards.find(ward => ward.Name === name) || null;
  };

  useEffect(() => {
    if (address) {
      setDetailAddress(address.detail_address || '');
      setName(address.name || '');
      setPhone(address.phone?.toString() || '');

      // Find and set province, district, ward based on address data
      if (address.city) {
        const province = findProvinceByName(address.city);
        setSelectedProvince(province);
        
        if (province && address.district) {
          const district = findDistrictByName(province, address.district);
          setSelectedDistrict(district);
          
          if (district && address.ward) {
            const ward = findWardByName(district, address.ward);
            setSelectedWard(ward);
          }
        }
      }
    }
  }, [address]);

  const handleSelectProvince = (province: Province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setModalType(null);
  };

  const handleSelectDistrict = (district: District) => {
    setSelectedDistrict(district);
    setSelectedWard(null);
    setModalType(null);
  };

  const handleSelectWard = (ward: Ward) => {
    setSelectedWard(ward);
    setModalType(null);
  };

  const handleSave = async () => {
    if (!detailAddress || !selectedProvince || !selectedDistrict || !selectedWard || !name || !phone) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    try {
      const payload = {
        detail_address: detailAddress,
        ward: selectedWard.Name,
        district: selectedDistrict.Name,
        city: selectedProvince.Name,
        name,
        phone,
      };

      await axios.put(`${BASE_URL}/addresses/${address?._id}`, payload);
      Alert.alert('Thành công', 'Đã cập nhật địa chỉ.');
      onSaved();
      onClose();
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật địa chỉ:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật địa chỉ.');
    }
  };

  const renderSelectionModal = (
    type: 'province' | 'district' | 'ward',
    options: any[],
    onSelect: (item: any) => void
  ) => (
    <Modal visible={modalType === type} animationType="slide">
      <View style={styles.selectionModalContainer}>
        <View style={styles.selectionModalHeader}>
          <Text style={styles.selectionModalTitle}>
            Chọn {type === 'province' ? 'Tỉnh/Thành phố' : type === 'district' ? 'Quận/Huyện' : 'Phường/Xã'}
          </Text>
        </View>
        <FlatList
          data={options}
          keyExtractor={(item) => item.Id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelect(item)} style={styles.selectionOptionItem}>
              <Text style={styles.selectionOptionText}>{item.Name}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity onPress={() => setModalType(null)} style={styles.selectionCancelButton}>
          <Text style={styles.selectionCancelText}>Hủy</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Sửa địa chỉ</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Tên người nhận"
            value={name}
            onChangeText={setName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="numeric"
          />

          {/* Tỉnh/Thành phố */}
          <Text style={styles.label}>Tỉnh/Thành phố</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setModalType('province')}>
            <Text style={styles.selectText}>
              {selectedProvince?.Name || 'Chọn Tỉnh/Thành phố'}
            </Text>
          </TouchableOpacity>

          {/* Quận/Huyện */}
          <Text style={styles.label}>Quận/Huyện</Text>
          <TouchableOpacity
            style={[styles.selectBox, !selectedProvince && styles.selectBoxDisabled]}
            onPress={() => selectedProvince && setModalType('district')}
            disabled={!selectedProvince}
          >
            <Text style={[styles.selectText, !selectedProvince && styles.selectTextDisabled]}>
              {selectedDistrict?.Name || 'Chọn Quận/Huyện'}
            </Text>
          </TouchableOpacity>

          {/* Phường/Xã */}
          <Text style={styles.label}>Phường/Xã</Text>
          <TouchableOpacity
            style={[styles.selectBox, !selectedDistrict && styles.selectBoxDisabled]}
            onPress={() => selectedDistrict && setModalType('ward')}
            disabled={!selectedDistrict}
          >
            <Text style={[styles.selectText, !selectedDistrict && styles.selectTextDisabled]}>
              {selectedWard?.Name || 'Chọn Phường/Xã'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Địa chỉ chi tiết (số nhà, tên đường...)"
            value={detailAddress}
            onChangeText={setDetailAddress}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Selection Modals */}
      {renderSelectionModal('province', provinces, handleSelectProvince)}
      {renderSelectionModal('district', districts, handleSelectDistrict)}
      {renderSelectionModal('ward', wards, handleSelectWard)}
    </Modal>
  );
};

export default EditAddressModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    maxHeight: '85%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#3E2723',
    letterSpacing: 0.5,
  },
  label: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#5D4037',
    fontSize: 15,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D7CCC8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#3E2723',
  },
  selectBox: {
    borderWidth: 1.5,
    borderColor: '#D7CCC8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    minHeight: 50,
    justifyContent: 'center',
  },
  selectBoxDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  selectText: {
    fontSize: 16,
    color: '#3E2723',
  },
  selectTextDisabled: {
    color: '#BDBDBD',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#8D6E63',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  cancelText: {
    color: '#8D6E63',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#6D4C41',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6D4C41',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Selection Modal Styles
  selectionModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  selectionModalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    backgroundColor: '#8D6E63',
  },
  selectionModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    letterSpacing: 0.5,
  },
  selectionOptionItem: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#fff',
  },
  selectionOptionText: {
    fontSize: 16,
    color: '#3E2723',
  },
  selectionCancelButton: {
    margin: 16,
    paddingVertical: 16,
    backgroundColor: '#6D4C41',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6D4C41',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  selectionCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});