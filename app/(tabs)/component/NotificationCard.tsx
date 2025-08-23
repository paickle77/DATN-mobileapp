import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationCardProps {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  icon?: string;
  onPress: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  id,
  title,
  content,
  createdAt,
  isRead,
  icon = 'notifications',
  onPress,
}) => {
  const getIconName = (iconName: string) => {
    switch (iconName) {
      case 'order':
        return 'receipt';
      case 'promotion':
        return 'gift';
      case 'system':
        return 'settings';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (iconName: string) => {
    switch (iconName) {
      case 'order':
        return '#2ecc71';
      case 'promotion':
        return '#e74c3c';
      case 'system':
        return '#3498db';
      default:
        return '#f39c12';
    }
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isRead && styles.unreadContainer
      ]}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: getIconColor(icon) + '20' }
      ]}>
        <Ionicons
          name={getIconName(icon) as any}
          size={24}
          color={getIconColor(icon)}
        />
        {!isRead && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.title,
              !isRead && styles.unreadTitle
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={styles.time}>{formatDate(createdAt)}</Text>
        </View>

        <Text
          style={[
            styles.content,
            !isRead && styles.unreadContent
          ]}
          numberOfLines={2}
        >
          {content}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  unreadContainer: {
    backgroundColor: '#fdf6f0',
    borderLeftColor: '#8B6E4E',
    shadowColor: '#8B6E4E',
    shadowOpacity: 0.1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B6E4E',
    borderWidth: 2,
    borderColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    color: '#1a1a1a',
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadContent: {
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  markReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B6E4E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 4,
  },
});

