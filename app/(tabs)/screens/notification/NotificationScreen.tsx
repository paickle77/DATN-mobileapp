import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import NotificationCard from '../../component/NotificationCard';
import { BASE_URL } from '../../services/api';
import { getUserData } from '../utils/storage';

interface Notification {
  _id: string;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
  icon: string;
}

const NotificationScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const userId = await getUserData('userId');
      if (!userId) return;

      const response = await axios.get(`${BASE_URL}/notifications/user/${userId}`);
      const allNotifications = response.data?.data || [];
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thông báo:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  // Bấm vào thông báo -> đánh dấu đã đọc
  const handleNotificationPress = async (notificationId: string) => {
    const notification = notifications.find(n => n._id === notificationId);
    
    if (notification && !notification.is_read) {
      try {
        await axios.put(`${BASE_URL}/notifications/${notificationId}/mark-read`);
        
        setNotifications(prev => 
          prev.map(noti => 
            noti._id === notificationId 
              ? { ...noti, is_read: true }
              : noti
          )
        );
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc:', error);
      }
    }
  };

  // Đánh dấu một thông báo đã đọc
  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(`${BASE_URL}/notifications/${notificationId}/mark-read`);
      
      setNotifications(prev => 
        prev.map(noti => 
          noti._id === notificationId 
            ? { ...noti, is_read: true }
            : noti
        )
      );
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = async () => {
    try {
      const userId = await getUserData('userId');
      if (!userId) return;

      await axios.put(`${BASE_URL}/notifications/mark-all-read/${userId}`);
      
      setNotifications(prev => 
        prev.map(noti => ({ ...noti, is_read: true }))
      );
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
    }
  };

  // Xóa một thông báo đã đọc
  const deleteNotification = async (notificationId: string) => {
    try {
      await axios.delete(`${BASE_URL}/notifications/${notificationId}`);
      
      setNotifications(prev => 
        prev.filter(noti => noti._id !== notificationId)
      );
    } catch (error) {
      console.error('Lỗi khi xóa thông báo:', error);
      Alert.alert('Lỗi', 'Chỉ có thể xóa thông báo đã đọc');
    }
  };

  // Xóa tất cả thông báo đã đọc
  const deleteAllRead = async () => {
    const readCount = notifications.filter(n => n.is_read).length;
    
    if (readCount === 0) {
      Alert.alert('Thông báo', 'Không có thông báo đã đọc nào để xóa');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa ${readCount} thông báo đã đọc?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = await getUserData('userId');
              if (!userId) return;

              await axios.delete(`${BASE_URL}/notifications/delete-all-read/${userId}`);
              
              // Chỉ giữ lại những thông báo chưa đọc
              setNotifications(prev => 
                prev.filter(noti => !noti.is_read)
              );
            } catch (error) {
              console.error('Lỗi khi xóa tất cả thông báo đã đọc:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa thông báo');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(noti => 
    filter === 'all' || !noti.is_read
  );

  const unreadCount = notifications.filter(noti => !noti.is_read).length;
  const readCount = notifications.filter(noti => noti.is_read).length;

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <NotificationCard
      id={item._id}
      title={item.title}
      content={item.content}
      createdAt={item.created_at}
      isRead={item.is_read}
      icon={item.icon}
      onPress={handleNotificationPress}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Tất cả ({notifications.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.activeFilter]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
            Chưa đọc ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons - Chỉ giữ lại 2 nút cần thiết */}
      <View style={styles.actionButtonsContainer}>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}

        {readCount > 0 && (
          <TouchableOpacity style={styles.deleteAllButton} onPress={deleteAllRead}>
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Xóa đã đọc ({readCount})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Thông tin tóm tắt */}
      {notifications.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {unreadCount} chưa đọc • {readCount} đã đọc
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off" size={80} color="#ccc" />
      <Text style={styles.emptyText}>
        {filter === 'unread' ? 'Không có thông báo mới' : 'Chưa có thông báo nào'}
      </Text>
      <Text style={styles.emptySubText}>
        {filter === 'unread' 
          ? 'Tất cả thông báo đã được đọc' 
          : 'Thông báo sẽ xuất hiện ở đây'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B6E4E" />
        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Thông báo</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#8B6E4E" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8B6E4E']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={filteredNotifications.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSection: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: '#f1f3f4',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#8B6E4E',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B6E4E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    justifyContent: 'center',
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },

  
});
