import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AddressService } from '../../services/AddressService';

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
    latitude?: string;
    longitude?: string;
    address?: string;
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
        id,
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

      const finalAccountId = account_id || id; // Sử dụng account_id hoặc id
      console.log('ID nhận được từ CompleteProfile:', finalAccountId);
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
      };

      // Nếu có địa chỉ string đầy đủ, parse nó
      if (address) {
        const parsedAddress = AddressService.parseAddressString(address);
        addressData = { ...addressData, ...parsedAddress };
      } 
      // Nếu chỉ có tọa độ
      else if (latitude && longitude) {
        addressData = {
          ...addressData,
          latitude,
          longitude,
        };
      }

      console.log('🔼 Dữ liệu gửi lên API:', JSON.stringify(addressData, null, 2));

      const finalAccountId = route.params?.account_id || route.params?.id;
      if (!finalAccountId) {
        Alert.alert('Lỗi', 'Không tìm thấy account ID. Vui lòng thử lại!');
        return;
      }

      await AddressService.createFirstAddress(finalAccountId, addressData);
      console.log('✅ Địa chỉ mặc định đã được lưu thành công');

      Alert.alert(
        'Thành công', 
        'Địa chỉ đã được lưu thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('TabNavigator')
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Lỗi khi gửi API:', error?.response?.data || error.message);
      Alert.alert(
        'Lỗi', 
        error?.response?.data?.message || error.message || 'Không thể lưu địa chỉ. Vui lòng thử lại!'
      );
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
            const accountId = route.params?.account_id || route.params?.id;
            navigation.navigate('SelectLocation', {
              id: accountId,
              account_id: accountId, // Đảm bảo cả 2 tham số
              email: route.params?.email,
              password: route.params?.password,
              fullName: route.params?.fullName,
              phone: route.params?.phone,
              gender: route.params?.gender,
              avatar: route.params?.avatar,
            });
          }}
        >
          <Text style={styles.buttonText}>Chọn vị trí trên bản đồ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button1}
          onPress={() => {
            const accountId = route.params?.account_id || route.params?.id;
            navigation.navigate('ManualAddress', {
              email: route.params?.email,
              password: route.params?.password,
              fullName: route.params?.fullName,
              phone: route.params?.phone,
              gender: route.params?.gender,
              avatar: route.params?.avatar,
              id: accountId,
              account_id: accountId, // Đảm bảo cả 2 tham số
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
  button1: {
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