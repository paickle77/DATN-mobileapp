import { useColorScheme } from '@/hooks/useColorScheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryItem from '../(tabs)/component/category';
import AddressScreen from './screens/Address';
import CompleteProfile from './screens/CompleteProfile';
import Detail from './screens/Detail';
import index from './screens/Login';
import ManualAddress from './screens/manual-address';
import MapAddress from './screens/MapAddress';
import NewPassword from './screens/NewPassword';
import Onboarding from './screens/Onboarding';
import OtpVerification from './screens/OtpVerification';
import Register from './screens/Register';
import Settings from './screens/Settings';
import Splash from './screens/Splash';
import TabNavigator from './screens/TabNavigator';
import UserProfile from './screens/UserProfile';
import Welcom from './screens/Welcom';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const Stack = createNativeStackNavigator();
  
  return (
    <Stack.Navigator initialRouteName="Welcom">
      {/* Screens không có tab bar */}
      <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
      <Stack.Screen name="Welcom" component={Welcom} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} />
      <Stack.Screen name="Address" component={AddressScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SelectLocation" component={MapAddress} options={{ headerShown: false }} />
      <Stack.Screen name="ManualAddress" component={ManualAddress} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={index} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
      <Stack.Screen name="OtpVerification" component={OtpVerification} options={{ headerShown: false }} />
      <Stack.Screen name="NewPassword" component={NewPassword} options={{ headerShown: false }} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfile} options={{ headerShown: false }} />
      
      {/* Tab Navigator - chứa Home, Cart, Favourite, Profile */}
      <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />
      
      {/* Screens có thể được navigate từ tab navigator */}
      <Stack.Screen name="category" component={CategoryItem} options={{ headerShown: false }} />
      <Stack.Screen name="Detail" component={Detail} options={{ headerShown: false }} />

       {/* Settings Screen - được navigate từ Profile */}
      <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
      <Stack.Screen name="UserProfile" component={UserProfile} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}