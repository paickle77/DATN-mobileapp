import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert , Image } from 'react-native';
import  logo from '../../assets/images/logo.png'
export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
   const [password2, setPassword2] = useState('');
    const navigation = useNavigation()
   
    
  const handleLogin = () => {
    // Bạn có thể thay thế phần này bằng gọi API thực tế
     navigation.navigate('Login');
  };
  const handleRegister = () => {
    // Bạn có thể thay thế phần này bằng gọi API thực tế
   
  };
  return (
    <View style={styles.container}>
       <Image  source={logo} style={styles.IMG} />
      <Text style={styles.title}>Đăng Ký</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

       <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        value={password}
        onChangeText={setPassword2}
        secureTextEntry
      />
    
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng Nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng Ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    IMG:{
     alignSelf: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    alignSelf: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  button: {
    margin:20,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
