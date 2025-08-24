import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import notificationService from '../../services/NotificationService'; // Đường dẫn tới file NotificationService
export default function NotificationDemo() {
  useEffect(() => {
    // Khởi tạo notification (chỉ 1 lần)
    notificationService.initialize();
  }, []);

  const handleSendNotification = async () => {
    await notificationService.showNotification(
      'Thông báo mới',
      'Bạn vừa bấm nút gửi thông báo!',
      { customData: '12345' }
    );
    // Alert.alert('Đã gửi thông báo!');

    // await notificationService.cancelAllNotifications();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demo Notification</Text>

      <TouchableOpacity style={styles.button} onPress={handleSendNotification}>
        <Text style={styles.buttonText}>Gửi thông báo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5C4033',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
