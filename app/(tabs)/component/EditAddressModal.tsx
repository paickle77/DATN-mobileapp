import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Address } from '../screens/profile/AddressList'; // hoặc điều chỉnh đúng path
import { BASE_URL } from '../services/api';

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
  const [ward, setWard] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (address) {
      setDetailAddress(address.detail_address || '');
      setWard(address.ward || '');
      setDistrict(address.district || '');
      setCity(address.city || '');
    }
  }, [address]);

  const handleSave = async () => {
    if (!detailAddress || !ward || !district || !city) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    try {
      const payload = {
        detail_address: detailAddress,
        ward,
        district,
        city,
      };

      await axios.put(`${BASE_URL}/addresses/${address?._id}`, payload);
      Alert.alert('Thành công', 'Đã cập nhật địa chỉ.');
      onSaved(); // callback để refresh danh sách
      onClose(); // đóng modal
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật địa chỉ:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật địa chỉ.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Sửa địa chỉ</Text>

          <TextInput
            style={styles.input}
            placeholder="Địa chỉ chi tiết"
            value={detailAddress}
            onChangeText={setDetailAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Phường / Xã"
            value={ward}
            onChangeText={setWard}
          />
          <TextInput
            style={styles.input}
            placeholder="Quận / Huyện"
            value={district}
            onChangeText={setDistrict}
          />
          <TextInput
            style={styles.input}
            placeholder="Tỉnh / Thành phố"
            value={city}
            onChangeText={setCity}
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
    </Modal>
  );
};

export default EditAddressModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  cancelButton: {
    marginRight: 12,
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#5C4033',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
  },
});
