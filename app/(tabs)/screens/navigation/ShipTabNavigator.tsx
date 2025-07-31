import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

// Các màn hình Ship
import DeliveredOrdersScreen from '../ship/DeliveredOrders';
import ShipHomeScreen from '../ship/ShipHome';
import ShipProfileScreen from '../ship/ShipProfile';

// Icon
import iconDelivered from '../../../../assets/images/iconDelivered.png'; // Đặt icon phù hợp cho "Đơn đã ship"
import iconHome from '../../../../assets/images/iconhome.png';
import iconProfile from '../../../../assets/images/iconprofile.png';

const Tab = createBottomTabNavigator();

// Custom TabBar cho ship
const CustomShipTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const currentRoute = state.routes[state.index];

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconSource;
        switch (route.name) {
          case 'ShipHome':
            iconSource = iconHome;
            break;
          case 'Delivered':
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
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomShipTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="ShipHome"
    >
      <Tab.Screen name="ShipHome" component={ShipHomeScreen} />
      <Tab.Screen name="Delivered" component={DeliveredOrdersScreen} />
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
