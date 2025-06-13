import { Ionicons } from '@expo/vector-icons'; // dùng icon camera
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const DetailedReview = ({ reviewText, onImageAdd, onTextChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thêm đánh giá chi tiết</Text>

      <TextInput
        style={styles.textInput}
        placeholder="Nhập nội dung đánh giá..."
        value={reviewText}
        onChangeText={onTextChange}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.addImageButton} onPress={onImageAdd}>
        <Ionicons name="camera-outline" size={20} color="#333" />
        <Text style={styles.addImageText}>Thêm ảnh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 10,
    padding: 10,
    height: 150,
    backgroundColor: '#fff',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  addImageText: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default DetailedReview;
