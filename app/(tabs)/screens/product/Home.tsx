// screens/Home.tsx
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { BASE_URL } from '../../services/api';

const { width, height } = Dimensions.get('window');

// ----------------------------
// Banner data với gradient thay vì ảnh local
const banners = [
  {
    id: 'b1',
    title: 'Bộ sưu tập mới',
    subtitle: 'Giảm 20% cho đơn hàng đầu tiên',
    buttonText: 'Khám phá ngay',
    gradient: ['#7B5E43', '#6B4F35', '#5A3D29'],
    emoji: '🎂',
  },
  {
    id: 'b2',
    title: 'Ưu đãi đặc biệt',
    subtitle: 'Mua 2 tặng 1 trong tháng này',
    buttonText: 'Mua ngay',
    gradient: ['#A1866F', '#6B4F35', '#3E2B1F'],
    emoji: '🧁',
  },
  {
    id: 'b3',
    title: 'Flash Sale',
    subtitle: 'Giảm tới 50% các sản phẩm hot',
    buttonText: 'Xem ngay',
    gradient: ['#BFA88F', '#92785E', '#6B4F35'],
    emoji: '⚡',
  },
];

// ----------------------------
// Filter data với subcategories
const cakeFilters = [
  { key: 'all', label: 'Tất cả', count: 0 },
  { key: 'cake', label: 'Bánh kem', count: 0 },
  { key: 'cookie', label: 'Bánh quy', count: 0 },
  { key: 'sponge', label: 'Bánh bông lan', count: 0 },
];

// Sort options
const sortOptions = [
  { key: 'newest', label: 'Mới nhất', icon: 'time-outline' },
  { key: 'price_asc', label: 'Giá tăng dần', icon: 'arrow-up' },
  { key: 'price_desc', label: 'Giá giảm dần', icon: 'arrow-down' },
  { key: 'discount', label: 'Giảm giá nhiều', icon: 'pricetag' },
  { key: 'rating', label: 'Đánh giá cao', icon: 'star' },
];

// Popular search keywords
const popularKeywords = [
  'bánh sinh nhật', 'bánh chocolate', 'bánh red velvet', 'cupcake', 
  'bánh macaron', 'bánh donut', 'bánh croissant', 'bánh cheesecake'
];

import ItemProductHome from '../../component/ItemProductHome';
import detailService from '../../services/DetailService';
import homeService from '../../services/HomeService';
import type { Product } from '../../services/ProductsService';
import productService from '../../services/ProductsService';
import { getUserData, saveUserData } from '../utils/storage';

