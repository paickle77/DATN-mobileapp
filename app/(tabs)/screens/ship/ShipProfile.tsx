import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
  View
} from 'react-native';
import { BASE_URL } from '../../services/api';
import { clearUserData, getUserData } from '../utils/storage';
// import LinearGradient from 'react-native-linear-gradient';
// Hoặc nếu dùng Expo:
// import { LinearGradient } from 'expo-linear-gradient';

// Constants
// Thay đổi theo domain của bạn

// Types & Interfaces
interface ShipperStats {
  completedOrders: number;
  onTimeRate: number;
  totalEarnings: number;
  status: 'online' | 'offline' | 'busy';
}

interface VehicleInfo {
  type: string;
  plate: string;
}

interface ShipperData {
  _id: string;
  account_id: string;
  full_name: string;
  phone: string;
  license_number: string | null;
  vehicle_type: string | null;
  is_online: 'offline' | 'online' | 'busy';
}

interface ShipperProfile {
  id: string;
  full_name: string;
  phone: string;
  image: string;
  vehicleType: string;
  licenseNumber: string;
  isOnline: 'offline' | 'online' | 'busy';
  accountId: string;
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

const defaultShipperData: ShipperProfile = {
  id: '',
  full_name: '',
  phone: '',
  image: 'https://cdn1.iconfinder.com/data/icons/user-interface-664/24/User-512.png',
  vehicleType: '',
  licenseNumber: '',
  isOnline: 'offline',
  accountId: '',
};


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

const mapToShipperProfile = (item: any): ShipperProfile => ({
  id: item._id,
  full_name: item.full_name || '',
  phone: item.phone || '',
  image: item.image || 'https://cdn1.iconfinder.com/data/icons/user-interface-664/24/User-512.png',
  vehicleType: item.vehicle_type || '',
  licenseNumber: item.license_number || '',
  isOnline: item.is_online || 'offline',
  accountId: item.account_id || '',
});


// Main Component
const ShipProfileScreen: React.FC = () => {
  const [shipperData, setShipperData] = useState<ShipperProfile>(defaultShipperData);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigation = useNavigation();

  const [shipperId, setShipperId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

   useFocusEffect(
      useCallback(() => {
        const fetchData = async () => {
          const Id = await getUserData('userData');
          if (Id) {
            fetchShipperData(Id);
          }
        };
        fetchData();
      }, [])
    );

  // Lấy ID người dùng 1 lần duy nhất
  useEffect(() => {
    const loadUserId = async () => {
      const id = await getUserData('userData');
      if (!id) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin đăng nhập');
        return;
      }
      setAccountId(id);
    };
    loadUserId();
  }, []);

 

  // Fetch API từ MongoDB
  const fetchShipperData = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/shippers`);
      const data = res.data?.data;

      if (!Array.isArray(data)) throw new Error('Dữ liệu không hợp lệ');

     
      if (!id) throw new Error('Không tìm thấy ID người dùng');


      const found = data.find((s: any) => s.account_id === id);
      if (!found) throw new Error('Không tìm thấy shipper phù hợp');

      const transformed = mapToShipperProfile(found);
      setShipperData(transformed);
      setShipperId(transformed.id);
      console.log('✅ Shipper :', transformed.id);
      console.log('✅ Shipper data loaded:', transformed);
    } catch (err: any) {
      console.error('❌ fetchShipperData error:', err);
      Alert.alert('Lỗi', err.message || 'Không thể tải thông tin shipper');
    } finally {
      setIsLoading(false);
    }
  };

  const updateShipperProfile = async (updated: ShipperProfile): Promise<boolean> => {
    try {
      const payload = {
        full_name: updated.full_name,
        phone: updated.phone,
        license_number: updated.licenseNumber,
        vehicle_type: updated.vehicleType,
        image: updated.image, // base64 string "data:image/jpeg;base64,...."
      };

      const res = await axios.put(`${BASE_URL}/shippers/${shipperId}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.status === 200 || res.status === 201) {
        Alert.alert('✅ Thành công', 'Cập nhật thành công!');
        return true;
      } else {
        throw new Error('Cập nhật không thành công');
      }
    } catch (error: any) {
      console.error('❌ updateShipperProfile error:', error?.message || error);
      Alert.alert('Lỗi khi cập nhật', error?.message || 'Đã xảy ra lỗi');
      return false;
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    const success = await updateShipperProfile(shipperData);
    if (success) setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (accountId) fetchShipperData(accountId);
  };

  const updateField = (field: keyof ShipperProfile, value: any) => {
    setShipperData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await clearUserData('userData');
          await clearUserData('shipperID');

          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' as never }],
          });
          Alert.alert('Thành công', 'Đã đăng xuất');
        },
      },
    ]);
  };

  

  

  const getStatusText = (status: 'online' | 'offline' | 'busy') => {
  switch (status) {
    case 'online': return 'Đang hoạt động';
    case 'busy': return 'Đang bận';
    case 'offline': return 'Không hoạt động';
    default: return 'Không xác định';
  }
};


  const pickImage = async () => {
          const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
          if (permissionResult.granted === false) {
              Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để thay đổi ảnh đại diện.');
              return;
          }
  
          const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
              base64: true, 
          });
  
          if (!result.canceled) {
              const base64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setShipperData(prev => ({
                  ...prev,
                  avatar: { uri: base64String },
                  image: base64String,
              }));
          }
      };
  
      // Hàm chụp ảnh
      const takePhoto = async () => {
          const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  
          if (permissionResult.granted === false) {
              Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập camera để chụp ảnh.');
              return;
          }
  
          const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
              base64: true, 
          });
  
          if (!result.canceled) {
              const base64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setShipperData(prev => ({
                  ...prev,
                  avatar: { uri: base64String },
                  image: base64String,
              }));
              console.log('🟢 Chụp ảnh thành công:', result.assets[0].uri);
          }
      };
  
      // Hiển thị tùy chọn thay đổi ảnh
      const showImageOptions = () => {
              Alert.alert(
                  'Thay đổi ảnh đại diện',
              'Chọn cách bạn muốn thay đổi ảnh đại diện',
                  [
                      { text: 'Hủy', style: 'cancel' },
                      { text: 'Chọn từ thư viện', onPress: () => pickImage() },
                      { text: 'Chụp ảnh mới', onPress: () => takePhoto() },
                  ]
              );
          };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={isEditing ? handleCancel : handleEdit}
              disabled={isSaving}
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
              onPress={isEditing ? showImageOptions : undefined} 
              activeOpacity={isEditing ? 0.7 : 1} 
            >
              <Image source={{ uri: shipperData.image }} style={styles.avatar} />
              {isEditing && (
                <View style={styles.avatarEditIcon}>
                  <Ionicons name="camera-outline" size={12} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>


            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{shipperData.full_name}</Text>
              <Text style={styles.profileId}>ID: {shipperData.id}</Text>
              {/* <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFC107" />
                <Text style={styles.ratingValue}>{shipperData.rating}</Text>
                <Text style={styles.ratingCount}>({shipperData.totalOrders} đơn)</Text>
              </View> */}
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        {/* <View style={styles.statsContainer}>
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
        </View> */}

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
              icon="bicycle-outline"
              label="Loại xe"
              value={shipperData.vehicleType}
              isEditing={isEditing}
              onChange={(value) => updateField('vehicleType', value)}
            />

            <ProfileItem
              icon="pricetag-outline"
              label="Biển số"
              value={shipperData.licenseNumber}
              isEditing={isEditing}
              onChange={(value) => updateField('licenseNumber', value)}
            />

            <ProfileItem
              icon="pulse-outline"
              label="Trạng thái"
              value={getStatusText(shipperData.isOnline)}
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
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleCancel}
                disabled={isSaving}
              >
                <Text style={styles.secondaryButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{height: 16}} />

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Mock API function - xóa dòng này khi đã implement API thật
// const updateShipperProfile = async (profile: ShipperProfile): Promise<void> => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       console.log('Profile updated:', profile);
//       resolve();
//     }, 1000);
//   });
// };

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
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
    backgroundColor: '#3B82F6',
    // Gradient effect bằng CSS thay vì LinearGradient
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  logoutButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
});

export default ShipProfileScreen;
export type { ShipperProfile, ShipperStats, VehicleInfo };

