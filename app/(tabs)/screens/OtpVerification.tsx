import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OtpVerification() {
  // Lấy email từ param (nếu chuyển từ màn trước)
  const { email } = useLocalSearchParams<{ email: string }>();
  const userEmail = email ?? 'abc@gmail.com';

  const [code, setCode] = useState(['', '', '', '']);
  const navigation = useNavigation();

  // refs để tự động focus giữa 4 ô nhập mã
  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    // Nếu đã nhập ký tự ở ô này, focus sang ô tiếp theo
    if (text && index < 3) {
      refs[index + 1].current?.focus();
    }
  };

  const handleVerify = () => {
    const otp = code.join('');
    console.log('Mã OTP nhập:', otp);
    // TODO: gọi API xác minh OTP tại đây
    navigation.navigate('NewPassword', { email: userEmail });
  };

  const handleResend = () => {
    console.log('Gửi lại mã OTP đến:', userEmail);
    // TODO: gọi API resend OTP tại đây
  };

  return (
    <View style={styles.container}>
      {/* Nút quay lại */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
        <Ionicons name="arrow-back-circle-outline" size={30} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Mã xác minh</Text>
      <Text style={styles.subtitle}>
        Vui lòng nhập mã chúng tôi vừa gửi đến email {userEmail}
      </Text>

      {/* 4 ô nhập OTP */}
      <View style={styles.codeContainer}>
        {code.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={refs[idx]}
            style={styles.codeInput}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, idx)}
          />
        ))}
      </View>

      {/* Resend code */}
      <TouchableOpacity onPress={handleResend}>
        <Text style={styles.resendText}>
          Không nhận được OTP? <Text style={styles.resendLink}>Resend code</Text>
        </Text>
      </TouchableOpacity>

      {/* Nút Xác minh */}
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Xác minh</Text>
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 40,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    textAlign: 'center',
    fontSize: 20,
    color: '#333',
  },
  resendText: {
    textAlign: 'center',
    color: '#555',
    marginVertical: 20,
    fontSize: 14,
  },
  resendLink: {
    color: '#6B4F35',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#6B4F35',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
