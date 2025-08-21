import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

interface ItemCart {
  name: string;
  price: string;
  image: string;
  Size: string | number;
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
  const swipeableRef = useRef<Swipeable>(null);

  const handlePressDown = () => {
    if (quantily > 1) {
      Dowtoquantily(quantily - 1);
    }
  };

  const handlePressUp = () => {
    Uptoquantily(quantily + 1);
  };

  const handleDelete = () => {
    onRemove();
    // Đóng swipeable sau khi xóa
    swipeableRef.current?.close();
  };

  // Render right action (delete button) - hiện khi vuốt sang trái
  const renderRightAction = () => {
    return (
      <Animated.View style={styles.deleteAction}>
        <TouchableOpacity style={styles.deleteContainer} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable 
      ref={swipeableRef}
      renderRightActions={renderRightAction}
      rightThreshold={20}
      overshootRight={false}
      friction={2}
    >
      <View style={styles.container}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <Text style={styles.size}>Size: {Size}</Text>
          <Text style={styles.price}>{price}</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity 
              style={[styles.button, quantily === 1 && styles.buttonDisabled]} 
              onPress={handlePressDown}
              disabled={quantily === 1}
            >
              <Feather name="minus" size={16} color={quantily === 1 ? "#ccc" : "#333"} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantily}</Text>
            <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handlePressUp}>
              <Feather name="plus" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#2c3e50',
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 8,
    fontWeight: '700',
  },
  size: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
    fontWeight: '500',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: '#2c3e50',
  },
  button: {
    backgroundColor: '#ecf0f1',
    padding: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  buttonDisabled: {
    backgroundColor: '#f8f9fa',
    opacity: 0.5,
  },
  addButton: {
    backgroundColor: '#5C4033',
  },
  deleteAction: {
    backgroundColor: '#fa071cff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: 80,
    marginLeft: 8,
  },
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    borderRadius: 10,
  },
  deleteText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

export default CartItem;
