// Login.tsx (đã sửa - thay Alert bằng Snackbar, note bên dưới)
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomSnackbar from '../../../(tabs)/component/CustomSnackbar'; // ✅ ĐÃ THÊM COMPONENT SNACKBAR
import { loginAuthService } from '../../services/LoginAuthService';
import { validateLoginForm } from '../../utils/validation';
import { clearAllStorage, saveUserData } from '../utils/storage';
// Kiểu dữ liệu navigation

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OtpVerification: { email: string };
  NewPassword: { email: string };
  CompleteProfile: { email: string };
  TabNavigator: undefined;
  ShipTabNavigator: undefined; 
};

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const [snackbarVisible, setSnackbarVisible] = useState(false); // ✅ SNACKBAR STATE
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  const navigation = useNavigation<LoginNavigationProp>();

  const handleLogin = async () => {
    await clearAllStorage();
    // Validate form before login
    const { isValid, errors: formErrors } = validateLoginForm(email, password);
    if (!isValid) {
      setErrors({ 
        email: formErrors.email || '', 
        password: formErrors.password || '' 
      });
      setSnackbarMessage(formErrors.email || formErrors.password || 'Vui lòng nhập email và mật khẩu');
      setSnackbarType('error');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    const result = await loginAuthService.login(email, password);
    // ✅ In rõ role lấy được
    const role = result?.data?.account?.role;
    console.log('🔍 Role lấy được:', role);

    setLoading(false);

    if (result.success) {
      // Chỉ gửi thông báo khi đăng nhập thành công
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Đăng nhập thành công!',
          body: 'Bạn được chuyển tới trang chủ',
          sound: 'default',
        },
        trigger: null, // Gửi ngay lập tức
      });
    try {
      // ✅ Lưu tất cả thông tin quan trọng vào AsyncStorage
      const userData = result.data;
      
      // Lưu account ID
      if (userData?.account?._id) {
        await saveUserData({
          key: 'accountId',
          value: userData.account._id.toString()
        });
        console.log('🆔 Account ID:', userData.account._id);
      }

      // Lưu profile ID (thay vì user ID)
      if (userData?.profile?._id) {
        await saveUserData({
          key: 'userId', 
          value: userData.profile._id.toString()
        });
        console.log('🆔 User ID:', userData.profile._id);
      }

      // Lưu address ID từ profile
      if (userData?.profile?.address_id) {
        await saveUserData({
          key: 'addressId',
          value: userData.profile.address_id.toString()
        });
        console.log('🆔 Address ID:', userData.profile.address_id);
      }

      // Lưu role
      if (userData?.account?.role) {
        await saveUserData({
          key: 'userRole',
          value: userData.account.role
        });
      }

      // Lưu email
      if (userData?.account?.email) {
        await saveUserData({
          key: 'userEmail',
          value: userData.account.email
        });
      }

      // Lưu thông tin profile
      if (userData?.profile?.name) {
        await saveUserData({
          key: 'userName',
          value: userData.profile.name
        });
      }

      if (userData?.profile?.phone) {
        await saveUserData({
          key: 'userPhone',
          value: userData.profile.phone
        });
      }

      // Lưu token
      if (userData?.token) {
        await saveUserData({
          key: 'authToken',
          value: userData.token
        });
        console.log('🔑 Auth Token:', userData.token);
      }

      // Lưu toàn bộ user data để backup
      await saveUserData({
        key: 'fullUserData',
        value: JSON.stringify(userData)
      });

    } catch (storageError) {
      console.error('❌ Lỗi khi lưu data vào storage:', storageError);
    }

    setSnackbarMessage(result.message);
    setSnackbarType('success');
    setSnackbarVisible(true);

    setTimeout(() => {
      setSnackbarVisible(false);

      if (role === 'shipper') {
        console.log('👉 Điều hướng vào ShipTabNavigator');
        navigation.reset({
          index: 0,
          routes: [{ name: 'ShipTabNavigator' }],
        });
      } else {
        
        console.log('👉 Điều hướng vào TabNavigator');
        navigation.reset({
          index: 0,
          routes: [{ name: 'TabNavigator' }],
        });
      }
    }, 1000);
  } else {
    setSnackbarMessage(result.message || 'Đăng nhập thất bại');
    setSnackbarType('error');
    setSnackbarVisible(true);
    setTimeout(() => setSnackbarVisible(false), 2000);
  }
};

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setSnackbarMessage('Vui lòng nhập email trước khi quên mật khẩu');
      setSnackbarType('error');
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), 2000);
      return;
    }

    const emailValidation = validateLoginForm(email, 'dummy').errors.email;
    if (emailValidation) {
      setSnackbarMessage(emailValidation);
      setSnackbarType('error');
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), 2000);
      return;
    }

    setLoading(true);
    navigation.navigate('OtpVerification', { email });
    setLoading(false);
  };

  const handleGoToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Đăng Nhập</Text>
      <Text style={styles.subtitle}>Xin chào! Chào mừng bạn đã trở lại</Text>

      {/* Input Email */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : null]}
          placeholder="Nhập email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
          }}
          editable={!loading}
        />
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
      </View>

      {/* Input Mật khẩu */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.password ? styles.inputError : null]}
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry={secureText}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
          }}
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setSecureText(!secureText)}
          disabled={loading}
        >
          <Ionicons name={secureText ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
      </View>

      {/* Quên mật khẩu */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}>
        <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
          <Text style={[styles.forgotText, loading && styles.disabledText]}>Forgot Password ?</Text>
        </TouchableOpacity>
      </View>

      {/* Nút đăng nhập */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
      </TouchableOpacity>

      {/* Hoặc */}
      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>Hoặc</Text>
        <View style={styles.separatorLine} />
      </View>

      {/* Nút Social */}
      <View style={styles.socialContainer}>
        <TouchableOpacity
          style={[styles.socialButton, loading && styles.buttonDisabled]}
          onPress={() => { }}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={24} color="#DB4437" />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.socialButton, loading && styles.buttonDisabled]}
          onPress={() => { }}
          disabled={loading}
        >
          <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Tạo tài khoản */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Bạn không có tài khoản </Text>
        <TouchableOpacity onPress={handleGoToRegister} disabled={loading}>
          <Text style={[styles.footerLink, loading && styles.disabledText]}>Tạo tài khoản</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Gắn Snackbar vào cuối layout */}
      <CustomSnackbar visible={snackbarVisible} message={snackbarMessage} type={snackbarType} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    backgroundColor: '#fbfbfb',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingRight: 45,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 20,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 13,
  },
  forgotText: {
    color: '#6B4F35',
    alignSelf: 'flex-end',
    marginBottom: 30,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6B4F35',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  separatorText: {
    marginHorizontal: 10,
    color: '#777',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  socialText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#555',
  },
  footerLink: {
    fontSize: 14,
    color: '#6B4F35',
    fontWeight: 'bold',
  },
  disabledText: {
    opacity: 0.6,
  },
});