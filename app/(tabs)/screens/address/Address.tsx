import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AddressService } from '../../services/AddressService';
import AuthUtils from '../../utils/auth.utils';
import { getUserData, saveUserData } from '../utils/storage';

type RootStackParamList = {
  CompleteProfile: {
    address?: string;
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    gender?: string;
    avatar?: string;
    id: string;
  };
  Address: {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    gender?: string;
    avatar?: string;
    account_id: string;
    user_id?: string; // ✅ THÊM: Thêm user_id
    latitude?: string;
    longitude?: string;
    address?: string;
    profile_id?: string;
  };
};

const AddressScreen = () => {
  const navigation = useNavigation() as any;
  const route = useRoute<RouteProp<RootStackParamList, 'Address'>>();
  const { fullName, phone } = route.params;
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (route.params) {
      const {
        account_id,
        user_id,
        fullName,
        phone,
        avatar,
        latitude,
        longitude,
        address
      } = route.params || {};

      setLocationData({
        latitude: latitude || '',
        longitude: longitude || '',
        address: address || ''
      });

      const finalAccountId = account_id; // ✅ Sử dụng account_id
      const finalUserId = user_id || route.params?.profile_id; // ✅ Sử dụng user_id hoặc profile_id
      console.log('Account ID nhận được từ CompleteProfile:', finalAccountId);
      console.log('User ID nhận được từ CompleteProfile:', finalUserId);
      console.log('Vĩ độ (latitude):', latitude);
      console.log('Kinh độ (longitude):', longitude);
    }
  }, [route.params]);

  const displayAddress = locationData.address
    ? locationData.address
    : locationData.latitude && locationData.longitude
      ? `Lat: ${locationData.latitude}, Lng: ${locationData.longitude}`
      : 'Chưa có địa chỉ được chọn';

  const handleCompleteAddress = async () => {
    if (!locationData.address && !locationData.latitude && !locationData.longitude) {
      Alert.alert('Thông báo', 'Vui lòng chọn địa chỉ trước khi tiếp tục!');
      return;
    }

    setIsLoading(true);
    try {
      const { latitude, longitude, address } = locationData;

      let addressData: any = {
        name: fullName,
        phone: phone,
        province: 'Hà Nội', // 🚀 Ship trong Hà Nội
      };

      if (address) {
        const parsedAddress = AddressService.parseAddressString(address);
        addressData = { ...addressData, ...parsedAddress, province: 'Hà Nội' };
      } else if (latitude && longitude) {
        addressData = { ...addressData, latitude, longitude };
      }

      console.log('🔼 Dữ liệu gửi lên API:', JSON.stringify(addressData, null, 2));

      const finalAccountId = route.params?.account_id;
      if (!finalAccountId) {
        Alert.alert('Lỗi', 'Không tìm thấy account ID. Vui lòng thử lại!');
        return;
      }

      // ✅ Gọi API và nhận object địa chỉ mới
      const newAddress = await AddressService.createFirstAddress(finalAccountId, addressData);
      console.log('✅ Địa chỉ mặc định đã được lưu thành công:', newAddress);
    console.log('📦 Địa chỉ mới:',newAddress);
      // ✅ Lưu toàn bộ ID vào AsyncStorage
      await saveUserData({ key: 'accountId', value: finalAccountId });
      if (route.params?.user_id) {
        await saveUserData({ key: 'userId', value: route.params.user_id });
      }
      if (route.params?.profile_id) {
        await saveUserData({ key: 'profileId', value: route.params.profile_id });
      }
      await saveUserData({ key: 'userName', value: fullName || '' });
      await saveUserData({ key: 'userPhone', value: phone || '' });
      await saveUserData({ key: 'userEmail', value: route.params?.email || '' });

      // ✅ Lưu full address object và addressId
      if (newAddress && newAddress._id) {
        await saveUserData({ key: 'addressId', value: newAddress._id });
        await saveUserData({ key: 'defaultAddress', value: JSON.stringify(newAddress) }); // ✅ Lưu full object
        console.log('📦 Address ID từ API:', newAddress._id);
        console.log('📦 Full Address từ API:', JSON.stringify(newAddress, null, 2));
      }

      Alert.alert('Thành công', 'Địa chỉ đã được lưu thành công!', [
        { 
          text: 'OK', 
          onPress: async () => {
            // ✅ Lấy role từ storage để điều hướng đúng
            const userRole = await getUserData('userRole');
            console.log('🎯 Hoàn thành registration flow, điều hướng với role:', userRole);
            AuthUtils.handlePostAuthNavigation(navigation, userRole || 'user');
          }
        }
      ]);

    } catch (error: any) {
      console.error('❌ Lỗi khi gửi API:', error?.response?.data || error.message);
      Alert.alert('Lỗi', error?.response?.data?.message || error.message || 'Không thể lưu địa chỉ. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Image
          source={require('@/assets/images/address.png')}
          style={{ width: 150, height: 150, resizeMode: 'contain' }}
        />
      </View>
      <Text style={styles.title}>Vị trí của bạn là gì?</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Địa chỉ đã chọn:</Text>
        <View style={styles.resultBox}>
          <Text style={styles.addressText}>{displayAddress}</Text>
        </View>
      </View>

      <View style={styles.bottomButtonContainer}>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            const accountId = route.params?.account_id;
            const userId = route.params?.user_id || route.params?.profile_id;
            navigation.navigate('ManualAddress', {
              email: route.params?.email,
              password: route.params?.password,
              fullName: route.params?.fullName,
              phone: route.params?.phone,
              gender: route.params?.gender,
              avatar: route.params?.avatar,
              account_id: accountId,
              user_id: userId,
            });
          }}
        >
          <Text style={styles.buttonText}>Chọn vị trí thủ công</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.completeButton, isLoading && styles.disabledButton]}
        onPress={handleCompleteAddress}
        disabled={isLoading}
      >
        <Text style={styles.completeButtonText}>
          {isLoading ? 'Đang xử lý...' : 'Hoàn thành'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  resultBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    minHeight: 50,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderColor: '#6B4F35',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: '#6B4F35',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  completeButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#6B4F35',
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});