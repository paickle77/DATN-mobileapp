import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

// Define types for props for better type safety
type ProductCardProps = {
  imageUrl: string;
  category: string;
  name: string;
  price: number; // Assuming price is a number for formatting
};

const ProductCard: React.FC<ProductCardProps> = ({ imageUrl, category, name, price }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover" // 'cover' fills the space, cropping if necessary
      />
      <View style={styles.textContainer}>
        <Text style={styles.category}>Tên : {name}</Text>
        <Text style={styles.name}>Loại : {category}</Text>
        <Text style={styles.price}>{price} VNĐ</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff', // Clean white background
    borderRadius: 12, // More rounded corners for a softer look
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // Android shadow
    marginVertical: 10, // More vertical space between cards
    marginHorizontal: 16, // Consistent horizontal margin
    padding: 12, // Increased padding
    alignItems: 'center', // Vertically align items in the center
    borderWidth: 0.5, // Subtle border
    borderColor: '#e0e0e0', // Light grey border
  },
  image: {
    width: 100, // Slightly larger image
    height: 100,
    borderRadius: 10, // Rounded image corners
    marginRight: 15, // More space to the text
    borderWidth: 0.5, // Small border around image
    borderColor: '#ddd',
  },
  textContainer: {
    flex: 1, // Allows text to take up remaining space
    justifyContent: 'center', // Vertically align text content
  },
  category: {
    fontSize: 13,
    fontWeight: '700', // Bolder category text
    color: '#28a745', // A pleasant green color for categories
    marginBottom: 4,
    textTransform: 'uppercase', // Make category text uppercase
  },
  name: {
    fontSize: 14,
    fontWeight: '600', // Bolder product name
    color: '#333333', // Darker color for main text
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    color: '#777777', // Lighter color for description
    marginBottom: 8, // Space before price
  },
  price: {
    fontSize: 18, // Larger font size for price
    fontWeight: 'bold', // Very bold price
    color: '#da1111ff', // A prominent blue for price
  },
});

export default ProductCard;