import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import logo from '../../../assets/images/logo.png';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const navigation = useNavigation();

  const handleRegister = () => {
    // TODO: thay bằng gọi API thực tế
    console.log('Họ tên:', fullName);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Confirm:', confirmPassword);
    console.log('Agree:', agree);
    navigation.navigate('Login'); // ví dụ chuyển về màn hình Login sau khi đăng ký xong
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>Đăng Ký</Text>
      <Text style={styles.subtitle}>
        Điền thông tin của bạn hoặc đăng ký bằng tài khoản mạng xã hội
      </Text>

      {/* Input Họ tên */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Họ tên"
          placeholderTextColor="#999"
          autoCapitalize="words"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

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

      {/* Input Nhập lại mật khẩu */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry={secureText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setSecureText(!secureText)}
        >
          <Ionicons name={secureText ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Checkbox Terms & Conditions */}
      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() => setAgree(!agree)}
      >
        <Ionicons
          name={agree ? 'checkbox' : 'checkbox-outline'}
          size={20}
          color="#6B4F35"
        />
        <Text style={styles.termsText}> Đồng ý với </Text>
        <Text style={styles.termsLink}>Terms & Conditions</Text>
      </TouchableOpacity>

      {/* Nút Đăng Ký */}
      <TouchableOpacity
        style={[styles.button, { opacity: agree ? 1 : 0.5 }]}
        onPress={handleRegister}
        disabled={!agree}
      >
        <Text style={styles.buttonText}>Đăng Ký</Text>
      </TouchableOpacity>

      {/* Dòng ngăn “Hoặc” */}
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

      {/* Footer: Đã có tài khoản? */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Tôi đã có tài khoản </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Đăng nhập</Text>
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
    marginBottom: 30,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  termsText: {
    fontSize: 14,
    color: '#555',
  },
  termsLink: {
    fontSize: 14,
    color: '#6B4F35',
    textDecorationLine: 'underline',
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
