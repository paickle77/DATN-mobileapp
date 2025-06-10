import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 40) / 2;

interface ItemCategory {
  id: string;
  name: string;
  price: number;
  rating: number;
  category: string;
  image: string;
}

interface ProductGridProps {
  data: ItemCategory[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ data }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const renderItem = ({ item }: { item: ItemCategory }) => {
    const isSelected = selectedId === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          isSelected && styles.selectedBorder,
        ]}
        onPress={() => setSelectedId(item.id)}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>
          {item.price.toLocaleString()} vnd
        </Text>
        <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedBorder: {
    borderColor: '#00f',
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    color: '#999',
  },
});

export default ProductGrid;
