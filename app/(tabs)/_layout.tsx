import { Stack, Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import index from '../(tabs)/index'
import Register from './Register';
import Tabbar from '../(tabs)/component/tabbar'
import CategoryItem from '../(tabs)/component/category'
import Home from './Home';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const Stack = createNativeStackNavigator();
  return (

      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home}  options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={index}  options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
            <Stack.Screen name="Tabbar" component={Tabbar} options={{ headerShown: false }} />
              <Stack.Screen name="category" component={CategoryItem} options={{ headerShown: false }} />
      </Stack.Navigator>

  );
}
