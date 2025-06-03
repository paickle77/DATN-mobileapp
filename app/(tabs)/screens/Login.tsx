// screens/Login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import logo from '../../../assets/images/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const navigation = useNavigation();

  const handleLogin = () => {
    // TODO: gọi API đăng nhập thực tế
    console.log('Email:', email);
    console.log('Password:', password);
    navigation.navigate('Home'); // điều hướng vào màn Home sau khi login thành công
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Đăng Nhập</Text>
      <Text style={styles.subtitle}>Xin chào! Chào mừng bạn đã trở lại</Text>

      {/* Input Email */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="abc@gmail.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Input Mật khẩu */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry={secureText}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setSecureText(!secureText)}
        >
          <Ionicons name={secureText ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Link Quên mật khẩu */}
      <TouchableOpacity
        onPress={() => {
          // Điều hướng sang màn OTP Verification, gửi kèm email hiện tại
          navigation.navigate('OtpVerification', { email: email });
        }}
      >
        <Text style={styles.forgotText}>Forgot Password ?</Text>
      </TouchableOpacity>

      {/* Nút Đăng nhập */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

      {/* Dòng ngăn cách “Hoặc” */}
      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>Hoặc</Text>
        <View style={styles.separatorLine} />
      </View>

      {/* Nút Social Login */}
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={() => { /* TODO: Google login */ }}>
          <Ionicons name="logo-google" size={24} color="#DB4437" />
          <Text style={styles.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={() => { /* TODO: Facebook login */ }}>
          <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          <Text style={styles.socialText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Footer: Chưa có tài khoản? */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Bạn không có tài khoản </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerLink}>Tạo tài khoản</Text>
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
    backgroundColor: '#fff',
  },
  logo: {
    width: 80,
    height: 80,
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
});
