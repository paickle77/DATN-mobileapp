import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lấy mảng từ AsyncStorage bằng key
 */
export const getStoredArray = async (key: string): Promise<any[]> => {
  try {
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Error getting stored array', err);
    return [];
  }
};
