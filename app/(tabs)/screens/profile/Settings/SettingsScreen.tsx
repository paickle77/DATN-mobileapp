import { Feather, Ionicons } from '@expo/vector-icons';

import { NavigationProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';
import { getUserData } from '../../utils/storage';

interface Props {
  setScreen: (screen: 'notifications' | 'password' | 'delete', userId?: string) => void;
  onBack?: () => void;
}

type RootStackParamList = {
 
};

const SettingsScreen = ({ setScreen, onBack }: Props) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = await getUserData('userData');
        setUserId(user || '');
        console.log("userID:", user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const menuItems = [
    {
      id: 'notifications',
      icon: 'notifications-outline',
      iconType: 'Ionicons',
      title: 'Cài đặt thông báo',
      subtitle: 'Quản lý thông báo và cảnh báo',
      color: '#4A90E2',
      bgColor: '#E8F4FD',
      onPress: () => setScreen('notifications', userId)
    },
    {
      id: 'password',
      icon: 'lock',
      iconType: 'Feather',
      title: 'Quản lý mật khẩu',
      subtitle: 'Đổi mật khẩu và bảo mật',
      color: '#50C878',
      bgColor: '#E8F8F5',
      onPress: () => setScreen('password', userId)
    },
    {
      id: 'delete',
      icon: 'trash-2',
      iconType: 'Feather',
      title: 'Xóa tài khoản',
      subtitle: 'Xóa vĩnh viễn tài khoản của bạn',
      color: '#FF6B6B',
      bgColor: '#FFF0F0',
      onPress: () => setScreen('delete', userId)
    }
  ];
  
  onBack = onBack || (() => {});
   
  const renderIcon = (item: any) => {
    if (item.iconType === 'Ionicons') {
      return <Ionicons name={item.icon} size={24} color={item.color} />;
    }
    return <Feather name={item.icon} size={22} color={item.color} />;
  };

  // Hiển thị loading nếu đang fetch user data
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      {/* Header với gradient */}
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back-circle-outline" size={40} color="#000" />
                  </TouchableOpacity>
            <Text style={styles.headerTitle}>Cài đặt</Text>
            <View style={styles.headerSpacer} />
          </View>
          <Text style={styles.headerSubtitle}>Quản lý tài khoản và ứng dụng</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
      
        {/* Settings Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Cài đặt chung</Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
              disabled={!userId} // Disable nếu chưa có userId
            >
              <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                {renderIcon(item)}
              </View>
              
              <View style={styles.menuContent}>
                <Text style={[
                  styles.menuLabel,
                  item.id === 'delete' && { color: item.color }
                ]}>
                  {item.title}
                </Text>
                <Text style={[
                  styles.menuSubtitle,
                  item.id === 'delete' && { color: item.color, opacity: 0.7 }
                ]}>
                  {item.subtitle}
                </Text>
              </View>
              
              <Feather 
                name="chevron-right" 
                size={20} 
                color={item.id === 'delete' ? item.color : '#C7C7CC'} 
              />
            </TouchableOpacity>
          ))}
        </View>

       
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;