import { Ionicons } from '@expo/vector-icons';
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
import {
  fetchShipperInfo,
  Shipper,
  updateShipperOnlineStatus,
  updateShipperProfile
} from '../../services/ShipService';
import { clearAllStorage, getUserData } from '../utils/storage';

export type OnlineStatus = 'true' | 'false' | 'busy';


interface ProfileItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}

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

interface ShipperProfile {
  id: string;
  full_name: string;
  phone: string;
  image: string;
  vehicleType: string;
  licenseNumber: string;
  isOnline: 'true' | 'false' | "busy";   // ✅ đổi chỗ này
  accountId: string;
}

const defaultShipperData: ShipperProfile = {
  id: '',
  full_name: '',
  phone: '',
  image: 'https://cdn1.iconfinder.com/data/icons/user-interface-664/24/User-512.png',
  vehicleType: '',
  licenseNumber: '',
  isOnline: false,
  accountId: '',
};

const mapToShipperProfile = (s: Shipper): ShipperProfile => ({
  id: s._id,
  full_name: s.full_name || '',
  phone: s.phone || '',
  image: s.image || 'https://cdn1.iconfinder.com/data/icons/user-interface-664/24/User-512.png',
  vehicleType: s.vehicle_type || '',
  licenseNumber: s.license_number || '',
  isOnline: s.is_online as true | false | "busy" || false,  // ✅ ép kiểu
  accountId: s.account_id || '',
});


const ShipProfileScreen: React.FC = () => {
  const [shipperData, setShipperData] = useState<ShipperProfile>(defaultShipperData);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigation = useNavigation();

  const [accountId, setAccountId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const id = await getUserData('userData');
        if (id) fetchShipperData(id);
      };
      fetchData();
    }, [])
  );

  useEffect(() => {
    const loadUserId = async () => {
      const id = await getUserData('userData');
      setAccountId(id);
    };
    loadUserId();
  }, []);

  const fetchShipperData = async (id: string) => {
    try {
      setIsLoading(true);
      const shipper = await fetchShipperInfo();
      if (!shipper) throw new Error('Không tìm thấy shipper');
      setShipperData(mapToShipperProfile(shipper));
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tải thông tin shipper');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!shipperData.id) return;
      setIsSaving(true);
      const success = await updateShipperProfile(shipperData.id, {
        full_name: shipperData.full_name,
        phone: shipperData.phone,
        license_number: shipperData.licenseNumber,
        vehicle_type: shipperData.vehicleType,
        image: shipperData.image,
      });
      if (success) {
        setIsEditing(false);
        Alert.alert('✅ Thành công', 'Cập nhật thành công!');
      } else {
        Alert.alert('❌ Lỗi', 'Không thể lưu thông tin');
      }
    } finally {
      setIsSaving(false);
    }
  };

  
  const handleEdit = () => setIsEditing(true);

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
          const id = await getUserData('shipperID');
          await updateShipperOnlineStatus(id, 'false');
          await clearAllStorage();
          navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
        },
      },
    ]);
  };
  const getStatusText = (status: 'true' | 'false' | "busy") => {
    switch (status) {
      case 'true': return 'Đang hoạt động';
      case "busy": return 'Đang bận';
      case 'false': return 'Không hoạt động';
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
            </View>
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
                onPress={handleSaveProfile}
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
export type { ShipperProfile };

