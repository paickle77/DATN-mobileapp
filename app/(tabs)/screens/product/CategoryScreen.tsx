import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URL } from '../../services/api';
import categoryService, { Category } from '../../services/CategoryService';
import productService, { Product } from '../../services/ProductsService';
import { getUserData, saveUserData } from '../utils/storage';

const { width } = Dimensions.get('window');

const CategoryScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cartCount, setCartCount] = useState(0);

  const navigation = useNavigation();

  // Lấy categoryID từ storage và fetch dữ liệu
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        const categoryData = await getUserData('categoryID');
        if (!categoryData) {
          Alert.alert('Lỗi', 'Không tìm thấy danh mục');
          navigation.goBack();
          return;
        }

        const categories = await categoryService.getAllCategories();
        setCategories(categories);
        
        const selectedCategory = categories.find(cat => cat.name === categoryData);
        if (selectedCategory) {
          setCurrentCategory(selectedCategory);
          
          const allProducts = await productService.getAllProducts();
          setProducts(allProducts);
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu danh mục');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  // Fetch cart count - tính tổng quantity thay vì số items
  const fetchCartCount = async () => {
    try {
      const user = await getUserData('userData');
      if (!user) return;

      const response = await axios.get(`${BASE_URL}/GetAllCarts`);
      const allCarts = response.data.data;
      const userCarts = allCarts.filter((cart: any) => cart.user_id === user);
      
      // Tính tổng quantity của tất cả sản phẩm trong giỏ hàng
      const totalQuantity = userCarts.reduce((total: number, cart: any) => {
        return total + (cart.quantity || 1);
      }, 0);
      
      setCartCount(totalQuantity);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  // Load cart count when screen focuses
  useEffect(() => {
    fetchCartCount();
    
    // Listen for navigation focus to refresh cart count
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCartCount();
    });

    return unsubscribe;
  }, [navigation]);

  // Lọc và sắp xếp sản phẩm
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || !currentCategory) return [];
    
    let filtered = products.filter((item) => {
      const name = item.name.toLowerCase();
      const matchesSearch = name.includes(searchText.toLowerCase().trim());
      
      const categoryName = item.category_id?.name?.toLowerCase() || '';
      const matchesCategory = categoryName === currentCategory.name.toLowerCase();
      
      return matchesSearch && matchesCategory && item.is_active; 
    });

    // Sắp xếp
    switch (sortBy) {
      case 'price_low':
        return filtered.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
      case 'price_high':
        return filtered.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      default:
        return filtered;
    }
  }, [searchText, products, currentCategory, sortBy]);

  // Render product item cho grid view
  const renderGridItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.gridProductCard}
      onPress={async () => {
        await saveUserData({ value: item._id, key: 'productID' });
        navigation.navigate('Detail');
      }}
      activeOpacity={0.9}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image_url }} style={styles.gridProductImage} />
        
        {/* Discount badge */}
        {item.discount_price && item.discount_price < item.price && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              -{Math.round(((item.price - item.discount_price) / item.price) * 100)}%
            </Text>
          </View>
        )}

        {/* Favorite button */}
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={16} color="#FF4757" />
        </TouchableOpacity>
      </View>

      <View style={styles.gridProductInfo}>
        <Text style={styles.gridProductName} numberOfLines={2}>
          {item.name}
        </Text>
        
        <View style={styles.priceContainer}>
          {item.discount_price && item.discount_price < item.price ? (
            <>
              <Text style={styles.gridDiscountPrice}>
                ₫{item.discount_price.toLocaleString()}
              </Text>
              <Text style={styles.gridOriginalPrice}>
                ₫{item.price.toLocaleString()}
              </Text>
            </>
          ) : (
            <Text style={styles.gridPrice}>
              ₫{item.price.toLocaleString()}
            </Text>
          )}
        </View>

        <View style={styles.ratingAndSold}>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star} 
                  name={star <= Math.floor(item.rating || 0) ? "star" : "star-outline"} 
                  size={12} 
                  color="#FFD700" 
                />
              ))}
            </View>
            <Text style={styles.ratingText}>({item.rating || 0})</Text>
          </View>
          <Text style={styles.soldText}>Đã bán 999+</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render product item cho list view
  const renderListItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.listProductCard}
      onPress={async () => {
        await saveUserData({ value: item._id, key: 'productID' });
        navigation.navigate('Detail');
      }}
      activeOpacity={0.9}
    >
      <View style={styles.listImageContainer}>
        <Image source={{ uri: item.image_url }} style={styles.listProductImage} />
        {item.discount_price && item.discount_price < item.price && (
          <View style={styles.listDiscountBadge}>
            <Text style={styles.discountText}>
              -{Math.round(((item.price - item.discount_price) / item.price) * 100)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.listProductInfo}>
        <Text style={styles.listProductName} numberOfLines={2}>
          {item.name}
        </Text>
        
        <View style={styles.listRatingContainer}>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star} 
                  name={star <= Math.floor(item.rating || 0) ? "star" : "star-outline"} 
                  size={12} 
                  color="#FFD700" 
                />
              ))}
            </View>
            <Text style={styles.ratingText}>({item.rating || 0})</Text>
          </View>
          <Text style={styles.soldText}>Đã bán 999+</Text>
        </View>

        <View style={styles.listPriceContainer}>
          {item.discount_price && item.discount_price < item.price ? (
            <View style={styles.listPriceRow}>
              <Text style={styles.listDiscountPrice}>
                ₫{item.discount_price.toLocaleString()}
              </Text>
              <Text style={styles.listOriginalPrice}>
                ₫{item.price.toLocaleString()}
              </Text>
            </View>
          ) : (
            <Text style={styles.listPrice}>
              ₫{item.price.toLocaleString()}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.listFavoriteButton}>
        <Ionicons name="heart-outline" size={20} color="#FF4757" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const sortOptions = [
    { key: 'default', label: 'Liên quan' },
    { key: 'newest', label: 'Mới nhất' },
    { key: 'price_low', label: 'Giá thấp' },
    { key: 'price_high', label: 'Giá cao' },
    { key: 'rating', label: 'Đánh giá' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6B4F35" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4F35" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6B4F35" />
      
      {/* Header giống Shopee */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Tìm trong ${currentCategory?.name || 'danh mục'}`}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="bag-outline" size={24} color="#fff" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter và Sort Bar */}
      <View style={styles.filterBar}>
        <View style={styles.leftFilters}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                sortBy === option.key && styles.activeFilterButton
              ]}
              onPress={() => setSortBy(option.key)}
            >
              <Text style={[
                styles.filterButtonText,
                sortBy === option.key && styles.activeFilterButtonText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.rightFilters}>
          <TouchableOpacity style={styles.viewModeButton}>
            <Ionicons name="options-outline" size={16} color="#666" />
            <Text style={styles.viewModeText}>Lọc</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons 
              name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'} 
              size={16} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} sản phẩm
        </Text>
      </View>

      {/* Products List */}
      <View style={styles.productsContainer}>
        {filteredProducts.length > 0 ? (
          <FlatList
            data={filteredProducts}
            renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
            keyExtractor={(item) => item._id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            key={viewMode} // Force re-render when view mode changes
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
            columnWrapperStyle={viewMode === 'grid' ? styles.productRow : undefined}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
            <Text style={styles.emptySubtitle}>
              {searchText ? 
                'Thử thay đổi từ khóa tìm kiếm' : 
                'Danh mục này hiện chưa có sản phẩm'
              }
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },

  // Header Styles (Shopee-like)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6B4F35',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 12,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  cartButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6B4F35',
    zIndex: 10,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Filter Bar
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  leftFilters: {
    flexDirection: 'row',
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeFilterButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#6B4F35',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#6B4F35',
    fontWeight: '600',
  },
  rightFilters: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  viewModeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },

  // Results Bar
  resultsBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultsText: {
    fontSize: 12,
    color: '#666',
  },

  // Products Container
  productsContainer: {
    flex: 1,
  },
  productsList: {
    padding: 8,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },

  // Grid View Styles
  gridProductCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 4,
    width: (width - 32) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImageContainer: {
    position: 'relative',
  },
  gridProductImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4757',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridProductInfo: {
    padding: 8,
  },
  gridProductName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  priceContainer: {
    marginBottom: 4,
  },
  gridPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4757',
  },
  gridDiscountPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4757',
  },
  gridOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  ratingAndSold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  soldText: {
    fontSize: 12,
    color: '#999',
  },

  // List View Styles
  listProductCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  listProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listDiscountBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#FF4757',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listProductInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listProductName: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginBottom: 4,
  },
  listRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listPriceContainer: {
    justifyContent: 'flex-end',
  },
  listPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4757',
  },
  listDiscountPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4757',
    marginRight: 8,
  },
  listOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  listFavoriteButton: {
    padding: 8,
    justifyContent: 'center',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default CategoryScreen;