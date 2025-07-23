import * as Notifications from 'expo-notifications';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { registerForPushNotificationsAsync } from './PushTokenService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
     shouldShowBanner: true,     // Thay thế shouldShowAlert
                shouldShowList: true,       // Hiển thị trong Notification Center
                shouldPlaySound: true,
                shouldSetBadge: true,
  }),
});

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        // TODO: Gửi token về server nếu cần
      }
    });

    // Listener khi thông báo được nhận khi app đang mở
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notification Received:', notification);
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Push Notification Demo 🚀</Text>
    </View>
  );
}
