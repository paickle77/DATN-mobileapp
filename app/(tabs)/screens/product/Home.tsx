// screens/Home.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');


// ----------------------------
// Dữ liệu banner (dạng “card”):
import bannerCard from '../../../../assets/images/banner.png';
import bannerCard2 from '../../../../assets/images/banner2.png';
import type { Product } from '../../services/ProductsService';
import productService from '../../services/ProductsService';
import { getUserData, saveUserData } from '../utils/storage';

const banners = [
  {
    id: 'b1',
    title: 'Bộ sưu tập mới',
    subtitle: 'Giảm 10% cho đơn hàng đầu tiên',
    buttonText: 'Mua ngay',
    image: bannerCard,
  },
  {
    id: 'b2',
    title: 'Ưu đãi đặc biệt',
    subtitle: 'Mua 2 tặng 1 trong tháng này',
    buttonText: 'Xem ngay',
    image: bannerCard2,
  },
];

// ----------------------------
// Dữ liệu Loại Bánh
import iconBanhKem from '../../../../assets/images/iconbanhkem.png';
import iconBanhQuy from '../../../../assets/images/iconbanhquy.png';
import iconDonut from '../../../../assets/images/icondonut.png';
import iconMacaron from '../../../../assets/images/iconmacaron.png';

const cakeCategories = [
  { key: 'cakes',   label: 'Bánh kem', icon: iconBanhKem },
  { key: 'cookies', label: 'Bánh quy', icon: iconBanhQuy },
  { key: 'macaron', label: 'Macaron', icon: iconMacaron },
  { key: 'donut',   label: 'Donut',   icon: iconDonut },
];

// ----------------------------
// Dữ liệu Filter ngang (nhóm “Bánh”)
const cakeFilters = ['Tất cả', 'Bánh bông lan', 'Bánh quy', 'Bánh kem', 'Flan'];

// ----------------------------
// Dữ liệu sản phẩm (grid 2 cột)
export default function Home() {
  const [searchText, setSearchText] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');
  const navigation = useNavigation();
const [data, setData] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);



//     const url='http://192.168.0.116:3000/api/productsandcategoryid'

//   useEffect(() => {
// axios.get(url)
//   .then((res) => {
//     console.log('API response:', res.data); 
//     if (Array.isArray(res.data)) {
//       setData(res.data);
//     } else if (Array.isArray(res.data.data)) {
//       setData(res.data.data);
//     } else {
//       console.warn('Unexpected response format');
//       setData([]);
//     }
//   })
//   .catch((err) => {
//     console.error('API error:', err);
//     setData([]);
//   });

//   }, []);


useEffect(() => {
  const fetchProducts = async () => {
    try {
      const products = await productService.getAllProducts();
      setData(products);
    } catch (error) {
      setData([]);
    }
  };

  fetchProducts();
}, []);


useEffect(() => {
  const fetchData = async () => {
    const user = await getUserData('userData');
    if (user) {
      console.log('User ID:', user);
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



  // Tự động chuyển slide banner mỗi 3s
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (currentBannerIndex + 1) % banners.length;
      setCurrentBannerIndex(next);
      bannerScrollRef.current?.scrollTo({ x: next * (width - 32), animated: true });
    }, 3000);
    return () => clearInterval(timer);
  }, [currentBannerIndex]);

  // Dựa vào searchText và selectedFilter để lọc danh sách
