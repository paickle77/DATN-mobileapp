import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


// Types & Interfaces
interface ShipperStats {
  completedOrders: number;
  onTimeRate: number;
  totalEarnings: number;
  status: 'active' | 'inactive' | 'busy';
}

interface VehicleInfo {
  type: string;
  plate: string;
}

interface ShipperProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  avatar: string;
  rating: number;
  totalOrders: number;
  stats: ShipperStats;
  workingHours: string;
  joinDate: string;
  vehicle: VehicleInfo;
}

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string | number;
  color: string;
}

interface ProfileItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}

// Components
const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </View>
);

const ProfileItem: React.FC<ProfileItemProps> = ({
  icon,
  label,
  value,
  isEditing,
  onChange,
  keyboardType = 'default',
  multiline = false,
}) => (
  <View style={styles.profileItem}>
    <View style={styles.profileItemHeader}>
      <Ionicons name={icon} size={18} color="#6B7280" />
      <View style={styles.profileItemContent}>
        <Text style={styles.profileLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={[styles.profileInput, multiline && styles.profileTextArea]}
            value={value}
            onChangeText={onChange}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            placeholder={`Nhập ${label.toLowerCase()}`}
          />
        ) : (
          <Text style={styles.profileValue} numberOfLines={multiline ? 0 : 1}>
            {value}
          </Text>
        )}
      </View>
    </View>
  </View>
);

// Main Component
const ShipProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mock data - sẽ thay thế bằng API call
  const [shipperData, setShipperData] = useState<ShipperProfile>({
    id: 'SP001',
    name: 'Nguyễn Văn Minh',
    phone: '0987654321',
    email: 'minh.nguyen@email.com',
    address: '123 Phố Huế, Hai Bà Trưng, Hà Nội',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    totalOrders: 1247,
    stats: {
      completedOrders: 1198,
      onTimeRate: 96.2,
      totalEarnings: 15420000,
      status: 'active',
    },
    workingHours: '6:00 - 22:00',
    joinDate: '15/03/2023',
    vehicle: {
      type: 'Xe máy',
      plate: '29A1-12345',
    },
  });

  // Event handlers
  const handleEdit = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: API call to update profile
      await updateShipperProfile(shipperData);
      setIsEditing(false);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  }, [shipperData]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    // TODO: Reset to original data
  }, []);

  const updateField = useCallback((field: keyof ShipperProfile, value: any) => {
    setShipperData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleAvatarPress = useCallback(() => {
    if (isEditing) {
      Alert.alert(
        'Thay đổi ảnh đại diện',
        'Chọn nguồn ảnh',
        [
          { text: 'Camera', onPress: () => console.log('Open camera') },
          { text: 'Thư viện', onPress: () => console.log('Open gallery') },
          { text: 'Hủy', style: 'cancel' },
        ]
      );
    }
  }, [isEditing]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#10B981';
      case 'busy': return '#F59E0B';
      case 'inactive': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'busy': return 'Đang bận';
      case 'inactive': return 'Không hoạt động';
      default: return 'Không xác định';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <LinearGradient
          colors={['#3B82F6', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerCard}
        >
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
              disabled={isLoading}
            >
              <Ionicons 
                name={isEditing ? "close-outline" : "create-outline"} 
                size={20} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={handleAvatarPress}
            >
              <Image source={{ uri: shipperData.avatar }} style={styles.avatar} />
              {isEditing && (
                <View style={styles.avatarEditIcon}>
                  <Ionicons name="camera-outline" size={12} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{shipperData.name}</Text>
              <Text style={styles.profileId}>ID: {shipperData.id}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFC107" />
                <Text style={styles.ratingValue}>{shipperData.rating}</Text>
                <Text style={styles.ratingCount}>({shipperData.totalOrders} đơn)</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <StatCard
              icon="checkmark-circle-outline"
              title="Hoàn thành"
              value={shipperData.stats.completedOrders}
              color="#10B981"
            />
            <StatCard
              icon="time-outline"
              title="Đúng giờ"
              value={`${shipperData.stats.onTimeRate}%`}
              color="#3B82F6"
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              icon="wallet-outline"
              title="Thu nhập"
              value={`${(shipperData.stats.totalEarnings / 1000000).toFixed(1)}M`}
              color="#F59E0B"
            />
            <StatCard
              icon="pulse-outline"
              title="Trạng thái"
              value={getStatusText(shipperData.stats.status)}
              color={getStatusColor(shipperData.stats.status)}
            />
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <Text style={styles.detailsTitle}>Thông tin chi tiết</Text>
          </View>

          <View style={styles.profileDetails}>
            <ProfileItem
              icon="call-outline"
              label="Số điện thoại"
              value={shipperData.phone}
              isEditing={isEditing}
              onChange={(value) => updateField('phone', value)}
              keyboardType="phone-pad"
            />

            <ProfileItem
              icon="mail-outline"
              label="Email"
              value={shipperData.email}
              isEditing={isEditing}
              onChange={(value) => updateField('email', value)}
              keyboardType="email-address"
            />

            <ProfileItem
              icon="location-outline"
              label="Địa chỉ"
              value={shipperData.address}
              isEditing={isEditing}
              onChange={(value) => updateField('address', value)}
              multiline={true}
            />

            <ProfileItem
              icon="time-outline"
              label="Giờ làm việc"
              value={shipperData.workingHours}
              isEditing={false}
              onChange={() => {}}
            />

            <ProfileItem
              icon="bicycle-outline"
              label="Phương tiện"
              value={`${shipperData.vehicle.type} - ${shipperData.vehicle.plate}`}
              isEditing={false}
              onChange={() => {}}
            />

            <ProfileItem
              icon="calendar-outline"
              label="Ngày tham gia"
              value={shipperData.joinDate}
              isEditing={false}
              onChange={() => {}}
            />
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Achievement Badge */}
        <LinearGradient
          colors={['#F59E0B', '#EF4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.achievementCard}
        >
          <View style={styles.achievementContent}>
            <Ionicons name="trophy-outline" size={24} color="#FFFFFF" />
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle}>Shipper xuất sắc</Text>
              <Text style={styles.achievementDesc}>Top 10% shipper tháng này</Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

// Mock API function
const updateShipperProfile = async (profile: ShipperProfile): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Profile updated:', profile);
      resolve();
    }, 1000);
  });
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  statsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  profileDetails: {
    gap: 16,
  },
  profileItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
  },
  profileItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  profileLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  profileInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  profileTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  achievementCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 20,
    padding: 16,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementText: {
    marginLeft: 12,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default ShipProfileScreen;
export type { ShipperProfile, ShipperStats, VehicleInfo };

