import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NotificationCard from '../component/NotificationCard';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const NotificationScreen = () => {
  const navigation = useNavigation();
  const notifications = [
    {
      id: 1,
      title: 'Ứng dụng',
      status: 'Đặt hàng thành công',
      orderCode: 'xbg13572',
      time: '24/05/2025 - 07:21',
    },
    {
      id: 2,
      title: 'Ứng dụng',
      status: 'Thanh toán thành công',
      orderCode: 'abc99872',
      time: '22/05/2025 - 10:15',
    },
    {
      id: 3,
      title: 'Ứng dụng',
      status: 'Đơn hàng đã vận chuyển',
      orderCode: 'hjk55422',
      time: '20/05/2025 - 15:45',
    },
    {
      id: 4,
      title: 'Ứng dụng',
      status: 'Đơn hàng bị hủy',
      orderCode: 'xyz11123',
      time: '18/05/2025 - 09:30',
    },
    {
      id: 5,
      title: 'Ứng dụng',
      status: 'Đặt hàng thành công',
      orderCode: 'opq78965',
      time: '15/05/2025 - 11:05',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Ionicons name="arrow-back-circle-outline" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>Danh sách thông báo</Text>
      </View>

      {notifications.map((item) => (
        <NotificationCard
          key={item.id}
          title={item.title}
          status={item.status}
          orderCode={item.orderCode}
          time={item.time}
        />
      ))}
    </ScrollView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    justifyContent: 'center', // căn giữa nội dung
  },
  backIcon: {
    position: 'absolute',
    left: 0,  // đẩy icon sang sát bên trái
    marginLeft: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});
