// ResetPasswordScreen.tsx
import axios from 'axios';
import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { BASE_URL } from '../../services/api';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
  Login: undefined;
  // add other screens if needed
};

type ResetPasswordScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function ResetPasswordScreen({ navigation }: ResetPasswordScreenProps) {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = async () => {
    try {
      const res = await axios.post( BASE_URL + '/users/reset-password', {
        otp,
        newPassword,
      });

      Alert.alert('Thành công', res.data.msg || 'Đặt lại mật khẩu thành công');
      navigation.navigate('Login'); // hoặc màn hình khác
    } catch (err) {
      if (axios.isAxiosError(err)) {
        Alert.alert('Lỗi', err.response?.data?.msg || 'Có lỗi xảy ra');
      } else {
        Alert.alert('Lỗi', 'Có lỗi xảy ra');
      }
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Nhập mã OTP</Text>
      <TextInput
        value={otp}
        onChangeText={setOtp}
        placeholder="OTP"
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />

      <Text>Nhập mật khẩu mới</Text>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Mật khẩu mới"
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
      />

      <Button title="Đặt lại mật khẩu" onPress={handleResetPassword} />
    </View>
  );
}
