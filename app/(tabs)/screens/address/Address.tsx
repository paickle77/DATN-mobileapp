import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';

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
    id: string;
    latitude?: string;
    longitude?: string;
    address?: string;
  };
};


const AddressScreen = () => {
  const navigation = useNavigation() as any;
  const route = useRoute<RouteProp<RootStackParamList, 'Address'>>();

  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    address: ''
  });

  useEffect(() => {
    if (route.params) {
      const {
        latitude,
        longitude,
        address,
        email,
        password,
        fullName,
        phone,
        gender,
        avatar,
        id
      } = route.params;

      setLocationData({
        latitude: latitude || '',
        longitude: longitude || '',
        address: address || ''
      });

      console.log('ID nhận được từ CompleteProfile:', route.params?.id);
      console.log('ID nhận được từ MapAddress:',id);
      console.log('Vĩ độ (latitude):', latitude);
      console.log('Kinh độ (longitude):', longitude);
    }
  }, [route.params?.id]);

  const displayAddress = locationData.address
    ? locationData.address
    : locationData.latitude && locationData.longitude
    ? `Lat: ${locationData.latitude}, Lng: ${locationData.longitude}`
    : 'Chưa có địa chỉ được chọn';

  const parts = displayAddress.split(',').map(part => part.trim());
  let detail_address = '';
  let ward = '';
  let district = '';
  let city = '';

  if (parts.length >= 4) {
    detail_address = parts[0];
    ward = parts[1];
    district = parts[2];
    city = parts[3];
  } else {
    console.warn('Địa chỉ không đủ 4 phần để tách');
  }

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Image
          source={require('@/assets/images/address.png')}
          style={{ width: 150, height: 150, resizeMode: 'contain' }}
        />
      </View>
      <Text style={styles.title}>Vị trí của bạn là gì???</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Địa chỉ đã chọn:</Text>
        <View style={styles.resultBox}>
          <Text>{displayAddress}</Text>
        </View>
      </View>

      <View style={styles.bottomButtonContainer}>
       <TouchableOpacity
  style={styles.button}
  onPress={() => {
    // debug log trước khi navigate
    console.log('[AddressScreen] navigating to SelectLocation with id =', route.params?.id);

    navigation.navigate('SelectLocation', {
      id: route.params?.id,                // nhớ thêm id
      email: route.params?.email,
      password: route.params?.password,
      fullName: route.params?.fullName,
      phone: route.params?.phone,
      gender: route.params?.gender,
      avatar: route.params?.avatar,
    });
  }}
>
  <Text>Chọn vị trí trên bản đồ</Text>
</TouchableOpacity>

        <TouchableOpacity 
          style={styles.button1} 
          onPress={() => 
            navigation.navigate('ManualAddress', {
              email: route.params?.email,
              password: route.params?.password,
              fullName: route.params?.fullName,
              phone: route.params?.phone,
              gender: route.params?.gender,
              avatar: route.params?.avatar,
            })
          }
        >
          <Text>Chọn vị trí thủ công</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={async () => {
          try {
            const { latitude, longitude, address } = locationData;

            const parts = address.split(',').map(part => part.trim());

            let body: any = { user_id: route.params?.id };

            if (parts.length >= 4) {
              body = {
                ...body,
                detail_address: parts[0],
                ward: parts[1],
                district: parts[2],
                city: parts[3],
              };
            } else {
              body = {
                ...body,
                latitude,
                longitude,
              };
            }

            console.log('🔼 Dữ liệu gửi lên API:', JSON.stringify(body, null, 2));

            const response = await axios.post('http://172.20.20.15:3000/api/addresses', body);
            console.log('✅ Phản hồi từ API:', response.data);

            navigation.navigate('Home');
          } catch (error: any) {
            console.error('❌ Lỗi khi gửi API:', error?.response?.data || error.message);
            alert('Gửi địa chỉ thất bại!');
          }
        }}
      >
        <Text style={styles.completeButtonText}>Hoàn thành</Text>
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
    backgroundColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderColor: '#6B4F35',
    borderWidth: 1,
  },
  button1: {
    flex: 1,
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderColor: '#6B4F35',
    borderWidth: 1,
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  completeButton: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#6B4F35',
    borderRadius: 25,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
