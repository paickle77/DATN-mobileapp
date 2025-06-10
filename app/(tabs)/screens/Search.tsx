import { Search, Star } from 'lucide-react';
import React, { useState } from 'react';
import { FlatList, ImageBackground, StyleSheet, Text, TextInput, View } from 'react-native';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    {
        id: '1',
        name: 'Tiramisu Dâu',
        price: '235.000 vnđ',
        rating: 4.9,
        description: 'Tiramisu thơm ngon với dâu tây tươi',
        color: ['#FDE68A', '#F59E0B'],
        image: 'https://friendshipcakes.com/wp-content/uploads/2023/08/7-430x430.png',
    },
    {
        id: '2',
        name: 'Tiramisu Trái cây',
        price: '230.000 vnđ',
        rating: 4.9,
        description: 'Tiramisu kết hợp với nhiều loại trái cây',
        color: ['#FDBA74', '#FB923C'],
        image: 'https://miacake.vn/wp-content/uploads/banh-sinh-nhat-tiramisu-tiem-banh-da-nang-3.jpg',
    },
    {
        id: '3',
        name: 'Tiramisu Chocolate',
        price: '240.000 vnđ',
        rating: 4.8,
        description: 'Vị đậm đà của socola kết hợp tiramisu',
        color: ['#C4B5FD', '#8B5CF6'],
        image: 'https://legendary.com.vn/wp-content/uploads/2024/07/Huong-Dan-Cach-Lam-Tiramisu-Socola-Tai-Nha-2.jpg',
    },
    {
        id: '4',
        name: 'Tiramisu Matcha',
        price: '250.000 vnđ',
        rating: 4.7,
        description: 'Hương matcha tươi mát hòa quyện tiramisu',
        color: ['#86EFAC', '#22C55E'],
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7xRFc6a7e0JUigheFa_ciTynE3KGsMM1Ezg&s',
    },
    {
        id: '5',
        name: 'Mousse Chanh dây',
        price: '220.000 vnđ',
        rating: 4.6,
        description: 'Bánh mousse chanh dây mát lạnh, thơm nhẹ',
        color: ['#FDE68A', '#FCD34D'],
        image: 'https://www.huongnghiepaau.com/wp-content/uploads/2019/01/banh-mousse-chanh-day.jpg',
    },
    {
        id: '6',
        name: 'Bánh quy Chocolate',
        price: '20.000 vnđ',
        rating: 4.9,
        description: 'Bánh quy giòn tan, phủ chocolate đậm vị',
        color: ['#FBCFE8', '#F472B6'],
        image: 'https://down-vn.img.susercontent.com/file/f059487902e226383a269e928997a511',
        }

    ];


  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.imageContainer}
        imageStyle={{ borderRadius: 10 }}
      >
        {/* Overlay decoration */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10 },
          ]}
        />
      </ImageBackground>

      <View style={styles.infoContainer}>
        <View style={styles.rowBetween}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={12} color="#facc15" fill="#facc15" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search color="#999" size={20} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Tìm kiếm..."
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Product List */}
      <FlatList
        data={products.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
      />
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefce8',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  listContent: {
    gap: 16,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#4b5563',
  },
  priceText: {
    color: '#f97316',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
