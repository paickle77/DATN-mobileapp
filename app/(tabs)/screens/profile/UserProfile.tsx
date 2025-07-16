import { Feather, MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { BASE_URL } from '../../services/api';

type RootStackParamList = {
    TabNavigator: undefined;
    // ... các routes khác
};

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    image?: string;
}

interface Address {
    _id: string;
    user_id: {
        _id: string;
        name: string;
    };
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
}

const UserProfileScreen = () => {
    const route = useRoute();
    const { userId }: any = route.params || {};
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    // State cho loading
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);

    // State cho các thông tin hiển thị
    const [profileData, setProfileData] = useState({
        _id: '',
        image: '',
        avatar: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqMZXi12fBQGZpQvD27ZJvSGmn-oNCXI9Etw&s' },
        fullName: '',
        email: '',
        phone: '',
        address: '',

    });

    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({
        fullName: '',
        address: ''
    });

    // API call để lấy thông tin user
    const fetchUserData = async (userId: string) => {
        try {
            const response = await axios.get(`${BASE_URL}/users/${userId}`);
            if (response.data && response.data.success !== false) {
                setUser(response.data.data); // ✅ cập nhật user
                return response.data.data;
            } else {
                console.error('❌ Error loading user:', response.data.message);
                return null;
            }
        } catch (error) {
            console.error('❌ Error fetching user:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
            return null;
        }
    };

    // API call để lấy danh sách địa chỉ
    const fetchAddresses = async (userId: string) => {
        try {
            console.log('🔼 Fetching addresses for User ID:', userId);
            const response = await axios.get(`${BASE_URL}/GetAllAddress`);
            // console.log('✅ Tất cả địa chỉ đã tải:', response.data);

            const allData = response.data?.data ?? [];
            // Lọc địa chỉ theo user_id._id
            const filtered = allData.filter((item: Address) => item.user_id?._id === userId);

            setAddresses(filtered);
            // console.log('✅ Địa chỉ của user:', filtered);

            // Tìm địa chỉ mặc định
            const defaultAddr = filtered.find((addr: Address) => addr.isDefault);
            setDefaultAddress(defaultAddr || filtered[0] || null);

            return filtered;
        } catch (error) {
            console.error('❌ Lỗi lấy địa chỉ:', error);
            Alert.alert('Lỗi', 'Không thể tải địa chỉ. Vui lòng thử lại sau.');
            return [];
        }
    };

    // Hàm format địa chỉ
    const formatAddress = (address: Address | null): string => {
        if (!address) return 'Chưa có địa chỉ';

        const {
            detail_address = '',
            ward = '',
            district = '',
            city = '',
        } = address as any;

        const parts = [detail_address, ward, district, city]
            .filter(part => part && part.trim() !== '');

        return parts.length > 0 ? parts.join(', ') : 'Chưa có địa chỉ';
    };

    const getDefaultAddress = (addresses: Address[]): Address | null => {
        return addresses.find(addr => addr.isDefault) || addresses[0] || null;
    };

    // useEffect để load dữ liệu khi component mount
    useEffect(() => {
        const loadData = async () => {
            if (!userId) {
                Alert.alert('Lỗi', 'Không tìm thấy ID người dùng');
                navigation.goBack();
                return;
            }

            setLoading(true);
            try {
                // Gọi API song song - user và addresses
                const [userData, addressData] = await Promise.all([
                    fetchUserData(userId),
                    fetchAddresses(userId)
                ]);

                if (userData) {
                    // Cập nhật profileData
                    const newProfileData = {
                        _id: userData._id,
                        image: userData.image || '',
                        avatar: userData.image
                            ? { uri: `data:image/jpeg;base64,${userData.image}` }
                            : { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqMZXi12fBQGZpQvD27ZJvSGmn-oNCXI9Etw&s' },
                        fullName: userData.name || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        address: addressData.length > 0 ? formatAddress(addressData.find((addr: Address) => addr.isDefault) || addressData[0]) : 'Chưa có địa chỉ',
                    };

                    setProfileData(newProfileData);
                    setEditableData({
                        fullName: newProfileData.fullName,
                        address: newProfileData.address
                    });
                }
            } catch (error) {
                console.error('❌ Error loading data:', error);
                Alert.alert('Lỗi', 'Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId]);

    // Hàm chọn ảnh từ thư viện
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
        });

        if (!result.canceled) {
            setProfileData(prev => ({
                ...prev,
                avatar: { uri: result.assets[0].uri },
                image: result.assets[0].uri
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
        });

        if (!result.canceled) {
            setProfileData(prev => ({
                ...prev,
                avatar: { uri: result.assets[0].uri },
                image: result.assets[0].uri
            }));
        }
    };

    // Hiển thị tùy chọn thay đổi ảnh
    const showImageOptions = () => {
        Alert.alert(
            'Thay đổi ảnh đại diện',
            'Chọn cách bạn muốn thay đổi ảnh đại diện',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Chọn từ thư viện', onPress: pickImage },
                { text: 'Chụp ảnh mới', onPress: takePhoto },
            ]
        );
    };

    // Hàm lưu thông tin
    const handleSave = async () => {
        if (!user) return;
        try {
            // Nếu avatar là base64 (ảnh mới chọn/chụp), lấy base64, nếu không thì giữ nguyên
            let imageBase64 = profileData.image;
            // Nếu avatar là uri local (ảnh vừa chọn/chụp), convert sang base64
            if (
                profileData.avatar?.uri &&
                !profileData.avatar.uri.startsWith('http') &&
                !profileData.avatar.uri.startsWith('data:')
            ) {
                const fileUri = profileData.avatar.uri;
                const base64 = await FileSystem.readAsStringAsync(fileUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                imageBase64 = base64;
            } else if (
                profileData.avatar?.uri &&
                profileData.avatar.uri.startsWith('data:image')
            ) {
                // Nếu đã là data:image thì lấy phần base64
                imageBase64 = profileData.avatar.uri.split(',')[1];
            }

            const response = await axios.put(`${BASE_URL}/users/${user._id}`, {
                name: editableData.fullName,
                image: imageBase64,
            });

            if (response.data?.success !== false) {
                Alert.alert('Thành công', 'Thông tin đã được cập nhật!');
                setIsEditing(false);
                // Reload lại user
                const updatedUser = await fetchUserData(user._id);
                if (updatedUser) {
                    setProfileData(prev => ({
                        ...prev,
                        fullName: updatedUser.name || '',
                        image: updatedUser.image || '',
                        avatar: updatedUser.image
                            ? { uri: `data:image/jpeg;base64,${updatedUser.image}` }
                            : prev.avatar
                    }));
                    setEditableData({
                        fullName: updatedUser.name || '',
                        address: profileData.address
                    });
                }
            } else {
                Alert.alert('Thất bại', response.data.message || 'Không thể cập nhật thông tin.');
            }
        } catch (error) {
            console.error('❌ Lỗi cập nhật:', error);
            Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ.');
        }
    };

    const handleCancel = () => {
        setEditableData({
            fullName: profileData.fullName,
            address: profileData.address
        });
        setIsEditing(false);
    };

    const InfoItem = ({
        label,
        value,
        editable = false,
        onChangeText
    }: {
        label: string;
        value: string;
        editable?: boolean;
        onChangeText?: (text: string) => void
    }) => (
        <View style={styles.infoItem}>
            <Text style={styles.label}>{label}</Text>
            {editable && isEditing ? (
                <TextInput
                    style={styles.editableInput}
                    value={value}
                    onChangeText={onChangeText}
                    multiline={label === 'Địa chỉ'}
                />
            ) : (
                <Text style={[styles.value, !editable && styles.disabledValue]}>
                    {value}
                </Text>
            )}
        </View>
    );

    // Hiển thị loading
    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Feather name="arrow-left" size={24} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hồ sơ của bạn</Text>
                    <View style={styles.editButton} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#795548" />
                    <Text style={styles.loadingText}>Đang tải thông tin...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hồ sơ của bạn</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                        if (isEditing) {
                            handleSave();
                        } else {
                            setIsEditing(true);
                        }
                    }}
                >
                    <Text style={styles.editButtonText}>
                        {isEditing ? 'Lưu' : 'Sửa'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={profileData.avatar}
                            style={styles.avatar}
                        />
                        <TouchableOpacity
                            style={styles.cameraIcon}
                            onPress={showImageOptions}
                        >
                            <MaterialIcons name="camera-alt" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.avatarHint}>Chạm để thay đổi ảnh đại diện</Text>
                </View>

                {/* User Information */}
                <View style={styles.infoSection}>
                    <InfoItem
                        label="Họ và tên"
                        value={isEditing ? editableData.fullName : user?.name || ''}
                        editable={true}
                        onChangeText={(text) => setEditableData(prev => ({ ...prev, fullName: text }))}
                    />

                    <InfoItem
                        label="Email"
                        value={user?.email || ''}
                        editable={false}
                    />

                    <InfoItem
                        label="Số điện thoại"
                        value={user?.phone || ''}
                        editable={false}
                    />

                    <InfoItem
                        label="Địa chỉ mặc định"
                        value={profileData.address}
                        editable={false}
                    />

                </View>

                {/* Action Buttons when editing */}
                {isEditing && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        flex: 1,
        textAlign: 'center',
    },
    editButton: {
        padding: 8,
    },
    editButtonText: {
        fontSize: 16,
        color: '#795548',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#eee',
    },
    cameraIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#795548',
        borderRadius: 18,
        padding: 8,
        borderWidth: 3,
        borderColor: '#fff',
    },
    avatarHint: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    },
    infoSection: {
        paddingBottom: 32,
    },
    infoItem: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        color: '#222',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    disabledValue: {
        color: '#888',
        backgroundColor: '#f5f5f5',
    },
    editableInput: {
        fontSize: 16,
        color: '#222',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#795548',
        minHeight: 48,
    },
    addressSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 12,
    },
    addressItem: {
        marginBottom: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    addressText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    defaultBadge: {
        color: '#795548',
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        paddingBottom: 32,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#795548',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
});

export default UserProfileScreen;