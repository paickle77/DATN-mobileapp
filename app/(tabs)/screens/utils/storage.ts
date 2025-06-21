import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DATA_KEY = 'userData';

export interface UserData {
  userId: string;
//   token: string;
//   name: string;
//   email: string;
//   image?: string; // optional
}

// Lưu thông tin người dùng
export const saveUserData = async (data: UserData) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(USER_DATA_KEY, jsonValue);
  } catch (e) {
    console.error('Lỗi lưu user data:', e);
  }
};

// Lấy thông tin người dùng
export const getUserData = async (): Promise<UserData | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_DATA_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Lỗi lấy user data:', e);
    return null;
  }
};

// Xóa thông tin người dùng (khi logout)
export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (e) {
    console.error('Lỗi xóa user data:', e);
  }
};
