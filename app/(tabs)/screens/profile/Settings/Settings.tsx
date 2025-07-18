import React, { useState } from 'react';
import { View } from 'react-native';
import DeleteAccount from './DeleteAccount';
import NotificationSettings from './NotificationSettings';
import PasswordManagement from './PasswordManagement';
import SettingsScreen from './SettingsScreen';

const Settings = () => {
  const [currentScreen, setCurrentScreen] = useState<'main' | 'notifications' | 'password' | 'delete'>('main');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'notifications':
        return (
          <NotificationSettings
            pushNotifications={true}
            emailNotifications={false}
            soundEnabled={true}
            setPushNotifications={() => {}}
            setEmailNotifications={() => {}}
            setSoundEnabled={() => {}}
            goBack={() => setCurrentScreen('main')}
          />
        );
      case 'password':
        return <PasswordManagement goBack={() => setCurrentScreen('main')} />;
      case 'delete':
        return <DeleteAccount goBack={() => setCurrentScreen('main')} openModal={() => setDeleteModalVisible(true)} />;
      default:
        return <SettingsScreen setScreen={setCurrentScreen} />;
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
};

export default Settings;
