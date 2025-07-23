import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permission denied!');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('📱 Expo Push Token:', token);
  } else {
    alert('Push Notifications chỉ hoạt động trên thiết bị thật.');
  }

  return token;
}
