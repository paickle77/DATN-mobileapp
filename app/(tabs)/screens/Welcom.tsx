import React, { useEffect } from 'react';
import {
  Image,
  StyleSheet,
  View
} from 'react-native';

const WelcomScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Splash');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require('../../../assets/images/logo.png')} // Đường dẫn tới logo của bạn
          style={styles.logo}
          resizeMode="contain"
        />
        
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
    width: 520,
    height: 520,
  
  },

});

export default WelcomScreen;