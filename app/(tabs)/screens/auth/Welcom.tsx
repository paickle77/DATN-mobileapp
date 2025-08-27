import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  View
} from 'react-native';
import AuthChecker from '../../../../components/AuthChecker';
import AuthUtils from '../../utils/auth.utils';

type RootStackParamList = {
  Login: undefined;
  Home: undefined; // Thêm Home route
  // Add other screens here if needed
};

type WelcomScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const WelcomScreen: React.FC<WelcomScreenProps> = ({ navigation }) => {
  const [showAuthChecker, setShowAuthChecker] = useState(false);

  useEffect(() => {
    // Delay 2 giây để show logo trước khi check auth
    const logoTimer = setTimeout(() => {
      setShowAuthChecker(true);
    }, 2000);

    return () => clearTimeout(logoTimer);
  }, [navigation]);

  const handleAuthComplete = (isLoggedIn: boolean, userInfo?: any) => {
    if (isLoggedIn && userInfo) {
      // User đã đăng nhập → vào Home với role tương ứng
      console.log('🎉 Auto-login thành công với user:', userInfo);
      
      // Sử dụng AuthUtils để điều hướng đúng theo role
      AuthUtils.handlePostAuthNavigation(navigation as any, userInfo.userRole);
    } else {
      // Chưa đăng nhập → chuyển qua Splash (auth flow)
      console.log('👋 Chưa đăng nhập - chuyển qua Splash');
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require('../../../../assets/images/logo.png')} // Đường dẫn tới logo của bạn
          style={styles.logo}
          resizeMode="contain"
        />
        
        {/* Auth Checker */}
        {showAuthChecker && (
          <AuthChecker onAuthComplete={handleAuthComplete}>
            {/* Logo sẽ vẫn hiển thị phía trên */}
          </AuthChecker>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFB', // Màu nền như trong hình
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 420,
    height: 420,
  
  },

});

export default WelcomScreen;