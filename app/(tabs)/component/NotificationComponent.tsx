import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onHide?: () => void;
  duration?: number;
  style?: any;
}

const NotificationComponent = ({
  message,
  type,
  visible,
  onHide,
  duration = 2500,
  style
}: NotificationProps) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation - nhanh hơn
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide && onHide();
    });
  };

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return styles.success;
      case 'error':
        return styles.error;
      case 'warning':
        return styles.warning;
      case 'info':
        return styles.info;
      default:
        return styles.info;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-triangle';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        getNotificationStyle(),
        style,
        {
          opacity: opacityAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <Feather 
          name={getIcon()} 
          size={20} 
          color={getNotificationStyle().color} 
          style={styles.icon}
        />
        <Text style={[styles.text, { color: getNotificationStyle().color }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 18,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  success: {
    backgroundColor: '#f0f9e6',
    borderColor: '#7cb342',
    color: '#2e7d0e',
  },
  error: {
    backgroundColor: '#ffe6e6',
    borderColor: '#f44336',
    color: '#c62828',
  },
  warning: {
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
    color: '#e65100',
  },
  info: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    color: '#0d47a1',
  },
});

export default NotificationComponent;