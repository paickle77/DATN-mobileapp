import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function CompleteProfile() {
  // Lấy email từ param
  const { email } = useLocalSearchParams<{ email: string }>();
  const userEmail = email ?? '';

  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const navigation = useNavigation();

  const pickImage = async () => {
    // Mở picker để chọn ảnh từ thư viện
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.cancelled) {
      setAvatar(result.uri);
    }
  };

  const handleSubmit = () => {
    console.log('Email:', userEmail);
    console.log('Họ tên:', fullName);
    console.log('Phone:', phone);
    console.log('Giới tính:', gender);
    console.log('Avatar URI:', avatar);
    // TODO: gọi API gửi dữ liệu hoàn thiện hồ sơ lên server
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* Nút quay lại */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
        <Ionicons name="arrow-back-circle-outline" size={30} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Hoàn thiện hồ sơ của bạn</Text>
      <Text style={styles.subtitle}>
        Đừng lo, chỉ bạn mới có thể nhìn thấy dữ liệu cá nhân này. Không ai khác có thể truy cập.
      </Text>

      {/* Avatar & nút pick ảnh */}
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-outline" size={60} color="#aaa" />
          </View>
        )}
        <View style={styles.editIconContainer}>
          <Ionicons name="pencil" size={20} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Input Họ tên */}
      <TextInput
        style={styles.input}
        placeholder="Họ tên"
        placeholderTextColor="#999"
        value={fullName}
        onChangeText={setFullName}
      />

      {/* Input Số điện thoại */}
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        placeholderTextColor="#999"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Chọn Giới tính (có thể thay thành Picker) */}
      <TouchableOpacity style={styles.pickerContainer} onPress={() => { /* TODO: mở modal chọn giới tính */ }}>
        <Text style={[styles.pickerText, gender ? { color: '#333' } : { color: '#999' }]}>
          {gender || 'Lựa chọn giới tính'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>

      {/* Nút Hoàn thành hồ sơ */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Hoàn thành hồ sơ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  backIcon: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 10,
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#555',
    marginVertical: 15,
    fontSize: 14,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6B4F35',
    borderRadius: 12,
    padding: 4,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  pickerContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6B4F35',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
