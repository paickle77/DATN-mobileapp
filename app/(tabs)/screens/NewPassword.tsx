import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function NewPassword() {
  // Lấy email từ param
  const { email } = useLocalSearchParams<{ email: string }>();
  const userEmail = email ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const navigation = useNavigation();

 const handleSetNewPassword = () => {
  if (password !== confirmPassword) {
    alert('Mật khẩu không khớp!');
    return;
  }
  console.log('Set new password for:', userEmail);
  console.log('Password mới:', password);
  // TODO: gọi API đặt mật khẩu mới
  
  alert('Đặt mật khẩu mới thành công!');
  (navigation as any).navigate('Login');
};

  return (
    <View style={styles.container}>
      {/* Nút quay lại */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
        <Ionicons name="arrow-back-circle-outline" size={30} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Mật khẩu mới</Text>
      <Text style={styles.subtitle}>
        Mật khẩu mới của bạn phải khác với mật khẩu đã sử dụng trước đó
      </Text>

      {/* Input Mật khẩu mới */}
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

      {/* Input xác nhận mật khẩu */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Xác nhận mật khẩu"
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

      {/* Nút Tạo mật khẩu mới */}
      <TouchableOpacity style={styles.button} onPress={handleSetNewPassword}>
        <Text style={styles.buttonText}>Tạo mật khẩu mới</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  backIcon: {
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 20,
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#555',
    marginVertical: 20,
    fontSize: 16,
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
  button: {
    backgroundColor: '#6B4F35',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
