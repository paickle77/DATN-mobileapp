import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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

const FavoritesScreen: React.FC = () => {
  const categories = ['Tất cả', 'Bánh bông lan', 'Bánh quy', 'Bánh kem', 'Flan', 'Quy'];
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const user = await getUserData('accountId');
          const accountId = user
          console.log('User ID yêu thích:', accountId);

          const result = await favoriteAuthService.getAll();
          const matched = result.data.filter((item: any) => item.Account_id === accountId);
          const products = matched.map((item: any) => item.product_id);
          setUserProducts(products);
        } catch (error) {
          console.error('❌ Lỗi khi gọi API:', error);
          Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  const toggleFavorite = async (productId: string): Promise<void> => {
    try {
      const user = await getUserData('accountId');
      const accountId = user
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

  const filteredItems = selectedCategory === 'Tất cả'
    ? userProducts
    : userProducts.filter((item: any) => {
        if (selectedCategory === 'Bánh kem') return item.name.toLowerCase().includes('kem');
        if (selectedCategory === 'Bánh quy') return item.name.toLowerCase().includes('quy');
        if (selectedCategory === 'Bánh bông lan') return item.name.toLowerCase().includes('bông lan');
        if (selectedCategory === 'Flan') return item.name.toLowerCase().includes('flan');
        if (selectedCategory === 'Quy') return item.name.toLowerCase().includes('quy');
        return false;
      });

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.categoryButton, selectedCategory === item && styles.selectedCategoryButton]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[styles.categoryText, selectedCategory === item && styles.selectedCategoryText]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderFavoriteItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Detail', { id: item._id })}>
      <View style={styles.itemContainer}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item._id);
            }}
          >
            <Ionicons name="trash" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.priceText}>{formatPrice(item.discount_price || item.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu thích</Text>
        <View style={styles.favoriteCount}>
          <Ionicons name="heart" size={20} color="#FF6B6B" />
          <Text style={styles.countText}>{filteredItems.length}</Text>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredItems}
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
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2D3748' },
  favoriteCount: { flexDirection: 'row', alignItems: 'center' },
  countText: { marginLeft: 4, fontSize: 16, fontWeight: '600', color: '#4A5568' },
  categoriesContainer: { marginBottom: 20 },
  categoriesList: { paddingRight: 16 },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  selectedCategoryButton: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#4A5568' },
  selectedCategoryText: { color: '#FFFFFF' },
  itemsList: { paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  itemContainer: { width: itemWidth, backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  imageContainer: { position: 'relative' },
  itemImage: { width: '100%', height: 120, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  favoriteButton: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FFFFFF', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  itemInfo: { padding: 12 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#2D3748', marginBottom: 4, lineHeight: 18 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingText: { marginLeft: 4, fontSize: 12, color: '#4A5568' },
  priceText: { fontSize: 14, fontWeight: 'bold', color: '#FF6B35' },
});

export default FavoritesScreen;
