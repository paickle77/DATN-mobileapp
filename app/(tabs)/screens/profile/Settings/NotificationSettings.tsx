import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

interface Props {
  pushNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  setPushNotifications: (val: boolean) => void;
  setEmailNotifications: (val: boolean) => void;
  setSoundEnabled: (val: boolean) => void;
  goBack: () => void;
}

const NotificationSettings = ({
  pushNotifications,
  emailNotifications,
  soundEnabled,
  setPushNotifications,
  setEmailNotifications,
  setSoundEnabled,
  goBack,
}: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt thông báo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Thông báo đẩy</Text>
            <Text style={styles.settingDescription}>Nhận thông báo trên thiết bị</Text>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Thông báo email</Text>
            <Text style={styles.settingDescription}>Nhận email thông báo</Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Âm thanh thông báo</Text>
            <Text style={styles.settingDescription}>Phát âm thanh khi có thông báo</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationSettings;
