import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook lưu mảng vào AsyncStorage theo key, có thêm các hàm hỗ trợ đồng bộ.
 */
export function usePersistentArray<T = any>(key: string, initialValue: T[] = []) {
  const [array, setArray] = useState<T[]>(initialValue);
  const [loading, setLoading] = useState(true);

  // Load từ AsyncStorage khi component mount
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (isMounted) {
          setArray(stored ? JSON.parse(stored) : initialValue);
        }
      } catch (err) {
        console.error('Lỗi khi load dữ liệu:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [key]);

  // Lưu xuống AsyncStorage và cập nhật state
  const saveToStorage = useCallback(async (newArray: T[]) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(newArray));
      setArray(newArray);
    } catch (err) {
      console.error('Lỗi khi lưu dữ liệu:', err);
    }
  }, [key]);

  // Thêm phần tử vào mảng
  const addItem = useCallback(async (item: T) => {
    const newArray = [...array, item];
    await saveToStorage(newArray);
  }, [array, saveToStorage]);

  // Xóa phần tử theo predicate
  const removeItem = useCallback(async (predicate: (item: T) => boolean) => {
    const newArray = array.filter((item) => !predicate(item));
    await saveToStorage(newArray);
  }, [array, saveToStorage]);

  // Xóa toàn bộ
  const clear = useCallback(async () => {
    await saveToStorage([]);
  }, [saveToStorage]);

  // Làm mới state từ AsyncStorage
  const refresh = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(key);
      setArray(stored ? JSON.parse(stored) : initialValue);
    } catch (err) {
      console.error('Lỗi khi làm mới dữ liệu:', err);
    }
  }, [key, initialValue]);

  // Lấy dữ liệu hiện tại từ AsyncStorage mà không ảnh hưởng đến state
  const getArray = useCallback(async (): Promise<T[]> => {
    try {
      const stored = await AsyncStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Lỗi khi getArray:', err);
      return [];
    }
  }, [key]);

  // Thêm và lấy lại phần tử cuối
 const addAndGetLastId = useCallback(async (item: T): Promise<T | undefined> => {
  const newArray = [...array, item];
  await saveToStorage(newArray);
  return newArray[newArray.length - 1];
}, [array, saveToStorage]);

  return {
    array,               // State hiện tại
    loading,             // Trạng thái loading
    addItem,             // Thêm item
    removeItem,          // Xóa theo điều kiện
    clear,               // Xóa tất cả
    refresh,             // Làm mới từ storage
    getArray,            // Lấy dữ liệu async
    addAndGetLastId,     // Thêm item và lấy lại cuối cùng
  };
}
