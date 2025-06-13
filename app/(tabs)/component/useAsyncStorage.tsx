import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePersistentArray(key, initialValue = []) {
  const [array, setArray] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        setArray(stored ? JSON.parse(stored) : initialValue);
      } catch (err) {
        console.error('Error loading data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [key]);

  const saveToStorage = async (newArray) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(newArray));
      setArray(newArray);
    } catch (err) {
      console.error('Error saving data', err);
    }
  };

  const addItem = async (item) => {
    const newArray = [...array, item];
    await saveToStorage(newArray);
  };

  const removeItem = async (predicate) => {
    const newArray = array.filter((item) => !predicate(item));
    await saveToStorage(newArray);
  };

  const clear = async () => {
    await saveToStorage([]);
  };

  return {
    array,
    addItem,
    removeItem,
    clear,
    loading
  };
}