const filteredCakes = useMemo(() => {
  if (!Array.isArray(data)) return [];

  return data.filter((item) => {
    const name = item.name.toLowerCase();
    const categoryName = item.category_id?.name?.toLowerCase() || '';

    const matchesSearch = name.includes(searchText.toLowerCase().trim());

    let matchesFilter = true;
    if (selectedFilter !== 'Tất cả') {
      matchesFilter = categoryName.includes(selectedFilter.toLowerCase());
    }

    return matchesSearch && matchesFilter;
  });
}, [searchText, selectedFilter, data]);







  // Render từng ô sản phẩm trong grid
 const renderCakeItem = ({ item }: { item: typeof data[0] }) => (
  <TouchableOpacity
    style={styles.gridItem}
    onPress={async () => {

      // Anh gọi ở màn Home:
      await saveUserData({ value: item._id, key: 'productID' });

      console.log("item._id products:",item._id)
      navigation.navigate('Detail'); // Có thể truyền id nếu cần


    }}
  >
    <Image source={{ uri: item.image_url }} style={styles.cakeImage} />
       {/* <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item._id)}
          >
            <Ionicons
              name={favorites.includes(item._id) ? 'heart' : 'heart-outline'}
              size={20}
              color={favorites.includes(item._id) ? '#FF6B6B' : '#666'}
            />
          </TouchableOpacity> */}
    <Text style={styles.cakeName} numberOfLines={1}>
      {item.name}
    </Text>
    <View style={styles.cakeFooter}>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
      <Text style={styles.priceText}>
        {item.price.toLocaleString()} vnđ
      </Text>
    </View>
  </TouchableOpacity>
);





  const handleNotification=()=>{
     navigation.navigate('NotificationScreen');
  }


  return (
    <View style={styles.screen}>
      {/* ===== Header: Search + Bell ===== */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>


        <TouchableOpacity style={styles.bellIcon} onPress={handleNotification}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ===== Banner Slider ===== */}
        <View style={styles.bannerContainer}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 32}   // mỗi “card” có width = width - 32
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 16 }}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
              setCurrentBannerIndex(idx);
            }}
          >
            {banners.map((b, idx) => (
              <View key={b.id} style={styles.bannerCard}>
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>{b.title}</Text>
                  <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                  <TouchableOpacity style={styles.bannerButton}>
                    <Text style={styles.bannerButtonText}>{b.buttonText}</Text>
                  </TouchableOpacity>
                </View>
                <Image source={b.image} style={styles.bannerImageCard} />
              </View>
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

        {/* ===== Loại Bánh ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại Bánh</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoryRow}>
          {cakeCategories.map((cat) => (
            <TouchableOpacity key={cat.key} style={styles.categoryItem} 
            onPress={async () => {
              await saveUserData({ value: cat.label, key: 'categoryID' });
              navigation.navigate('Category');
           }}>   
              <View style={styles.categoryIcon}>
                <Image source={cat.icon} style={styles.categoryImage} />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ===== Filter Horizontal ===== */}
        <View style={styles.filterRow}>
          {cakeFilters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.activeFilterChip,
              ]}
              onPress={() => setSelectedFilter(filter)}
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
        </View>

        {/* ===== Grid Sản Phẩm ===== */}
    <FlatList
  data={filteredCakes}
  keyExtractor={(item) => item._id}
  numColumns={2}
  renderItem={renderCakeItem}
  contentContainerStyle={styles.gridContainer}
  scrollEnabled={false}
  ListEmptyComponent={() => (
    <View style={{ marginTop: 20, alignItems: 'center' }}>
      <Text style={{ color: '#555' }}>Không có sản phẩm phù hợp.</Text>
    </View>
  )}
/>

      </ScrollView>

      {/* ===== Tab Bar “nổi” lên ở dưới ===== */}
     
    </View>
  );
}

const styles = StyleSheet.create({
  
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  /*====== Header: Search + Bell ======*/ 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
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
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    height: 40,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 4,
    fontSize: 14,
    color: '#333',
  },
  bellIcon: {
    padding: 8,
  },

  /*====== Banner Slider ======*/ 
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
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#333',
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

  /*====== Loại Bánh ======*/ 
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6B4F35',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2E9DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    tintColor: '#6B4F35',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#333',
  },

  /*====== Filter Chips ======*/ 
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  activeFilterChip: {
    backgroundColor: '#6B4F35',
    borderColor: '#6B4F35',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  activeFilterText: {
    color: '#fff',
  },

  /*====== Grid Sản Phẩm ======*/ 
  gridContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  gridItem: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  cakeImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cakeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 8,
    marginTop: 8,
  },
  cakeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#333',
  },
  priceText: {
    fontSize: 12,
    color: '#6B4F35',
    fontWeight: 'bold',
  },


});
