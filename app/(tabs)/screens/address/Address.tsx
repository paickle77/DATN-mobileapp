import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type RootStackParamList = {
  CompleteProfile: {
    address?: string;
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    gender?: string;
    avatar?: string;
  };
  Address: {
    email?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    gender?: string;
    avatar?: string;
  };
};
const AddressScreen = () => {
  const navigation = useNavigation() as any;
  const route = useRoute<RouteProp<RootStackParamList, 'Address'>>();


  // State để lưu dữ liệu địa chỉ
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    address: ''
  });

  // Lấy params từ route khi component mount hoặc params thay đổi
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
        avatar
      } = route.params as {
        latitude?: string;
        longitude?: string;
        address?: string;
        email?: string;
        password?: string;
        fullName?: string;
        phone?: string;
        gender?: string;
        avatar?: string;
      };

      setLocationData({
        latitude: latitude || '',
        longitude: longitude || '',
        address: address || ''
      });

      // Bạn có thể log thử để kiểm tra
      console.log('===================================');
      console.log('Dữ liệu ');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('Họ tên:', fullName);
      console.log('SĐT:', phone);
      console.log('Giới tính:', gender);
      console.log('Avatar:', avatar);
      console.log('Địa chỉ từ input hoặc bản đồ:', address);

    }
  }, [route.params]);


  const displayAddress = locationData.address
    ? locationData.address
    : locationData.latitude && locationData.longitude
      ? `Lat: ${locationData.latitude}, Lng: ${locationData.longitude}`
      : 'Chưa có địa chỉ được chọn';


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
          onPress={() =>
            navigation.navigate('SelectLocation', {
              email: route.params?.email,
              password: route.params?.password,
              fullName: route.params?.fullName,
              phone: route.params?.phone,
              gender: route.params?.gender,
              avatar: route.params?.avatar,
            })
          }
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

      <TouchableOpacity style={styles.completeButton} onPress={() => navigation.navigate('TabNavigator')}>
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
  buttonContainer: {
    marginVertical: 12,
    backgroundColor: '#5F3C1E',
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
  // Thay thế các style sau trong phần StyleSheet
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