import React from 'react';
import { View, Text, FlatList, Button, ActivityIndicator } from 'react-native';
import { usePersistentArray } from '../component/useAsyncStorage';

const productList = [
  { id: '1', name: 'Iphone 15', price: 1000 },
  { id: '2', name: 'Samsung S24', price: 900 },
  { id: '3', name: 'Xiaomi 14', price: 600 },
];

const ProductList = () => {
  const { array: savedProducts, addItem, removeItem, clear, loading } = usePersistentArray('selectedProduct');

  const handleSelect = async (product) => {
    await addItem(product);
    console.log('Đã lưu sản phẩm:', product);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="blue" />;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 20 }}>Danh sách sản phẩm</Text>

      <FlatList
        data={productList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text>{item.name} - ${item.price}</Text>
            <Button title="Chọn sản phẩm" onPress={() => handleSelect(item)} />
          </View>
        )}
      />

      <View style={{ marginTop: 30 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Sản phẩm đã chọn:</Text>
        {savedProducts.length > 0 ? (
          savedProducts.map((item, index) => (
            <Text key={index}>{item.name} - ${item.price}</Text>
          ))
        ) : (
          <Text>Chưa chọn sản phẩm</Text>
        )}
      </View>

      <Button title="Xóa hết" onPress={clear} color="red" />
    </View>
  );
};

export default ProductList;
