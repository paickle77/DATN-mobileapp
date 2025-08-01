import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  value: string;
  key: string;
}

// Lưu thông tin người dùng
export const saveUserData = async (data: UserData) => {
  try {
    const jsonValue = JSON.stringify(data.value);
    await AsyncStorage.setItem(data.key, jsonValue);
    
  } catch (e) {
    console.error('Lỗi lưu user data:', e);
  }
};

// Lấy thông tin người dùng theo key
export const getUserData = async (key: string): Promise<string | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Lỗi lấy user data:', e);
    return null;
  }
};

// Xóa thông tin người dùng theo key
export const clearUserData = async (key: string) => {
  try {
    await AsyncStorage.clear();

  } catch (e) {
    console.error('Lỗi xóa user data:', e);
  }
};
