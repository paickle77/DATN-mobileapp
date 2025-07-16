import { useCallback, useState } from 'react';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    type: 'info',
    visible: false,
  });

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({
      message,
      type,
      visible: true,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification(message, 'error');
  }, [showNotification]);

  const showWarning = useCallback((message: string) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  const showInfo = useCallback((message: string) => {
    showNotification(message, 'info');
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};