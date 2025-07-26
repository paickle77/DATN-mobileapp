// screens/Home.tsx
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


const { width, height } = Dimensions.get('window');

// ----------------------------
// Banner data với gradient thay vì ảnh local
const banners = [
  {
    id: 'b1',
    title: 'Bộ sưu tập mới',
    subtitle: 'Giảm 20% cho đơn hàng đầu tiên',
    buttonText: 'Khám phá ngay',
    gradient: ['#7B5E43', '#6B4F35', '#5A3D29'], // nâu nhạt → nâu trung tâm → nâu đậm
    emoji: '🎂',
  },
  {
    id: 'b2',
    title: 'Ưu đãi đặc biệt',
    subtitle: 'Mua 2 tặng 1 trong tháng này',
    buttonText: 'Mua ngay',
    gradient: ['#A1866F', '#6B4F35', '#3E2B1F'], // be nâu → nâu trung tâm → chocolate
    emoji: '🧁',
  },
  {
    id: 'b3',
    title: 'Flash Sale',
    subtitle: 'Giảm tới 50% các sản phẩm hot',
    buttonText: 'Xem ngay',
    gradient: ['#BFA88F', '#92785E', '#6B4F35'], // be sáng → nâu caramel → nâu chủ đạo
    emoji: '⚡',
  },
];


// ----------------------------
// Categories với icon unicode thay vì ảnh
const cakeCategories = [
  {
    key: 'cakes',
    label: 'Bánh kem',
    icon: '🎂',
    gradient: ['#FFF3E0', '#FFD180'], // cam kem nhạt → cam đào
  },
  {
    key: 'cookies',
    label: 'Bánh quy',
    icon: '🍪',
    gradient: ['#F0EBE3', '#D2B48C'], // kem sữa → nâu nhạt cookie
  },
  {
    key: 'macaron',
    label: 'Macaron',
    icon: '🥮',
    gradient: ['#F3E5F5', '#CE93D8'], // tím pastel → tím hồng
  },
  {
    key: 'donut',
    label: 'Donut',
    icon: '🍩',
    gradient: ['#E0F7FA', '#4DD0E1'], // xanh mint nhạt → xanh biển pastel
  },
];

// ----------------------------
// Filter data
const cakeFilters = ['Tất cả', 'Bánh bông lan', 'Bánh quy', 'Bánh kem', 'Flan'];

import detailService from '../../services/DetailService';
import type { Product } from '../../services/ProductsService';
import productService from '../../services/ProductsService';
import { getUserData, saveUserData } from '../utils/storage';

