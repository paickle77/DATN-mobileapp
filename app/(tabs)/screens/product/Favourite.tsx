import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
import { favoriteAuthService } from '../../services/FavoritesService';
import { getUserData } from '../utils/storage';
// Types
interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  category: string;
  image: string;
}

type Category = 'Tất cả' | 'Bánh bông lan' | 'Bánh quy' | 'Bánh kem' | 'Flan' | 'Quy';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2;

const FavoritesScreen: React.FC = () => {
  const categories: Category[] = ['Tất cả', 'Bánh bông lan', 'Bánh quy', 'Bánh kem', 'Flan','Quy'];
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Tất cả');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userProducts, setUserProducts] = useState<any[]>([]);




  useEffect(() => {
    const fetchData = async () => {
      const user = await getUserData('userData');
      if (user) {
        console.log('User ID:', user);
      }
    };
    fetchData();
  }, []);


useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const user = await getUserData('userData');
      console.log('User ID yêu thích:', user);

      const result = await favoriteAuthService.getAll();
      console.log('✅ Dữ liệu trả về từ API:', JSON.stringify(result, null, 2));

      if (result.data && result.data.length > 0) {
        // So sánh userId với user_id trong data
        const matched = result.data.filter((item: any) => item.user_id === user);
        
        console.log('🟢 Matched data:', JSON.stringify(matched, null, 2));

        // Lấy tất cả sản phẩm từ các matched item
        const products = matched.flatMap((item: any) => item.product_id);

        console.log('🟣 Sản phẩm cần render:', JSON.stringify(products, null, 2));

        setUserProducts(products);

        Alert.alert('Thành công', `Đã tìm thấy ${products.length} sản phẩm yêu thích`);
      } else {
        Alert.alert('Thông báo', 'Không tìm thấy dữ liệu yêu thích');
      }

    } catch (error) {
      console.error('❌ Lỗi khi gọi API:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


const toggleFavorite = (itemId: string): void => {
  setFavorites(prev =>
    prev.includes(itemId)
      ? prev.filter(id => id !== itemId)
      : [...prev, itemId]
  );
};




const filteredItems = selectedCategory === 'Tất cả'
  ? userProducts
  : userProducts.filter((item: any) => {
      // Lọc theo tên sản phẩm hoặc logic khác tuỳ anh muốn
      if (selectedCategory === 'Bánh kem') return item.name.toLowerCase().includes('kem');
      if (selectedCategory === 'Bánh quy') return item.name.toLowerCase().includes('quy');
      if (selectedCategory === 'Bánh bông lan') return item.name.toLowerCase().includes('bông lan');
      if (selectedCategory === 'Flan') return item.name.toLowerCase().includes('flan');
      if (selectedCategory === 'Quy') return item.name.toLowerCase().includes('quy'); // nếu cần riêng biệt
      return false;
    });


  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.selectedCategoryText
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

const renderFavoriteItem = ({ item }: { item: any }) => (
  <View style={styles.itemContainer}>
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item._id)}
      >
        <Ionicons
          name={favorites.includes(item._id) ? 'heart' : 'heart-outline'}
          size={20}
          color={favorites.includes(item._id) ? '#FF6B6B' : '#666'}
        />
      </TouchableOpacity>
    </View>

    <View style={styles.itemInfo}>
      <Text style={styles.itemName} numberOfLines={2}>
        {item.name}
      </Text>

      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>

      <Text style={styles.priceText}>
        {formatPrice(item.discount_price || item.price)}
      </Text>
    </View>
  </View>
);


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu thích</Text>
        <View style={styles.favoriteCount}>
          <Ionicons name="heart" size={20} color="#FF6B6B" />
          <Text style={styles.countText}>{filteredItems.length}</Text>
        </View>
      </View>

      {/* Categories */}
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

      {/* Items Grid */}
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
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  favoriteCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingRight: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCategoryButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A5568',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  itemsList: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: itemWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4A5568',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
});

export default FavoritesScreen;