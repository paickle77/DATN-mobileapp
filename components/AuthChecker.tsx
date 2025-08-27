// components/AuthChecker.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AuthUtils from '../app/(tabs)/utils/auth.utils';

interface AuthCheckerProps {
  onAuthComplete: (isLoggedIn: boolean, userInfo?: any) => void;
  children?: React.ReactNode;
}

const AuthChecker: React.FC<AuthCheckerProps> = ({ onAuthComplete, children }) => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Đang kiểm tra trạng thái authentication...');
      
      // Sử dụng shouldAutoLogin để kiểm tra nhanh
      const { shouldLogin, userInfo } = await AuthUtils.shouldAutoLogin();
      
      if (shouldLogin && userInfo) {
        console.log('✅ User đã đăng nhập:', userInfo);
        onAuthComplete(true, userInfo);
      } else {
        console.log('❌ Không có session hợp lệ - chuyển đến auth flow');
        onAuthComplete(false);
      }
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra auth status:', error);
      onAuthComplete(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#B4845C" />
        <Text style={styles.text}>Đang kiểm tra phiên đăng nhập...</Text>
        {children}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBFBFB',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AuthChecker;
