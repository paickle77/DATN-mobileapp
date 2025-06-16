// screens/Home.tsx
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
const cakeFilters = ['Tất cả', 'Su kem', 'Macaron', 'Tiramisu', 'Flan'];

// ----------------------------
// Dữ liệu sản phẩm (grid 2 cột)
const cakeItems = [
  {
    id: 'cake001',
    name: 'Tiramisu Dâu',
    rating: 4.8,
    price: 135000,
    image: 'https://tiki.vn/blog/wp-content/uploads/2024/08/thumb-15.jpg',
  },
  {
    id: 'cake002',
    name: 'Tiramisu Trái cây',
    rating: 4.9,
    price: 195000,
    image:
      'https://www.huongnghiepaau.com/wp-content/uploads/2017/11/tart-trai-cay-tot-cho-suc-khoe.jpg',
  },
  {
    id: 'cake003',
    name: 'Cheesecake Dâu',
    rating: 4.7,
    price: 150000,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXDFjLB5H_9o42-ZEPwWHCaDN3sdNWQZFrlg&s',
  },
  {
    id: 'cake004',
    name: 'Bánh su kem',
    rating: 4.6,
    price: 120000,
    image:
      'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
  },
  {
    id: 'cake005',
    name: 'Bánh tart trứng',
    rating: 4.5,
    price: 130000,
    image:
      'https://cdn.tgdd.vn/Files/2015/03/23/624011/cach-lam-banh-tart-trung-banh-trung-kfc-egg-tart-hong-kong-7.jpg',
  },
  {
    id: 'cake006',
    name: 'Bánh mì ngọt kem',
    rating: 4.4,
    price: 100000,
    image: 'https://lambanhngon.com/news_pictures/eks1360998762.jpg',
  },
];

export default function Home() {
  const [searchText, setSearchText] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');
  const navigation = useNavigation();

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
    return cakeItems.filter((item) => {
      // 1. Lọc theo searchText (nếu người dùng có nhập)
      const matchesSearch =
        item.name.toLowerCase().includes(searchText.toLowerCase().trim());

      // 2. Lọc theo selectedFilter (nếu khác "Tất cả")
      let matchesFilter = true;
      if (selectedFilter !== 'Tất cả') {
        // Nếu tên bánh chứa đúng từ khóa của filter (case-insensitive)
        matchesFilter = item.name.toLowerCase().includes(selectedFilter.toLowerCase());
      }

      return matchesSearch && matchesFilter;
    });
  }, [searchText, selectedFilter]);

  // Render từng ô sản phẩm trong grid
  const renderCakeItem = ({ item }: { item: typeof cakeItems[0] }) => (

    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => {
  
      navigation.navigate('Detail');
      }}
    >
      <Image source={{ uri: item.image }} style={styles.cakeImage} />
      <Text style={styles.cakeName} numberOfLines={1}>
      {item.name}
      </Text>
      <View style={styles.cakeFooter}>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
      <Text style={styles.priceText}>{item.price.toLocaleString()} vnđ</Text>
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
            <TouchableOpacity key={cat.key} style={styles.categoryItem}>
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
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderCakeItem}
          contentContainerStyle={styles.gridContainer}
          scrollEnabled={false} // Cho FlatList hiển thị hết trong ScrollView
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
