
import { useColorScheme } from '@/hooks/useColorScheme';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryItem from '../(tabs)/component/category';
import Tabbar from '../(tabs)/component/tabbar';
import index from '../(tabs)/index';
import Home from './Home';
import Register from './Register';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const Stack = createNativeStackNavigator();
  return (

      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Home" component={Home}  options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={index}  options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
            <Stack.Screen name="Tabbar" component={Tabbar} options={{ headerShown: false }} />
              <Stack.Screen name="category" component={CategoryItem} options={{ headerShown: false }} />
      </Stack.Navigator>

  );
}