// Advanced Search Component
const AdvancedSearch = ({ 
  searchText, 
  onSearchChange, 
  onFocus, 
  onBlur, 
  isSearchFocused,
  searchHistory,
  onSelectSuggestion,
  suggestions,
  onClearHistory
}: {
  searchText: string;
  onSearchChange: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  isSearchFocused: boolean;
  searchHistory: string[];
  onSelectSuggestion: (suggestion: string) => void;
  suggestions: Product[];
  onClearHistory: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isSearchFocused]);

  return (
    <View style={styles.advancedSearchContainer}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bánh ngon..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={onSearchChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onSearchChange('')}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Suggestions Overlay */}
      {isSearchFocused && (
        <Animated.View 
          style={[styles.searchOverlay, { opacity: fadeAnim }]}
          pointerEvents={isSearchFocused ? 'auto' : 'none'}
        >
          <ScrollView style={styles.suggestionsContainer}>
            {/* Product Suggestions */}
            {suggestions.length > 0 && (
              <View style={styles.suggestionSection}>
                <Text style={styles.suggestionSectionTitle}>Sản phẩm</Text>
                {suggestions.slice(0, 5).map((product) => (
                  <TouchableOpacity
                    key={product._id}
                    style={styles.suggestionItem}
                    onPress={() => onSelectSuggestion(product.name)}
                  >
                    <Image source={{ uri: product.image_url }} style={styles.suggestionImage} />
                    <View style={styles.suggestionTextContainer}>
                      <Text style={styles.suggestionName}>{product.name}</Text>
                      <Text style={styles.suggestionPrice}>
                        {product.discount_price > 0 && product.discount_price < product.price 
                          ? product.discount_price.toLocaleString() 
                          : product.price.toLocaleString()}₫
                      </Text>
                    </View>
                    <Ionicons name="arrow-up-outline" size={16} color="#999" style={{ transform: [{ rotate: '45deg' }] }} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && searchText.length === 0 && (
              <View style={styles.suggestionSection}>
                <View style={styles.historySectionHeader}>
                  <Text style={styles.suggestionSectionTitle}>Tìm kiếm gần đây</Text>
                  <TouchableOpacity onPress={onClearHistory}>
                    <Text style={styles.clearHistoryText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
                {searchHistory.slice(0, 5).map((term, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => onSelectSuggestion(term)}
                  >
                    <Ionicons name="time-outline" size={20} color="#999" />
                    <Text style={styles.historyText}>{term}</Text>
                    <Ionicons name="arrow-up-outline" size={16} color="#999" style={{ transform: [{ rotate: '45deg' }] }} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Popular Keywords */}
            {searchText.length === 0 && (
              <View style={styles.suggestionSection}>
                <Text style={styles.suggestionSectionTitle}>Từ khóa phổ biến</Text>
                <View style={styles.keywordsContainer}>
                  {popularKeywords.map((keyword, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.keywordChip}
                      onPress={() => onSelectSuggestion(keyword)}
                    >
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

// Sort Modal Component
const SortModal = ({ 
  visible, 
  onClose, 
  selectedSort, 
  onSelectSort 
}: {
  visible: boolean;
  onClose: () => void;
  selectedSort: string;
  onSelectSort: (sort: string) => void;
}) => {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={styles.modalBackground} onPress={onClose} />
      <View style={styles.sortModal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Sắp xếp theo</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortOption,
              selectedSort === option.key && styles.selectedSortOption
            ]}
            onPress={() => {
              onSelectSort(option.key);
              onClose();
            }}
          >
            <Ionicons 
              name={option.icon as any} 
              size={20} 
              color={selectedSort === option.key ? '#667eea' : '#666'} 
            />
            <Text style={[
              styles.sortOptionText,
              selectedSort === option.key && styles.selectedSortOptionText
            ]}>
              {option.label}
            </Text>
            {selectedSort === option.key && (
              <Ionicons name="checkmark" size={20} color="#667eea" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function Home() {
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showSortModal, setShowSortModal] = useState(false);
  
  const navigation = useNavigation();
  const [allData, setAllData] = useState<Product[]>([]);
  const [displayData, setDisplayData] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [productRatings, setProductRatings] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Infinite scroll states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const ITEMS_PER_PAGE = 6;

  // Cache cho ratings
  const [ratingsCache, setRatingsCache] = useState<{ [key: string]: number }>({});
  const [loadedRatings, setLoadedRatings] = useState<Set<string>>(new Set());

  // Debounced search function sử dụng HomeService
  const debouncedSearch = useMemo(
    () => homeService.debounce((query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      const suggestions = homeService.getSearchSuggestions(allData, query, 5);
      setSuggestions(suggestions);
    }, 300),
    [allData]
  );

  // Load search history from local storage only (không gọi server)
  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const localHistory = await getUserData('searchHistory');
        if (localHistory && Array.isArray(localHistory)) {
          setSearchHistory(localHistory);
        }
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    };
    loadSearchHistory();
  }, []);

  // Save search term với validation
  const saveSearchTerm = async (term: string) => {
    const validation = homeService.validateSearchQuery(term);
    if (!validation.isValid || searchHistory.includes(validation.sanitizedQuery!)) {
      return;
    }

    const sanitizedTerm = validation.sanitizedQuery!;
    const newHistory = [sanitizedTerm, ...searchHistory.slice(0, 9)];
    setSearchHistory(newHistory);
    
    try {
      await saveUserData({ key: 'searchHistory', value: JSON.stringify(newHistory) });
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Clear search history from local only
  const clearSearchHistory = async () => {
    setSearchHistory([]);
    
    try {
      await saveUserData({ key: 'searchHistory', value: JSON.stringify([]) });
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  // Update search suggestions sử dụng HomeService
  const updateSuggestions = useCallback((text: string) => {
    debouncedSearch(text);
  }, [debouncedSearch]);

  // Handle search text change with validation
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    updateSuggestions(text);
  };

  // Handle search suggestion selection với validation
  const handleSelectSuggestion = async (suggestion: string) => {
    const validation = homeService.validateSearchQuery(suggestion);
    if (!validation.isValid) {
      console.warn('Invalid suggestion:', validation.message);
      return;
    }

    setSearchText(validation.sanitizedQuery!);
    setIsSearchFocused(false);
    await saveSearchTerm(validation.sanitizedQuery!);
  };

  // Load rating for product
  const loadRatingForProduct = async (productId: string) => {
    if (loadedRatings.has(productId) || ratingsCache[productId] !== undefined) {
      return ratingsCache[productId] || 0;
    }

    try {
      const summary = await detailService.getReviewSummary(productId);
      const rating = summary.averageRating;
      
      setRatingsCache(prev => ({ ...prev, [productId]: rating }));
      setLoadedRatings(prev => new Set([...prev, productId]));
      setProductRatings(prev => ({ ...prev, [productId]: rating }));
      
      return rating;
    } catch (error) {
      console.error(`Error loading rating for product ${productId}:`, error);
      return 0;
    }
  };

  // Load unread notification count (không dùng HomeService)
  const loadUnreadNotificationCount = async () => {
    try {
      const userId = await getUserData('userId');
      if (!userId) return;

      const response = await fetch(`${BASE_URL}/notifications/unread-count/${userId}`);
      if (!response.ok) return;

      const data = await response.json();
      if (data.msg === 'OK') {
        setUnreadNotificationCount(data.data.count);
      }
    } catch (error) {
      console.error('Error loading notification count:', error);
      setUnreadNotificationCount(0);
    }
  };

  // Fetch all products
  const fetchProducts = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const products = await productService.getAllProducts();
      setAllData(products);

      // Reset pagination when refreshing
      if (isRefreshing) {
        setCurrentPage(1);
        // Clear ratings cache to reload fresh ratings
        setRatingsCache({});
        setLoadedRatings(new Set());
        setProductRatings({});

        // Load fresh ratings for all products
        const ratingsObj: { [key: string]: number } = {};
        for (const product of products) {
          try {
            const summary = await detailService.getReviewSummary(product._id);
            ratingsObj[product._id] = summary.averageRating;
          } catch (error) {
            ratingsObj[product._id] = 0;
          }
        }
        setProductRatings(ratingsObj);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setAllData([]);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    await Promise.all([
      fetchProducts(true),
      loadUnreadNotificationCount()
    ]);
  };

  useEffect(() => {
    fetchProducts();
    loadUnreadNotificationCount();
  }, []);

  // Refresh notification count when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUnreadNotificationCount();
    });
    return unsubscribe;
  }, [navigation]);

  // Auto scroll banner
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (currentBannerIndex + 1) % banners.length;
      setCurrentBannerIndex(next);
      bannerScrollRef.current?.scrollTo({ x: next * (width - 32), animated: true });
    }, 4000);
    return () => clearInterval(timer);
  }, [currentBannerIndex]);

  // Filter and sort products sử dụng HomeService
  const filteredAndSortedProducts = useMemo(() => {
    if (!Array.isArray(allData)) return [];

    // Filter by search
    let filtered = homeService.filterProductsBySearch(allData, searchText);
    
    // Filter by category
    filtered = homeService.filterProductsByCategory(filtered, selectedFilter);

    // Sort products
    filtered = homeService.sortProducts(filtered, selectedSort, productRatings);

    return filtered;
  }, [searchText, selectedFilter, selectedSort, allData, productRatings]);

  // Update display data for infinite scroll
  useEffect(() => {
    const totalItems = Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedProducts.length);
    setDisplayData(filteredAndSortedProducts.slice(0, totalItems));
    setHasMoreData(totalItems < filteredAndSortedProducts.length);
  }, [filteredAndSortedProducts, currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedFilter, selectedSort]);

  // Load more data
  const loadMoreData = () => {
    if (loadingMore || !hasMoreData) return;
    
    setLoadingMore(true);
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setLoadingMore(false);
    }, 500);
  };

  // Update filter counts sử dụng HomeService
  const filterCounts = useMemo(() => {
    const searchFiltered = homeService.filterProductsBySearch(allData, searchText);
    return homeService.getCategoryCounts(allData, searchFiltered);
  }, [allData, searchText]);

  // Render product item for FlatList
  const renderProductItem = ({ item, index }: { item: Product; index: number }) => {
    const rating = productRatings[item._id] || 0;

    return (
      <ItemProductHome
        item={item}
        index={index}
        rating={rating}
        onPress={async () => {
          await saveUserData({ value: item._id, key: 'productID' });
          (navigation as any).navigate('Detail');
        }}
        onLoadRating={loadRatingForProduct}
      />
    );
  };

  // Render list footer (loading indicator)
  const renderListFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#667eea" />
        <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const handleNotification = () => {
    (navigation as any).navigate('NotificationScreen');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        <Text style={styles.loadingSubText}>Chỉ mất vài giây thôi!</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header with Advanced Search */}
      <BlurView intensity={100} tint="light" style={styles.header}>
        <View style={styles.headerContent}>
          <AdvancedSearch
            searchText={searchText}
            onSearchChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
            isSearchFocused={isSearchFocused}
            searchHistory={searchHistory}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={suggestions}
            onClearHistory={clearSearchHistory}
          />

          <TouchableOpacity style={styles.bellButton} onPress={handleNotification}>
            <LinearGradient
              colors={['#8B6E4E', '#6B4F35']}
              style={styles.bellGradient}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {unreadNotificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>

      <FlatList
        data={displayData}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#795548']} // Android
            tintColor="#795548" // iOS
            title="Đang cập nhật..." // iOS
            titleColor="#666"
          />
        }
        ListFooterComponent={renderListFooter}
        ListHeaderComponent={
          <View>
            {/* Banner Slider */}
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
                {banners.map((banner) => (
                  <TouchableOpacity
                    key={banner.id}
                    style={styles.bannerCard}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={banner.gradient as any}
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

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScrollView}
              contentContainerStyle={styles.filterContainer}
            >
              {filterCounts.map((filter, index) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterPill,
                    selectedFilter === filter.key && styles.activeFilterPill,
                    { marginLeft: index === 0 ? 16 : 8 }
                  ]}
                  onPress={() => setSelectedFilter(filter.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedFilter === filter.key && styles.activeFilterText,
                    ]}
                  >
                    {filter.label}
                  </Text>
                  <View style={[
                    styles.filterCount,
                    selectedFilter === filter.key && styles.activeFilterCount
                  ]}>
                    <Text style={[
                      styles.filterCountText,
                      selectedFilter === filter.key && styles.activeFilterCountText
                    ]}>
                      {filter.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Products Section Header with Sort */}
            <View style={styles.productsSectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
                <Text style={styles.productsCount}>
                  {filteredAndSortedProducts.length} sản phẩm
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.sortButton}
                onPress={() => setShowSortModal(true)}
              >
                <Ionicons name="swap-vertical" size={18} color="#667eea" />
                <Text style={styles.sortButtonText}>Sắp xếp</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            <Text style={styles.emptySubText}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</Text>
          </View>
        }
      />

      {/* Sort Modal */}
      <SortModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
      />
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
    marginTop: 16,
  },

  loadingSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },

  /*====== Header với Advanced Search ======*/
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 1000,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /*====== Advanced Search ======*/
  advancedSearchContainer: {
    flex: 1,
    position: 'relative',
  },

  searchBox: {
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

  clearButton: {
    padding: 4,
  },

  searchOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    zIndex: 1001,
  },

  suggestionsContainer: {
    maxHeight: 380,
  },

  suggestionSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  suggestionSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  clearHistoryText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },

  suggestionImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },

  suggestionTextContainer: {
    flex: 1,
  },

  suggestionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },

  suggestionPrice: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '600',
  },

  historyText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },

  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  keywordChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },

  keywordText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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

  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  /*====== FlatList Container ======*/
  flatListContainer: {
    paddingBottom: 20,
  },

  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
    borderRadius: 20,
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

  /*====== Filter Pills với Count ======*/
  filterScrollView: {
    marginBottom: 24,
  },

  filterContainer: {
    paddingRight: 16,
  },

  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
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
    marginRight: 8,
  },

  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },

  filterCount: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },

  activeFilterCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  filterCountText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },

  activeFilterCountText: {
    color: '#fff',
  },

  /*====== Products Section Header với Sort ======*/
  productsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },

  productsCount: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
    marginTop: 2,
  },

  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  sortButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    marginLeft: 4,
  },

  /*====== Load More Indicator ======*/
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },

  loadingMoreText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },

  /*====== Empty State ======*/
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },

  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },

  /*====== Sort Modal ======*/
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 2000,
  },

  modalBackground: {
    flex: 1,
  },

  sortModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  selectedSortOption: {
    backgroundColor: '#f8f9ff',
  },

  sortOptionText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },

  selectedSortOptionText: {
    color: '#667eea',
    fontWeight: '600',
  },
});