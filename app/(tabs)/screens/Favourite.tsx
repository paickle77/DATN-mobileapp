import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ProductGrid from '../component/ProductGrid';

const sampleProducts = [
  {
    id: '1',
    name: 'Tiramisu Dâu',
    price: 235000,
    rating: 4.8,
    category: 'Tiramisu',
     image:
      'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
  },
  {
    id: '2',
    name: 'Tiramisu Trái cây',
    price: 230000,
    rating: 4.9,
    category: 'Tiramisu',
    image:
      'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
  },
  {
    id: '3',
    name: 'Tiramisu Xoài',
    price: 215000,
    rating: 4.9,
    category: 'Tiramisu',
    image:
      'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
  },
  {
    id: '4',
    name: 'Tiramisu Dưa Lưới',
    price: 275000,
    rating: 5.0,
    category: 'Tiramisu',
     image:
      'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
  },
  {
    id: '5',
    name: 'Tiramisu Socola',
    price: 265000,
    rating: 4.8,
    category: 'Tiramisu',
     image:
      'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
  },
  {
    id: '6',
    name: 'Tiramisu Việt Quất',
    price: 290000,
    rating: 5.0,
    category: 'Tiramisu',
    image:
      'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
  },
];

const category = ['Tất cả', 'Su kem', 'Macaron', 'Tiramisu', 'Gato', 'Quy'];

const Favourite = () => {
  const [selectedFilter, setSelectedFilter] = useState('Tất cả');

  // 🔍 Lọc dữ liệu
  const filteredProducts =
    selectedFilter === 'Tất cả'
      ? sampleProducts
      : sampleProducts.filter(
          (item) => item.category === selectedFilter
        );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {category.map((filter) => (
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
          </ScrollView>
        </View>

        <ProductGrid data={filteredProducts} />

      </ScrollView>
        
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    paddingTop: 10,
    // paddingHorizontal: 10,
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
    borderColor: '#000',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  activeFilterText: {
    color: '#fff',
  },
  
});

export default Favourite;
