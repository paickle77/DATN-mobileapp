import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Import các màn hình
import ChatScreen from '../chat/Chat';
import CartScreen from '../order/Cart';
import FavouriteScreen from '../product/Favourite';
import HomeScreen from '../product/Home';
import ProfileScreen from '../profile/Profile';

// Import icons
import { TouchableOpacity } from 'react-native';
import iconChat from '../../../../assets/images/iconchat.png';
import iconHeart from '../../../../assets/images/iconheart.png';
import iconHome from '../../../../assets/images/iconhome.png';
import iconBag from '../../../../assets/images/iconproduct.png';
import iconProfile from '../../../../assets/images/iconprofile.png';

const Tab = createBottomTabNavigator();

// Custom TabBar Component

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {

  const currentRoute = state.routes[state.index];
  if (currentRoute.name === 'Cart') {
    return null;
  }
  if (currentRoute.name === 'Chat') {
    return null;
  }
  
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

        // Lấy icon cho từng tab
        let iconSource;
        switch (route.name) {
          case 'Home':
            iconSource = iconHome;
            break;
          case 'Cart':
            iconSource = iconBag;
            break;
          case 'Favourite':
            iconSource = iconHeart;
            break;
          case 'Chat':
            iconSource = iconChat;
            break;
          case 'Profile':
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

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Favourite" component={FavouriteScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
    backgroundColor: '#111',
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