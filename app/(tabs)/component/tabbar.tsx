import { useNavigation, useSegments } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

// Import các icon của bạn (đảm bảo những file PNG này đã được đặt trong đúng folder)
import iconChat from '../../../assets/images/iconchat.png';
import iconHeart from '../../../assets/images/iconheart.png';
import iconHome from '../../../assets/images/iconhome.png';
import iconBag from '../../../assets/images/iconproduct.png';
import iconProfile from '../../../assets/images/iconprofile.png';

export default function TabLayout() {
  const navigation = useNavigation();
  const segments = useSegments();

  // Lấy segment cuối cùng của URL, nếu trống thì mặc định 'home'
  const current = segments.length > 0 ? segments[segments.length - 1] : 'home';

  // Trả về true nếu segment hiện tại trùng key
  const isActive = (key: string) => current === key;

  return (
    <View style={styles.tabBarContainer}>
      {/* ---------- Home ---------- */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrapper, isActive('Home') && styles.activeWrapper]}>
          <Image
            source={iconHome}
            style={[styles.icon, isActive('Home') && styles.activeIcon]}
          />
        </View>
      </TouchableOpacity>

      {/* ---------- Cart ---------- */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('cart')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrapper, isActive('cart') && styles.activeWrapper]}>
          <Image
            source={iconBag}
            style={[styles.icon, isActive('cart') && styles.activeIcon]}
          />
        </View>
      </TouchableOpacity>

      {/* ---------- Wishlist ---------- */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('Favourite')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrapper, isActive('Favourite') && styles.activeWrapper]}>
          <Image
            source={iconHeart}
            style={[styles.icon, isActive('Favourite') && styles.activeIcon]}
          />
        </View>
      </TouchableOpacity>

      {/* ---------- Chat ---------- */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('chat')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrapper, isActive('chat') && styles.activeWrapper]}>
          <Image
            source={iconChat}
            style={[styles.icon, isActive('chat') && styles.activeIcon]}
          />
        </View>
      </TouchableOpacity>

      {/* ---------- Profile ---------- */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('Profile')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrapper, isActive('Profile') && styles.activeWrapper]}>
          <Image
            source={iconProfile}
            style={[styles.icon, isActive('Profile') && styles.activeIcon]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#111',        // Nền đen cho Tab Bar
    height: 60,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop:30,
    // ----------------------------------------
    // Bo góc hai bên (trên + dưới) để thấy “oval” phía sau:
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',             // Đảm bảo phần bo góc hiển thị chính xác
    // ----------------------------------------
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,               // Vòng tròn cho icon container (khi active, sẽ có oval trắng)
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeWrapper: {
    backgroundColor: '#fff',
    borderRadius:20        // Oval trắng phía sau icon active
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#fff',              // Icon trắng khi chưa active
  },
  activeIcon: {
    tintColor: '#6B4F35',           // Icon nâu khi active
  },
});
