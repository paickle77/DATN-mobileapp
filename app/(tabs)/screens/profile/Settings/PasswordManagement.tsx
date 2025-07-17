import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNotification } from '../../../../../hooks/useNotification'; // Đường dẫn tùy theo cấu trúc project
import NotificationComponent from '../../../component/NotificationComponent'; // Đường dẫn tùy theo cấu trúc project
import { BASE_URL } from '../../../services/api';
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
  const [userId, setUserId] = useState<string>('');

  const { notification, showError, showSuccess, hideNotification } = useNotification();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = await getUserData('userData');
        const userIdFromStorage = user?.id || user; // Tùy theo structure của user data
        setUserId(userIdFromStorage || '');
        console.log("userID:", userIdFromStorage);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

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
     return true;
  };

const handlePasswordUpdate = async () => {
  if (!validate()) return;
   try {
    const res = await axios.post(BASE_URL + '/users/change-password', {
      userId,
      currentPassword,
      newPassword,
    });

    showSuccess('Đổi mật khẩu thành công!');
    setCurrentPassword('');
  } catch (err: any) {
    const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại';

    if (err.response?.status === 401) {
      // 👇 Nếu sai mật khẩu hiện tại
      showError('Mật khẩu hiện tại không đúng!');
    } else {
      showError(msg);
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
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setSecure(!secure)}
            >
              <Feather name={secure ? 'eye-off' : 'eye'} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handlePasswordUpdate}>
            <Text style={styles.primaryButtonText}>Cập nhật mật khẩu</Text>
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