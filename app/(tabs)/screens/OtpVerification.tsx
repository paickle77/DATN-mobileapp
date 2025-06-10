// screens/OtpVerification.tsx
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OtpVerification: { email: string };
  NewPassword: { email: string };
  CompleteProfile: { email: string };
  Home: undefined;
};

type OtpVerificationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OtpVerification'>;
type OtpVerificationRouteProp = RouteProp<RootStackParamList, 'OtpVerification'>;

export default function OtpVerification() {
  const navigation = useNavigation<OtpVerificationNavigationProp>();
  const route = useRoute<OtpVerificationRouteProp>();
  
  // Lấy email từ route params
  const userEmail = route.params?.email || 'abc@gmail.com';

  const [code, setCode] = useState(['', '', '', '']);

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

  const handleKeyPress = (key: string, index: number) => {
    // Nếu nhấn backspace và ô hiện tại rỗng, chuyển về ô trước
    if (key === 'Backspace' && !code[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    const otp = code.join('');
    
    if (otp.length !== 4) {
      alert('Vui lòng nhập đầy đủ 4 số mã OTP');
      return;
    }

    console.log('Mã OTP nhập:', otp);
    console.log('Email:', userEmail);
    
    // TODO: gọi API xác minh OTP tại đây
    // Giả sử OTP đúng, chuyển sang màn NewPassword
    navigation.navigate('NewPassword', { email: userEmail });
  };

  const handleResend = () => {
    console.log('Gửi lại mã OTP đến:', userEmail);
    // TODO: gọi API resend OTP tại đây
    // Reset form
    setCode(['', '', '', '']);
    refs[0].current?.focus();
    alert('Mã OTP mới đã được gửi đến email của bạn');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Nút quay lại */}
      <TouchableOpacity onPress={handleGoBack} style={styles.backIcon}>
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
            style={[
              styles.codeInput,
              digit ? styles.codeInputFilled : null
            ]}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, idx)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, idx)}
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
    marginTop: 60,
    marginBottom: 20,
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
    marginVertical: 30,
    fontSize: 16,
    lineHeight: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 40,
    marginBottom: 40,
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
    backgroundColor: '#f9f9f9',
  },
  codeInputFilled: {
    borderColor: '#6B4F35',
    backgroundColor: '#fff',
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