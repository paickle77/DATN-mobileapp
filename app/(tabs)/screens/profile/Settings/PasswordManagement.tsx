import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNotification } from '../../../../../hooks/useNotification'; // Đường dẫn tùy theo cấu trúc project
import NotificationComponent from '../../../component/NotificationComponent'; // Đường dẫn tùy theo cấu trúc project
import { BASE_URL } from '../../../services/api';
import { registerForPushNotificationsAsync } from '../../notification/PushTokenService';
import { getUserData } from '../../utils/storage';
import { styles } from './styles';
interface Props {
  goBack: () => void;
}

const PasswordManagement = ({ goBack }: Props) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [accountId, setAccountId] = useState<string>(''); // ✅ Đổi từ userId -> accountId
  const [pushToken, setPushToken] = useState('')
  const { notification, showError, showSuccess, hideNotification } = useNotification();

    const fetchDatatoken = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setPushToken(token);
          console.log('🔐 Token:', token);
          console.log("V")
        }
      } catch (error) {
        console.error('❌ Lỗi khi lấy push token:', error);
      }
    };
  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getUserData('accountId');
        console.log("ádf",userData)
        // ✅ Lấy accountId từ userData
        // Tùy theo cấu trúc userData của bạn, có thể là:
        // userData.accountId hoặc userData.account_id hoặc userData._id
        const userAccountId = userData
        
        setAccountId(userAccountId || '');
        console.log("accountId:", userAccountId);
        
        if (!userAccountId) {
          showError('Không tìm thấy thông tin tài khoản!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showError('Lỗi khi lấy thông tin người dùng!');
      } finally {
        setLoading(false);
      }
    };
    fetchDatatoken();
    fetchUserData();
  }, []);

  const validate = () => {
    if (!currentPassword.trim()) {
      showError('Vui lòng nhập mật khẩu hiện tại!');
      return false;
    }

    if (!newPassword.trim()) {
      showError('Vui lòng nhập mật khẩu mới!');
      return false;
    }

    if (!confirmPassword.trim()) {
      showError('Vui lòng xác nhận mật khẩu mới!');
      return false;
    }

    // Validate password length
    if (newPassword.length < 6) {
      showError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return false;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      showError('Mật khẩu xác nhận không khớp!');
      return false;
    }

    // Validate current password is different from new password
    if (currentPassword === newPassword) {
      showError('Mật khẩu mới phải khác mật khẩu hiện tại!');
      return false;
    }

    // ✅ Kiểm tra accountId
    if (!accountId) {
      showError('Không tìm thấy thông tin tài khoản!');
      return false;
    }

    return true;
  };

  const handlePasswordUpdate = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      
      // ✅ Gọi API mới với accountId thay vì userId
      const res = await axios.post(BASE_URL + '/change-password', {
        accountId,
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        
         await Notifications.scheduleNotificationAsync({
                content: {
                  to: `${pushToken}`,
                  sound: "custom",
                  title: "Đổi mật khẩu thành công !",
                  body: "Bạn đã đổi mật khẩu thành công",
                  data: { "foo": "bar" },
                  android: {
                    channelId: "orders",
                    icon: "notification-icon", 
                    color: "#5C4033",
                  }
                },
                trigger: null,
              });
        
         try {
          const userId = await getUserData('userId');
                console.log('👤 UserID:', userId);
          const payload = {
            title: "Đổi mật khẩu thành công",
            content: "Mật khẩu của bạn đã được cập nhật thành công.",
            user_id: userId, // Gửi notification đến user hiện tại
          };
          console.log('Notification payload:', payload);
          const res = await axios.post(`${BASE_URL}/notifications`, payload);
          console.log('Notification sent:', res.data);         

        } catch (error) {
          console.error('Error sending notification:', error);
        }

        showSuccess('Đổi mật khẩu thành công!');
        // ✅ Clear form sau khi thành công
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

       
      } else {
        showError(res.data.message || 'Đổi mật khẩu thất bại!');
      }

    } catch (err: any) {
      console.error('Error changing password:', err);
      
      const errorMessage = err.response?.data?.message || 'Đổi mật khẩu thất bại';

      if (err.response?.status === 401) {
        // 👇 Nếu sai mật khẩu hiện tại
        showError('Mật khẩu hiện tại không đúng!');
      } else if (err.response?.status === 404) {
        showError('Không tìm thấy tài khoản!');
      } else if (err.response?.status === 400) {
        showError(errorMessage);
      } else {
        showError('Lỗi kết nối server. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý mật khẩu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Đổi mật khẩu</Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input1}
              placeholder="Mật khẩu hiện tại"
              secureTextEntry={secure}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              editable={!loading} // ✅ Disable khi đang loading
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setSecure(!secure)}
            >
              <Feather name={secure ? 'eye-off' : 'eye'} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input1}
              placeholder="Mật khẩu mới"
              secureTextEntry={secure}
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading} // ✅ Disable khi đang loading
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setSecure(!secure)}
            >
              <Feather name={secure ? 'eye-off' : 'eye'} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input1}
              placeholder="Xác nhận mật khẩu mới"
              secureTextEntry={secure}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading} // ✅ Disable khi đang loading
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setSecure(!secure)}
            >
              <Feather name={secure ? 'eye-off' : 'eye'} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, loading && { opacity: 0.6 }]} // ✅ Thêm opacity khi loading
            onPress={handlePasswordUpdate}
            disabled={loading} // ✅ Disable button khi loading
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </Text>
          </TouchableOpacity>

          {/* Notification hiển thị ở đây */}
          <NotificationComponent
            message={notification.message}
            type={notification.type}
            visible={notification.visible}
            onHide={hideNotification}
            duration={4000}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default PasswordManagement;