export default function Home() {
  const [searchText, setSearchText] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');
  const navigation = useNavigation();
  const [data, setData] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [productRatings, setProductRatings] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products = await productService.getAllProducts();
        setData(products);

        // Lấy rating thực từ API cho từng sản phẩm
        const ratings: { [key: string]: number } = {};
        await Promise.all(
          products.map(async (product) => {
            try {
              const reviewSummary = await detailService.getReviewSummary(product._id);
              ratings[product._id] = reviewSummary.averageRating || 0;
            } catch (error) {
              console.error(`Lỗi lấy rating cho sản phẩm ${product._id}:`, error);
              ratings[product._id] = 0;
            }
          })
        );
        setProductRatings(ratings);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // User data
  useEffect(() => {
    const fetchData = async () => {
      const user = await getUserData('userData');
      if (user) {
        console.log('User ID:', user);
      }
    };
    fetchData();
  }, []);

  // Auto scroll banner
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (currentBannerIndex + 1) % banners.length;
      setCurrentBannerIndex(next);
      bannerScrollRef.current?.scrollTo({ x: next * (width - 20), animated: true });
    }, 4000);
    return () => clearInterval(timer);
  }, [currentBannerIndex]);

  // Filter và sort products
  const filteredCakes = useMemo(() => {
    if (!Array.isArray(data)) return [];

    let filtered = data.filter((item) => {
      const name = item.name.toLowerCase();
      const categoryName = item.category_id?.name?.toLowerCase() || '';

      const matchesSearch = name.includes(searchText.toLowerCase().trim());

      let matchesFilter = true;
      if (selectedFilter !== 'Tất cả') {
        matchesFilter = categoryName.includes(selectedFilter.toLowerCase());
      }

      return matchesSearch && matchesFilter;
    });

    // Sắp xếp theo rating giảm dần (sản phẩm có rating cao lên đầu)
    filtered.sort((a, b) => {
      const ratingA = productRatings[a._id] || 0;
      const ratingB = productRatings[b._id] || 0;
      return ratingB - ratingA;
    });

    return filtered;
  }, [searchText, selectedFilter, data, productRatings]);

  // Render product item với UI hiện đại hơn
  const renderCakeItem = ({ item, index }: { item: Product; index: number }) => {
    const rating = productRatings[item._id] || 0;
    const hasDiscount = item.discount_price > 0 && item.discount_price < item.price;
    const displayPrice = hasDiscount ? item.discount_price : item.price;
    const discountPercent = hasDiscount ? Math.round(((item.price - item.discount_price) / item.price) * 100) : 0;

    return (
      <View style={styles.productWrapper}>
        <TouchableOpacity
          style={styles.modernGridItem}
          onPress={async () => {
            await saveUserData({ value: item._id, key: 'productID' });
            console.log("item._id products:", item._id);
            navigation.navigate('Detail');
          }}
          activeOpacity={0.95}
        >
          {/* Image Container với overlay effects */}
          <View style={styles.modernImageContainer}>
            <Image source={{ uri: item.image_url }} style={styles.modernCakeImage} />

            {/* Discount Badge */}
            {hasDiscount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercent}%</Text>
              </View>
            )}

            {/* Favorite Button */}
            <TouchableOpacity
              style={styles.modernFavoriteButton}
              onPress={() => console.log('Toggle favorite')}
            >
              <Ionicons name="heart-outline" size={18} color="#fff" />
            </TouchableOpacity>

            {/* Overlay Gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.1)']}
              style={styles.modernImageOverlay}
            />
          </View>

          {/* Product Info */}
          <View style={styles.modernProductInfo}>
            <Text style={styles.modernCakeName} numberOfLines={2}>
              {item.name}
            </Text>

            {/* Price Section */}
            <View style={styles.modernPriceSection}>
              <View style={styles.priceRow}>
                {hasDiscount && (
                  <Text style={styles.modernOriginalPrice}>
                    {item.price.toLocaleString()}₫
                  </Text>
                )}
                <Text style={styles.modernPriceText}>
                  {displayPrice.toLocaleString()}₫
                </Text>
              </View>

              {/* Rating Section */}
              <View style={styles.modernRatingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.modernRatingText}>
                  {rating > 0 ? rating.toFixed(1) : 'Chưa có'}
                </Text>
              </View>
            </View>

          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const handleNotification = () => {
    navigation.navigate('NotificationScreen');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ===== Header với glassmorphism ===== */}
      <BlurView intensity={100} tint="light" style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bánh ngon..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <TouchableOpacity style={styles.bellButton} onPress={handleNotification}>
            <LinearGradient
              colors={['#8B6E4E', '#6B4F35']}
              style={styles.bellGradient}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* ===== Banner Slider với animation ===== */}
        <View style={styles.bannerContainer}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 32}
            decelerationRate="fast"
            contentContainerStyle={styles.bannerScrollContent}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
              setCurrentBannerIndex(idx);
            }}
          >
            {banners.map((banner, idx) => (
              <TouchableOpacity
                key={banner.id}
                style={styles.bannerCard}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={banner.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bannerGradient}
                >
                  <View style={styles.bannerContent}>
                    <View style={styles.bannerTextSection}>
                      <Text style={styles.bannerEmoji}>{banner.emoji}</Text>
                      <Text style={styles.bannerTitle}>{banner.title}</Text>
                      <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                      <TouchableOpacity style={styles.bannerButton}>
                        <Text style={styles.bannerButtonText}>{banner.buttonText}</Text>
                        <Ionicons name="arrow-forward" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.dotsContainer}>
            {banners.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  currentBannerIndex === idx && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* ===== Categories với modern design ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={16} color="#667eea" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryGrid}>
          {cakeCategories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={styles.categoryItem}
              activeOpacity={0.8}
              onPress={async () => {
                await saveUserData({ value: cat.label, key: 'categoryID' });
                navigation.navigate('Category');
              }}
            >
              <LinearGradient
                colors={cat.gradient}
                style={styles.categoryIconContainer}
              >
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              </LinearGradient>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ===== Filter Pills ===== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterContainer}
        >
          {cakeFilters.map((filter, index) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                selectedFilter === filter && styles.activeFilterPill,
                { marginLeft: index === 0 ? 16 : 8 }
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ===== Products Grid ===== */}
        <View style={styles.productsSection}>
          <View style={styles.productsSectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
            <Text style={styles.productsCount}>
              {filteredCakes.length} sản phẩm
            </Text>
          </View>

          <View style={styles.modernGridContainer}>
            {filteredCakes.map((item, index) => (
              <View key={item._id}>
                {renderCakeItem({ item, index })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },

  /*====== Header với glassmorphism ======*/
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    height: 50,
    marginRight: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },

  bellButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  bellGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollView: {
    flex: 1,
  },

  /*====== Banner Modern ======*/
  bannerContainer: {
    marginTop: 20,
    marginBottom: 24,
  },

  bannerScrollContent: {
    paddingHorizontal: 16,
  },

  bannerCard: {
    width: width - 32,
    height: 160,
    marginRight: 16,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },

  bannerGradient: {
    flex: 1,
    padding: 20,
  },

  bannerContent: {
    flex: 1,
    justifyContent: 'center',
  },

  bannerTextSection: {
    flex: 1,
    justifyContent: 'center',
  },

  bannerEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },

  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },

  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    lineHeight: 18,
  },

  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },

  bannerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: '#667eea',
    width: 24,
  },

  /*====== Section Headers ======*/
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  seeAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginRight: 4,
  },

  /*====== Categories Grid căn đều ======*/
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 24,
  },

  categoryItem: {
    alignItems: 'center',
    width: (width - 80) / 4, // Chia đều 4 cột với margin
    marginBottom: 8,
  },

  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  categoryEmoji: {
    fontSize: 28,
  },

  categoryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },

  /*====== Filter Pills ======*/
  filterScrollView: {
    marginBottom: 24,
  },

  filterContainer: {
    paddingRight: 16,
  },

  filterPill: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#fff',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  activeFilterPill: {
    backgroundColor: '#667eea',
  },

  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },

  /*====== Products Section ======*/
  productsSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },

  productsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  productsCount: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },

  /*====== Modern Products Grid ======*/
  modernGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },

  productWrapper: {
    width: (width - 48) / 2, // 2 cột với margin 16 mỗi bên + 16 giữa
    marginBottom: 20,
  },

  modernGridItem: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
  },

  /*====== Modern Image Container ======*/
  modernImageContainer: {
    position: 'relative',
    height: 160,
  },

  modernCakeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  modernImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },

  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },



  modernFavoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /*====== Modern Product Info ======*/
  modernProductInfo: {
    padding: 16,
    position: 'relative',
  },

  modernCakeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 20,
    marginBottom: 12,
    height: 40, // Fixed height để đồng bộ
  },

  modernPriceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },

  priceRow: {
    flex: 1,
  },

  modernOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },

  modernPriceText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
  },

  modernRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  modernRatingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },



  /*====== Empty State ======*/
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    width: width - 32,
  },

  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 4,
  },

  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
});