import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import categoryService, { Category } from '../../services/CategoryService';
import productService, { Product } from '../../services/ProductsService';
import { getUserData, saveUserData } from '../utils/storage';

const { width } = Dimensions.get('window');

const CategoryScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState([]);

  const navigation = useNavigation();

    


  // Lấy categoryID từ storage và fetch dữ liệu
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Lấy categoryID từ storage (được set từ HomeScreen)
        const categoryData = await getUserData('categoryID');
        if (!categoryData) {
          Alert.alert('Lỗi', 'Không tìm thấy danh mục');
          navigation.goBack();
          return;
        }

        // Fetch tất cả categories để tìm category hiện tại
        const categories = await categoryService.getAllCategories();
        setCategories(categories);
        // Tìm category hiện tại theo label (vì HomeScreen lưu cat.label)
        const selectedCategory = categories.find(cat => cat.name === categoryData);
        if (selectedCategory) {
          setCurrentCategory(selectedCategory);
          
          // Fetch tất cả products và lọc theo category
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
  
  const banners = useMemo(() => {
    return categories.map((cat, index) => ({
        id: cat._id || `banner-${index}`,
        title: cat.name,
        subtitle: cat.description || 'Khám phá ngay sản phẩm mới',
        image: cat.image || 'https://bloganchoi.com/wp-content/uploads/2023/09/banh-ngot-1.jpg', // lấy ảnh từ category
    }));
    }, [categories]);


    useEffect(() => {
    const timer = setInterval(() => {
        setCurrentBannerIndex(prev => {
        const next = (prev + 1) % banners.length;
        bannerScrollRef.current?.scrollTo({ x: next * (width - 32), animated: true });
        return next;
        });
    }, 3000);
    return () => clearInterval(timer);
    }, [banners.length]); // chỉ chạy lại khi danh sách banner thay đổi


  // Lọc sản phẩm theo từ khóa tìm kiếm và category
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products) || !currentCategory) return [];
    
    return products.filter((item) => {
      const name = item.name.toLowerCase();
      const matchesSearch = name.includes(searchText.toLowerCase().trim());
      
      // Lọc theo category name (giống như HomeScreen)
      const categoryName = item.category_id?.name?.toLowerCase() || '';
      const matchesCategory = categoryName === currentCategory.name.toLowerCase();
      
      return matchesSearch && matchesCategory && item.is_active; 
    });
  }, [searchText, products, currentCategory]);

  // Render từng sản phẩm
  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={async () => {
        await saveUserData({ value: item._id, key: 'productID' });
        console.log("Selected product ID:", item._id);
        navigation.navigate('Detail');
      }}
    >
      <Image source={{ uri: item.image_url }} style={styles.productImage} />

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>

        <View style={styles.priceContainer}>
          {item.discount_price && item.discount_price < item.price ? (
            <>
              <Text style={styles.originalPrice}>
                {item.price.toLocaleString()} vnđ
              </Text>
              <Text style={styles.discountPrice}>
                {item.discount_price.toLocaleString()} vnđ
              </Text>
            </>
          ) : (
            <Text style={styles.price}>
              {item.price.toLocaleString()} vnđ
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentCategory?.name || 'Category'}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Category Info */}
    <View style={styles.bannerContainer}>
        <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 32}
            decelerationRate="fast"
            scrollEventThrottle={16}
            onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                setCurrentBannerIndex(idx);
            }}
            contentContainerStyle={{
                paddingLeft: 16,
                paddingRight: 0, // Không cần padding cuối
            }}
            >
            {banners.map((b, idx) => (
                <TouchableOpacity
                key={b.id}
                style={{
                    width: width - 32,
                    marginRight: idx !== banners.length - 1 ? 16 : 0, // spacing giữa các banner
                    height: 140,
                    backgroundColor: '#F2E9DE',
                    borderRadius: 12,
                    flexDirection: 'row',
                    overflow: 'hidden',
                }}
                onPress={async () => {
                    await saveUserData({ key: 'categoryID', value: b.title });
                    navigation.replace('Category');
                }}
                >
                <ImageBackground
                    source={require('../../../../assets/images/default-banner.png')}
                    defaultSource={require('../../../../assets/images/default-banner.png')}
                    style={styles.bannerImageBackground}
                    imageStyle={{ borderRadius: 12 }}
                    >
                    <View style={styles.bannerOverlay}>
                        <Text style={styles.bannerTitle}>{b.title}</Text>
                        <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                    </View>
                </ImageBackground>
                </TouchableOpacity>
            ))}
            </ScrollView>

        <View style={styles.dotsContainer}>
            {banners.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, currentBannerIndex === idx && styles.activeDot]}
                />
          ))}
        </View>
    </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Products List */}
      <View style={styles.productsContainer}>
        {filteredProducts.length > 0 ? (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
            columnWrapperStyle={styles.productRow}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText ? 
                `Không tìm thấy sản phẩm "${searchText}"` : 
                'Danh mục chưa có sản phẩm nào'
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
    backgroundColor: '#f8f9fa',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  bannerContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  bannerCard: {
    width: width - 32,    // mỗi card hẹp hơn màn 16px hai bên
    height: 140,
    backgroundColor: '#F2E9DE',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  bannerImageBackground: {
    width: width - 32,
    height: 140,
    justifyContent: 'center',
    paddingHorizontal: 16,
},

    bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.2)', // tạo lớp mờ
    padding: 10,
    borderRadius: 12,
    },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  bannerButton: {
    backgroundColor: '#6B4F35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bannerImageCard: {
    width: 120,
    height: 140,
    resizeMode: 'cover',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#6B4F35',
  },
  categoryInfo: {
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productsList: {
    paddingTop: 16,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: (width - 48) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default CategoryScreen;