import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import favoriteAuthService from '../../services/FavoritesService';
import { getUserData } from '../utils/storage';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2;

type RootStackParamList = {
  Detail: { productId: string } | undefined;
};

const FavoritesScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const favoriteItems = await favoriteAuthService.getFavoritesByAccount();
          console.log('Favorites data:', favoriteItems);
          
          // Lấy danh sách sản phẩm từ favorite items và validate
          const validProducts = favoriteItems
            .map((item: any) => item.product_id)
            .filter((product: any) => product && product._id && product.name);
          
          setUserProducts(validProducts);
        } catch (error) {
          console.error('❌ Lỗi khi gọi API:', error);
          Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải danh sách yêu thích. Vui lòng thử lại.');
          setUserProducts([]);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  const toggleFavorite = async (productId: string): Promise<void> => {
    try {
      const accountId = await getUserData('accountId');
      if (!accountId) {
        Alert.alert('Lỗi', 'Không xác định được người dùng');
        return;
      }

      const result = await favoriteAuthService.getAll();
      const data = result?.data ?? [];

      const matched = data.find(
        (item: any) => item.Account_id === accountId && item.product_id?._id === productId
      );

      if (matched && matched._id) {
        await favoriteAuthService.delete(matched._id);
        setUserProducts(prev => prev.filter(p => p._id !== productId));
        Alert.alert('Thông báo', 'Đã xóa khỏi danh sách yêu thích!');
      } else {
        Alert.alert('Thông báo', 'Sản phẩm không tồn tại trong danh sách yêu thích.');
      }
    } catch (err) {
      console.error('❌ Lỗi xoá sản phẩm yêu thích:', err);
      Alert.alert('Lỗi', 'Không thể xóa sản phẩm khỏi yêu thích.');
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderFavoriteItem = ({ item }: { item: any }) => {
    // Kiểm tra dữ liệu sản phẩm có hợp lệ không
    if (!item || !item._id || !item.name) {
      return null;
    }

    return (
      <TouchableOpacity onPress={() => {
        console.log('🔄 Navigating to Detail with productID:', item._id);
        navigation.navigate('Detail', { productId: item._id });
      }}>
        <View style={styles.itemContainer}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
              style={styles.itemImage}
              defaultSource={{ uri: 'https://via.placeholder.com/150' }}
            />
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(item._id);
              }}
            >
              <Ionicons name="trash" size={20} color="#A0522D" />
            </TouchableOpacity>
          </View>

          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
              {item.name || 'Sản phẩm không xác định'}
            </Text>
            <Text style={styles.priceText}>
              {item.discount_price || item.price ? formatPrice(item.discount_price || item.price) : 'Giá không xác định'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu thích</Text>
        <View style={styles.favoriteCount}>
          <Ionicons name="heart" size={20} color="#FF6B6B" />
          <Text style={styles.countText}>{userProducts.length}</Text>
        </View>
      </View>

      <FlatList
        data={userProducts}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.itemsList}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF0E6', paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#8B4513' },
  favoriteCount: { flexDirection: 'row', alignItems: 'center' },
  countText: { marginLeft: 4, fontSize: 16, fontWeight: '600', color: '#8B4513' },
  itemsList: { paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  itemContainer: { 
    width: itemWidth, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    marginBottom: 16, 
    shadowColor: '#8B4513', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 4, 
    elevation: 4,
    borderWidth: 1,
    borderColor: '#DEB887'
  },
  imageContainer: { position: 'relative' },
  itemImage: { width: '100%', height: 120, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  favoriteButton: { 
    position: 'absolute', 
    top: 8, 
    right: 8, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 15, 
    width: 30, 
    height: 30, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#8B4513', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 2, 
    elevation: 2,
    borderWidth: 1,
    borderColor: '#DEB887'
  },
  itemInfo: { padding: 12 },
  itemName: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#8B4513', 
    marginBottom: 8,
    lineHeight: 18,
    width: '100%',
    textAlign: 'left'
  },
  priceText: { fontSize: 14, fontWeight: 'bold', color: '#FF7F7F' },
});

export default FavoritesScreen;

