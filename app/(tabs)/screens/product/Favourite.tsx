import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Types
interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  category: string;
  image: string;
}

type Category = 'Tất cả' | 'Su kem' | 'Macaron' | 'Tiramisu' | 'Gato' | 'Quy';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2;

const FavoritesScreen: React.FC = () => {
  const categories: Category[] = ['Tất cả', 'Su kem', 'Macaron', 'Tiramisu', 'Gato', 'Quy'];

  const favoriteItems: FavoriteItem[] = [
    {
      id: '1',
      name: 'Tiramisu Dâu',
      price: 235000,
      rating: 4.8,
      category: 'Tiramisu',
      image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
    },
    {
      id: '2',
      name: 'Su Kem Vanilla',
      price: 125000,
      rating: 4.7,
      category: 'Su kem',
      image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
    },
    {
      id: '3',
      name: 'Macaron Chocolate',
      price: 185000,
      rating: 4.9,
      category: 'Macaron',
      image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
    },
    {
      id: '4',
      name: 'Gato Socola Đen',
      price: 295000,
      rating: 4.6,
      category: 'Gato',
      image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
    },
    {
      id: '5',
      name: 'Quy Bơ Đậu Phộng',
      price: 85000,
      rating: 4.5,
      category: 'Quy',
      image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
    },
    {
      id: '6',
      name: 'Tiramisu Cà Phê',
      price: 245000,
      rating: 4.8,
      category: 'Tiramisu',
      image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
    },
    {
      id: '7',
      name: 'Su Kem Matcha',
      price: 135000,
      rating: 4.7,
      category: 'Su kem',
      image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
    },
    {
      id: '8',
      name: 'Macaron Dâu Tây',
      price: 195000,
      rating: 4.9,
      category: 'Macaron',
      image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState<Category>('Tất cả');
  const [favorites, setFavorites] = useState<string[]>(favoriteItems.map(item => item.id));

  const filteredItems = selectedCategory === 'Tất cả' 
    ? favoriteItems 
    : favoriteItems.filter(item => item.category === selectedCategory);

  const toggleFavorite = (itemId: string): void => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

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

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons
            name={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
            size={20}
            color={favorites.includes(item.id) ? '#FF6B6B' : '#666'}
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
          {formatPrice(item.price)}
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
          <Text style={styles.countText}>{favorites.length}</Text>
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
        keyExtractor={(item) => item.id}
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