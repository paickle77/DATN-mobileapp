import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface ItemHot {
  name: string;
  description:string;
  image: string;
}

const HotItem: React.FC<ItemHot> = ({ name,description,image }) => {
  return (
    <TouchableOpacity style={styles.itemContainer}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.quantity}> {description}</Text>
    </TouchableOpacity>
  );
};

export default HotItem;
const styles = StyleSheet.create({
  itemContainer: {
    height:220,
    width: 190,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quantity: {
    fontSize: 12,
    color: 'gray',
  },
});


