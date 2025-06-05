
import { useColorScheme } from '@/hooks/useColorScheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryItem from '../(tabs)/component/category';
import Tabbar from '../(tabs)/component/tabbar';
import Home from './screens/Home';
import index from './screens/Login';
import Onboarding from './screens/Onboarding';
import Register from './screens/Register';
import Splash from './screens/Splash';
import Welcom from './screens/Welcom';
import OtpVerification from './screens/OtpVerification';
import NewPassword   from './screens/NewPassword';
import CompleteProfile from './screens/CompleteProfile';
import CartScreen from './screens/Cart'
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const Stack = createNativeStackNavigator();
  return (
      <Stack.Navigator initialRouteName="cart">
        <Stack.Screen name="Home" component={Home}  options={{ headerShown: false }} />
        <Stack.Screen name="Splash" component={Splash}  options={{ headerShown: false }} />
        <Stack.Screen name="Welcom" component={Welcom}  options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" component={Onboarding}  options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={index}  options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="OtpVerification" component={OtpVerification} options={{ headerShown: false }} />
        <Stack.Screen name="NewPassword" component={NewPassword} options={{ headerShown: false }} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfile} options={{ headerShown: false }} />
            <Stack.Screen name="Tabbar" component={Tabbar} options={{ headerShown: false }} />
              <Stack.Screen name="category" component={CategoryItem} options={{ headerShown: false }} />
                 <Stack.Screen name="cart" component={CartScreen} options={{ headerShown: false }} />
              
      </Stack.Navigator>

  );
}
