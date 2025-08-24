import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

class NotificationService {
    private static instance: NotificationService;
    private initialized: boolean = false;

    private constructor() {}

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public async initialize() {
        if (this.initialized) return;

        try {
            // Thiết lập handler cho notifications
            // Notifications.setNotificationHandler({
            //     handleNotification: async () => ({
            //         shouldShowAlert: true,
            //         shouldPlaySound: true,
            //         shouldSetBadge: true,
            //     }),
            // });

                        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowBanner: true,     // Thay thế shouldShowAlert
                shouldShowList: true,       // Hiển thị trong Notification Center
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
            });

            // Yêu cầu quyền thông báo
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Không thể nhận được quyền gửi thông báo!');
                return;
            }

            if (Platform.OS === 'android') {
                await this.setupAndroidNotificationChannel();
            }

            this.initialized = true;
            console.log('Notification service initialized successfully');
        } catch (error) {
            console.error('Lỗi khi khởi tạo notification service:', error);
            throw error;
        }
    }

    public async setupAndroidNotificationChannel() {
        try {
            await Notifications.setNotificationChannelAsync('orders', {
                name: 'Order Notifications',
                description: 'Thông báo về đơn hàng',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
                sound: 'default',
            });
            console.log('Android notification channel created successfully');
        } catch (error) {
            console.error('Lỗi khi tạo notification channel:', error);
            throw error;
        }
    }

    public async showNotification(title: string, body: string, data = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: 'default',
                },
                trigger: null,
            });
        } catch (error) {
            console.error('Lỗi khi hiển thị notification:', error);
        }
    }

    public async cancelAllNotifications() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Lỗi khi hủy notifications:', error);
        }
    }

    public async removeAllDeliveredNotifications() {
        try {
            await Notifications.dismissAllNotificationsAsync();
        } catch (error) {
            console.error('Lỗi khi xóa notifications đã gửi:', error);
        }
    }

    public addNotificationResponseReceivedListener(callback: (response: Notifications.NotificationResponse) => void) {
        return Notifications.addNotificationResponseReceivedListener(callback);
    }

    public addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
        return Notifications.addNotificationReceivedListener(callback);
    }
}

const notificationService = NotificationService.getInstance();
export default notificationService; 