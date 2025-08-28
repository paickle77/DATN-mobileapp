import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { createContext, useContext, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

// Import các màn hình
import ChatScreen from '../chat/Chat';
import CartScreen from '../order/Cart';
import FavouriteScreen from '../product/Favourite';
import HomeScreen from '../product/Home';
import ProfileScreen from '../profile/Profile';

// Import icons
import { TouchableOpacity } from 'react-native';

const iconChat = require('../../../../assets/images/iconchat.png');
const iconHeart = require('../../../../assets/images/iconheart.png');
const iconHome = require('../../../../assets/images/iconhome.png');
const iconBag = require('../../../../assets/images/iconproduct.png');
const iconProfile = require('../../../../assets/images/iconprofile.png');

// Context để chia sẻ tabbar visibility control
interface TabBarContextType {
  showTabBar: () => void;
  hideTabBar: () => void;
  setTabBarVisibility: (visible: boolean) => void;
}

const TabBarContext = createContext<TabBarContextType | null>(null);

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within TabNavigator');
  }
  return context;
};

const Tab = createBottomTabNavigator();

// Custom TabBar Component với animation
const CustomTabBar = ({ 
  state, 
  descriptors, 
  navigation,
  tabBarVisible 
}: BottomTabBarProps & { tabBarVisible: Animated.Value }) => {
  const currentRoute = state.routes[state.index];
  if (currentRoute.name === 'Cart') {
    return null;
  }
  if (currentRoute.name === 'Chat') {
    return null;
  }
  
  return (
    <Animated.View style={[
      styles.tabBarContainer,
      {
        transform: [
          {
            translateY: tabBarVisible.interpolate({
              inputRange: [0, 1],
              outputRange: [120, 0], // Tăng khoảng cách slide xuống
            }),
          },
        ],
        opacity: tabBarVisible.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0.3, 1], // Fade in/out mượt hơn
        }),
      }
    ]}>
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
    </Animated.View>
  );
};

export default function TabNavigator() {
  const tabBarVisible = useRef(new Animated.Value(1)).current;
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  const showTabBar = () => {
    if (!isTabBarVisible) {
      setIsTabBarVisible(true);
      Animated.spring(tabBarVisible, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  };

  const hideTabBar = () => {
    if (isTabBarVisible) {
      setIsTabBarVisible(false);
      Animated.timing(tabBarVisible, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const setTabBarVisibility = (visible: boolean) => {
    if (visible) {
      showTabBar();
    } else {
      hideTabBar();
    }
  };

  const tabBarContextValue: TabBarContextType = {
    showTabBar,
    hideTabBar,
    setTabBarVisibility,
  };

  return (
    <TabBarContext.Provider value={tabBarContextValue}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} tabBarVisible={tabBarVisible} />}
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
    </TabBarContext.Provider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 15,
    right: 15,
    bottom: 20, // Tăng khoảng cách từ bottom
    height: 60,
    flexDirection: 'row',
    backgroundColor: 'rgba(55, 33, 4, 0.75)',  // Tăng opacity để rõ hơn
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 30,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 15,
    // Thêm backdrop blur effect cho iOS
    backdropFilter: 'blur(20px)',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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