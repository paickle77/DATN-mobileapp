import { useColorScheme } from '@/hooks/useColorScheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryItem from '../(tabs)/component/category';
import Tabbar from '../(tabs)/component/tabbar';
import AddressScreen from './screens/Address';
import CompleteProfile from './screens/CompleteProfile';
import Home from './screens/Home';
import index from './screens/Login';
import ManualAddress from './screens/manual-address';
import MapAddress from './screens/MapAddress';
import NewPassword from './screens/NewPassword';
import Onboarding from './screens/Onboarding';
import OtpVerification from './screens/OtpVerification';
import Register from './screens/Register';
import Splash from './screens/Splash';
import Welcom from './screens/Welcom';
import CartScreen from './screens/Cart'
import Favourite from './screens/Favourite';
import Detail from './screens/Detail';
import CheckoutScreen from './screens/Checkout';
import CheckoutCardScreen from './screens/CheckoutCardScreen'
import CheckoutSuccessScreen from './screens/CheckoutSuccessScreen'


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const Stack = createNativeStackNavigator();
  return (
      <Stack.Navigator initialRouteName="Welcom">
        <Stack.Screen name="Home" component={Home}  options={{ headerShown: false }} />
        <Stack.Screen name="Splash" component={Splash}  options={{ headerShown: false }} />
        <Stack.Screen name="Welcom" component={Welcom}  options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" component={Onboarding}  options={{ headerShown: false }} />
        <Stack.Screen name="Address" component={AddressScreen}  options={{ headerShown: false }} />
        <Stack.Screen name="SelectLocation" component={MapAddress}  options={{ headerShown: false }} />
        <Stack.Screen name="ManualAddress" component={ManualAddress}  options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={index}  options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="OtpVerification" component={OtpVerification} options={{ headerShown: false }} />
        <Stack.Screen name="NewPassword" component={NewPassword} options={{ headerShown: false }} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfile} options={{ headerShown: false }} />
        <Stack.Screen name="Tabbar" component={Tabbar} options={{ headerShown: false }} />
        <Stack.Screen name="category" component={CategoryItem} options={{ headerShown: false }} />
        <Stack.Screen name="cart" component={CartScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Favourite" component={Favourite} options={{ headerShown: false }} />
        <Stack.Screen name="Detail" component={Detail} options={{ headerShown: false }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CheckoutCard" component={CheckoutCardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CheckoutSuccess" component={CheckoutSuccessScreen} options={{ headerShown: false }} />

      </Stack.Navigator>

  );
}