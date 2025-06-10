// screens/Login.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { validateLoginForm } from '../utils/validation';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OtpVerification: { email: string };
  NewPassword: { email: string };
  CompleteProfile: { email: string };
  Home: undefined;
};

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const navigation = useNavigation<LoginNavigationProp>();

  const handleLogin = async () => {
    // Reset errors
    setErrors({
      email: '',
      password: '',
    });

    // Validate form
    const { isValid, errors: validationErrors } = validateLoginForm(email, password);
    
    if (!isValid) {
      setErrors({
        email: validationErrors.email || '',
        password: validationErrors.password || '',
      });
      return;
    }

    setLoading(true);
    
    // try {
    //   const response = await authService.login({ email, password });
      
    //   if (response.success) {
    //     Alert.alert(
    //       'Thành công',
    //       response.message,
    //       [
    //         {
    //           text: 'OK',
    //           onPress: () => navigation.navigate('Home')
    //         }
    //       ]
    //     );
    //   } else {
    //     Alert.alert('Lỗi', response.message);
    //   }
    // } catch (error) {
    //   Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập email trước khi quên mật khẩu');
      return;
    }

    // Validate email format
    const emailValidation = validateLoginForm(email, 'dummy').errors.email;
    if (emailValidation) {
      Alert.alert('Lỗi', emailValidation);
      return;
    }

    setLoading(true);
    
  //   try {
  //     const response = await authService.sendForgotPasswordOTP(email);
      
  //     if (response.success) {
  //       Alert.alert(
  //         'Thành công',
  //         response.message,
  //         [
  //           {
  //             text: 'OK',
  //             onPress: () => navigation.navigate('OtpVerification', { email: email })
  //           }
  //         ]
  //       );
  //     } else {
  //       Alert.alert('Lỗi', response.message);
  //     }
  //   } catch (error) {
  //     Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
  //   } finally {
  //     setLoading(false);
  //   }
  };

  const handleGoToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/logo.png')} style={styles.logo} />
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
            if (errors.email) {
              setErrors(prev => ({ ...prev, email: '' }));
            }
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
            if (errors.password) {
              setErrors(prev => ({ ...prev, password: '' }));
            }
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

      {/* Link Quên mật khẩu */}
      <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
        <Text style={[styles.forgotText, loading && styles.disabledText]}>
          Forgot Password ?
        </Text>
      </TouchableOpacity>

      {/* Nút Đăng nhập */}
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      {/* Dòng ngăn cách "Hoặc" */}
      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>Hoặc</Text>
        <View style={styles.separatorLine} />
      </View>

      {/* Nút Social Login */}
      <View style={styles.socialContainer}>
        <TouchableOpacity 
          style={[styles.socialButton, loading && styles.buttonDisabled]} 
          onPress={() => { /* TODO: Google login */ }}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={24} color="#DB4437" />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.socialButton, loading && styles.buttonDisabled]} 
          onPress={() => { /* TODO: Facebook login */ }}
          disabled={loading}
        >
          <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Footer: Chưa có tài khoản? */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Bạn không có tài khoản </Text>
        <TouchableOpacity onPress={handleGoToRegister} disabled={loading}>
          <Text style={[styles.footerLink, loading && styles.disabledText]}>
            Tạo tài khoản
          </Text>
        </TouchableOpacity>
      </View>
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