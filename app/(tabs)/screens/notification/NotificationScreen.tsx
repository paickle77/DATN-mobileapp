import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NotificationCard from '../../component/NotificationCard';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

const NotificationScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const UserID  = await getUserData('profileId');

      const currentUserId = UserID;
      console.log('Current User ID:', currentUserId);

      const response = await axios.get(`${BASE_URL}/notifications/user/${currentUserId}`);
      const allNotifications = response.data?.data || [];

      // Nếu muốn hiển thị tất cả thông báo (mới + đã đọc)
      setNotifications(allNotifications);

      // Nếu chỉ muốn hiển thị thông báo mới (chưa đọc)
      // setNotifications(allNotifications.filter(noti => !noti.is_read));
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thông báo:', error);
    }
  };

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
          key={item._id}
          title={item.title}
          content={item.content}
          createdAt={item.created_at}
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
    justifyContent: 'center',
  },
  backIcon: {
    position: 'absolute',
    left: 0,
    marginLeft: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});
