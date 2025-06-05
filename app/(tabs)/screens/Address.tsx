import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Button, Image, StyleSheet, Text, View } from 'react-native';

const AddressScreen = () => {
  const navigation = useNavigation() as any;
  const route = useRoute();
  
  // State để lưu dữ liệu địa chỉ
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    address: ''
  });

  // Lấy params từ route khi component mount hoặc params thay đổi
  useEffect(() => {
    if (route.params) {
      const { latitude, longitude, address } = route.params as {
        latitude?: string;
        longitude?: string;
        address?: string;
      };
      setLocationData({
        latitude: latitude || '',
        longitude: longitude || '',
        address: address || ''
      });
    }
  }, [route.params]);

  const displayAddress = locationData.address
    ? locationData.address
    : locationData.latitude && locationData.longitude
    ? `Lat: ${locationData.latitude}, Lng: ${locationData.longitude}`
    : 'Chưa có địa chỉ được chọn';

  console.log('====================================');
  console.log('HomeScreen Params:', locationData);
  console.log('====================================');

  return (
    <View style={styles.container}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Image
                source={require('@/assets/images/address.png')}
                style={{ width: 150, height: 150, resizeMode: 'contain' }}
            />
        </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Địa chỉ đã chọn:</Text>
        <View style={styles.resultBox}>
          <Text>{displayAddress}</Text>
        </View>
      </View>
      <Text style={styles.title}>Chọn cách nhập địa chỉ</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Chọn vị trí trên bản đồ"
          onPress={() => navigation.navigate('SelectLocation')}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Nhập địa chỉ thủ công"
        //   onPress={() => navigation.navigate('ManualAddress')}
        />
      </View>
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
    marginBottom: 32,
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
});