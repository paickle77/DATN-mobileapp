
import { useColorScheme } from '@/hooks/useColorScheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryItem from '../(tabs)/component/category';
import Odercomponent from './component/Odercomponent';
import VoucherCardList from './component/VoucherCardList';
import AddressScreen from './screens/address/Address';
import ManualAddress from './screens/address/manual-address';
import MapAddress from './screens/address/MapAddress';
import index from './screens/auth/Login';
import NewPassword from './screens/auth/NewPassword';
import Onboarding from './screens/auth/Onboarding';
import OtpVerification from './screens/auth/OtpVerification';
import Register from './screens/auth/Register';
import Splash from './screens/auth/Splash';
import Welcom from './screens/auth/Welcom';
import ChatScreen from './screens/chat/Chat';
import TabNavigator from './screens/navigation/TabNavigator';
import NotificationDemo from './screens/notification/NotificationDemo';
import NotificationScreen from './screens/notification/NotificationScreen';
import testPushTokenService from './screens/notification/testPushTokenService';
import CartScreen from './screens/order/Cart';
import { default as Cart, default as CartScreen } from './screens/order/Cart';
import Checkout from './screens/order/Checkout';
import CheckoutCard from './screens/order/CheckoutCardScreen';
import CheckoutSuccess from './screens/order/CheckoutSuccessScreen';
import OderDetails from './screens/order/OrderDetails';
import OrderHistoryScreen from './screens/order/OrderHistoryScreen';
import PaymentMethods from './screens/order/PaymentMethods';
import CommentScreen from './screens/product/Comment';
import Detail from './screens/product/Detail';
import Home from './screens/product/Home';
import ReviewScreen from './screens/product/ReviewScreen';
import AddressList from './screens/profile/AddressList';
import CompleteProfile from './screens/profile/CompleteProfile';
import PaymentScreen from './screens/profile/Payement';
import ProfileScreen from './screens/profile/Profile';
import Settings from './screens/profile/Settings/Settings';
import UserProfile from './screens/profile/UserProfile';
import VoucherScreen from './screens/profile/VoucherScreen';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator initialRouteName="Welcom">
      {/* Screens không có tab bar */}
       <Stack.Screen name="VoucherCardList" component={VoucherCardList} options={{ headerShown: false }} />
      <Stack.Screen name="testPushTokenService" component={testPushTokenService} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationDemo" component={NotificationDemo} options={{ headerShown: false }} />
      <Stack.Screen name="payment" component={PaymentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="comment" component={CommentScreen} options={{ headerShown: false }} />      
        <Stack.Screen name="OderDetails" component={OderDetails} options={{ headerShown: false }} />
       <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
       <Stack.Screen name="Odercomponent" component={Odercomponent} options={{ headerShown: false }} />
      <Stack.Screen name="ReviewScreen" component={ReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderHistoryScreen" component={OrderHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
      <Stack.Screen name="Welcom" component={Welcom} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} />
      <Stack.Screen name="Address" component={AddressScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SelectLocation" component={MapAddress} options={{ headerShown: false }} />
      <Stack.Screen name="ManualAddress" component={ManualAddress} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={index} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
      <Stack.Screen name="OtpVerification" component={OtpVerification} options={{ headerShown: false }} />
      <Stack.Screen name="NewPassword" component={NewPassword} options={{ headerShown: false }} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfile} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={Checkout} options={{ headerShown: false }} />
      <Stack.Screen name="CheckoutSuccess" component={CheckoutSuccess} options={{ headerShown: false }} />
      <Stack.Screen name="CheckoutCard" component={CheckoutCard} options={{ headerShown: false }} />
      <Stack.Screen name="CartScreen" component={CartScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Review" component={ReviewScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CategoryItem" component={CategoryItem} options={{ headerShown: false }} />
      <Stack.Screen name="Cart" component={Cart} options={{ headerShown: false }} />
      

      {/* Tab Navigator - chứa Home, Cart, Favourite, Profile */}
      <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />

      {/* Screens có thể được navigate từ tab navigator */}
      <Stack.Screen name="category" component={CategoryItem} options={{ headerShown: false }} />
      <Stack.Screen name="Detail" component={Detail} options={{ headerShown: false }} />

      {/* Settings Screen - được navigate từ Profile */}
      <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
      <Stack.Screen name="UserProfile" component={UserProfile} options={{ headerShown: false }} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethods} options={{ headerShown: false }} />
      <Stack.Screen name="AddressList" component={AddressList} options={{ headerShown: false }} />
      <Stack.Screen name="VoucherScreen" component={VoucherScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}