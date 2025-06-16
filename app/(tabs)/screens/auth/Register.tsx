import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { validateRegisterForm } from '../../utils/validation';

type RootStackParamList = {
    CompleteProfile: {
        email: string;
        password?: string;
        
    };
    Login: undefined;
};
export default function Register() {
  // Khai báo state cho form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
   const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Xử lý đăng ký
  const handleRegister = () => {
    // Reset lỗi trước khi validate
    setErrors({
      email: '',
      password: '',
      confirmPassword: '',
    });

    // Gọi validation từ file utils
    const validation = validateRegisterForm(email, password, confirmPassword, agree);
    
    // Nếu có lỗi, hiển thị lỗi và dừng
    if (!validation.isValid) {
      setErrors({
        email: validation.errors.email || '',
        password: validation.errors.password || '',
        confirmPassword: validation.errors.confirmPassword || '',
      });
      
      // Kiểm tra riêng lỗi agree (không thuộc errors object)
      if (validation.errors.agree) {
        Alert.alert('Thông báo', validation.errors.agree);
      }
      return;
    }

    // Nếu validation thành công, log thông tin và chuyển trang
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Agree:', agree);
    
    // Chuyển đến màn hình hoàn thiện hồ sơ với email và password
    navigation.navigate('CompleteProfile', { 
      email: email,
      password: password 
    });
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Đăng Ký</Text>
      <Text style={styles.subtitle}>
        Điền thông tin của bạn hoặc đăng ký bằng tài khoản mạng xã hội
      </Text>

      {/* Input Email */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.email ? styles.inputError : null]}
          placeholder="abc@gmail.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            // Xóa lỗi khi người dùng bắt đầu nhập
            if (errors.email) {
              setErrors(prev => ({ ...prev, email: '' }));
            }
          }}
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
            // Xóa lỗi khi người dùng bắt đầu nhập
            if (errors.password) {
              setErrors(prev => ({ ...prev, password: '' }));
            }
          }}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setSecureText(!secureText)}
        >
          <Ionicons name={secureText ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
      </View>

      {/* Input Nhập lại mật khẩu */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry={secureText}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            // Xóa lỗi khi người dùng bắt đầu nhập
            if (errors.confirmPassword) {
              setErrors(prev => ({ ...prev, confirmPassword: '' }));
            }
          }}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setSecureText(!secureText)}
        >
          <Ionicons name={secureText ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
        {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
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

      {/* Dòng ngăn "Hoặc" */}
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