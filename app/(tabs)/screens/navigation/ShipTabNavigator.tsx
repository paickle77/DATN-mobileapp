import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react';
import {
  AppState,
  AppStateStatus,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Các màn hình Ship
import DeliveredOrders from '../ship/DeliveredOrders';
import ShipHomeScreen from '../ship/ShipHome';
import ShipProfileScreen from '../ship/ShipProfile';

// Icon
import axios from 'axios';
import iconDelivered from '../../../../assets/images/iconDelivered.png';
import iconHome from '../../../../assets/images/iconhome.png';
import iconProfile from '../../../../assets/images/iconprofile.png';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

const Tab = createBottomTabNavigator();

// Custom TabBar cho ship
const CustomShipTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  // Bảo vệ lỗi nếu state chưa có routes hợp lệ
  if (!state?.routes?.length || state.index >= state.routes.length) {
    return null;
  }

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        if (!route) return null; // tránh route null

        const descriptor = descriptors[route.key];
        if (!descriptor) return null; // tránh descriptor null

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        };

        // Gán icon theo tên screen
        let iconSource = iconHome; // default
        switch (route.name) {
          case 'ShipHome':
            iconSource = iconHome;
            break;
          case 'DeliveredOrders': // đồng bộ đúng tên tab
            iconSource = iconDelivered;
            break;
          case 'ShipProfile':
            iconSource = iconProfile;
            break;
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isFocused && styles.activeWrapper]}>
              <Image
                source={iconSource}
                style={[styles.icon, isFocused && styles.activeIcon]}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function ShipTabNavigator() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    let shipperId: string | null = null;

    // Lấy ID khi mount
    (async () => {
      const id = await getUserData('shipperID');
      shipperId = id;
    })();

    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (appState.current.match(/active/) && nextAppState.match(/background|inactive/)) {
        if (shipperId) {
          try {
            await axios.post(`${BASE_URL}/shippers/updateStatus`, {
              _id: shipperId,
              is_online: 'offline',
            });
            console.log('📴 App chuyển offline');
          } catch (error) {
            console.error('❌ Lỗi set offline:', error);
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  
  
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomShipTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="ShipHome"
    >
      <Tab.Screen name="ShipHome" component={ShipHomeScreen} />
      <Tab.Screen name="DeliveredOrders" component={DeliveredOrders} />
      <Tab.Screen name="ShipProfile" component={ShipProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 0,
    height: 60,
    flexDirection: 'row',
    backgroundColor: 'rgba(55, 33, 4, 0.5)',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 30,
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 100,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  activeIcon: {
    tintColor: '#6B4F35',
  },
});
