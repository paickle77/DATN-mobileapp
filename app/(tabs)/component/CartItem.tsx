import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ItemCart {
  name: string;
  price: number;
  image: string;
  Size:number;
  quantily: number;
  Uptoquantily:(NewQuantily:number)=>void;
  Dowtoquantily:(NewQuantily:number)=>void
  onRemove: () => void;
}

const CartItem: React.FC<ItemCart> = ({
  price,
  name,
  image,
  quantily,
    Size,
  Dowtoquantily,
  Uptoquantily,
  onRemove
}) => {
    





  const handlePressDown = () => {
    if (quantily > 1) {
      Dowtoquantily(quantily - 1);
    }
  };

  const handlePressUp = () => {
    Uptoquantily(quantily + 1);
  };



  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.size}>{Size} </Text>
        <Text style={styles.price}>{price}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.button} onPress={handlePressDown}>
            <Feather name="minus" size={16} color="#333" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantily}</Text>
          <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handlePressUp}>
            <Feather name="plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Ionicons name="trash-outline" size={20} color="#aa0000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
      fontWeight: 'bold',
    marginBottom: 4,
    
  },
  price: {
    fontSize: 14,
    color: 'red',
    marginBottom: 8,
    fontWeight:'bold'
  },
   size: {
    fontSize: 14,
    color: 'black',
    marginBottom: 8,
    // fontWeight:'bold'
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#eee',
    padding: 6,
    borderRadius: 6,
  },
  addButton: {
    backgroundColor: '#5C4033',
  },
  removeButton: {
    paddingLeft: 10,
  },
});

export default CartItem;
