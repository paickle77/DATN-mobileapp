import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const ProductCard = ({ imageUrl, category, name, description, price }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.name}>{name} | {description}</Text>
        <Text style={styles.price}>Giá : {price} VNĐ</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    margin: 8,
    alignItems: 'center'
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1
  },
  category: {
    color: 'green',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '500',
  }
});

export default ProductCard;
