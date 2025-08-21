import { Feather, MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
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
    const { userId, accountId }: any = route.params || {};
    // console.log("nhan du lieu:", userId,accountId)
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    // State cho loading
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false); // ✅ Track initialization
    const [user, setUser] = useState<User | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
    const [email,SetEmail]=useState('');
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
    
    // ✅ FIX: Tách riêng state cho input editing
    const [editingName, setEditingName] = useState('');

    // API call để lấy thông tin user - Tối ưu hóa
    const fetchUserData = useCallback(async (userId: string) => {
        try {
            const response = await axios.get(`${BASE_URL}/users/${userId}`);
            if (response.data && response.data.success !== false) {
                setUser(response.data.data);
                
                // ✅ Chỉ fetch email nếu chưa có hoặc khác
                if (!email || response.data.data.account_id) {
                    try {
                        const emailResponse = await axios.get(`${BASE_URL}/account/${response.data.data.account_id}`);
                        SetEmail(emailResponse.data.data.email);
                    } catch (emailError) {
                        console.warn('⚠️ Không thể lấy email:', emailError);
                    }
                }
                
                return response.data.data;
            } else {
                console.error('❌ Error loading user:', response.data.message);
                return null;
            }
        } catch (error) {
            console.error('❌ Error fetching user:', error);
            // ✅ Chỉ hiện alert khi loading lần đầu
            return null;
        }
    }, [email]);

    // API call để lấy danh sách địa chỉ - Tối ưu hóa
    const fetchAddresses = useCallback(async (userId: string) => {
        try {
            const response = await axios.get(`${BASE_URL}/GetAllAddress`);
            const allData = response.data?.data ?? [];
            // Lọc địa chỉ theo user_id._id
            const filtered = allData.filter((item: Address) => item.user_id?._id === userId);

            setAddresses(filtered);

            // Tìm địa chỉ mặc định
            const defaultAddr = filtered.find((addr: Address) => addr.isDefault);
            setDefaultAddress(defaultAddr || filtered[0] || null);

            return filtered;
        } catch (error) {
            console.error('❌ Lỗi lấy địa chỉ:', error);
            // ✅ Chỉ hiện alert khi cần thiết
            return [];
        }
    }, []);

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

    // ✅ Hàm load dữ liệu tối ưu - tách riêng để dùng cho cả initial load và refresh
    const loadData = useCallback(async (showInitialLoading: boolean = false) => {
        if (!userId) {
            Alert.alert('Lỗi', 'Không tìm thấy ID người dùng');
            navigation.goBack();
            return;
        }

        if (showInitialLoading) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

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
                // ✅ FIX: Set editing name state
                setEditingName(newProfileData.fullName);
                setIsInitialized(true); // ✅ Mark as initialized
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            if (showInitialLoading) {
                Alert.alert('Lỗi', 'Không thể tải dữ liệu');
            }
            // Không hiện alert khi refresh để tránh spam
        } finally {
            if (showInitialLoading) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    }, [userId, navigation, fetchUserData, fetchAddresses]);

    // ✅ Hàm xử lý pull to refresh
    const onRefresh = useCallback(() => {
        loadData(false);
    }, [loadData]);

    // ✅ CHỈ load dữ liệu lần đầu khi mount, KHÔNG load lại khi focus
    useEffect(() => {
        if (!isInitialized) {
            loadData(true);
        }
    }, [loadData, isInitialized]);

    // ✅ Optimize image picker functions với useCallback
    const pickImage = useCallback(async () => {
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
    }, []);

    // ✅ Optimize take photo function
    const takePhoto = useCallback(async () => {
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
    }, []);

    // ✅ Optimize image options
    const showImageOptions = useCallback(() => {
        Alert.alert(
            'Thay đổi ảnh đại diện',
            'Chọn cách bạn muốn thay đổi ảnh đại diện',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Chọn từ thư viện', onPress: pickImage },
                { text: 'Chụp ảnh mới', onPress: takePhoto },
            ]
        );
    }, [pickImage, takePhoto]);

    // ✅ Optimize handleSave với useCallback
    const handleSave = useCallback(async () => {
        if (!user) return;
        
        // ✅ Thêm validation
        if (!editingName.trim()) {
            Alert.alert('Lỗi', 'Tên không được để trống');
            return;
        }
        
        try {
            let imageBase64 = profileData.image;
            
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
                imageBase64 = profileData.avatar.uri.split(',')[1];
            }

            const response = await axios.put(`${BASE_URL}/users/${user._id}`, {
                name: editingName.trim(), // ✅ Trim whitespace
                image: imageBase64,
            });

            if (response.data?.success !== false) {
                Alert.alert('Thành công', 'Thông tin đã được cập nhật!');
                
                // ✅ Cập nhật state ngay lập tức để tránh delay
                setProfileData(prev => ({
                    ...prev,
                    fullName: editingName.trim(),
                    avatar: prev.avatar, // Giữ nguyên avatar đã thay đổi
                }));
                
                setIsEditing(false);
                
                // ✅ Refresh data trong background để đồng bộ với server
                loadData(false);
            } else {
                Alert.alert('Thất bại', response.data.message || 'Không thể cập nhật thông tin.');
            }
        } catch (error) {
            console.error('❌ Lỗi cập nhật:', error);
            Alert.alert('Lỗi', 'Không thể kết nối đến máy chủ.');
        }
    }, [user, editingName, profileData.image, profileData.avatar, loadData]);

    // ✅ FIX: Optimize handleCancel với useCallback
    const handleCancel = useCallback(() => {
        setEditingName(profileData.fullName);
        setIsEditing(false);
    }, [profileData.fullName]);

    // ✅ FIX: Thêm useCallback để tránh re-render không cần thiết
    const handleNameChange = useCallback((text: string) => {
        setEditingName(text);
    }, []);

    // ✅ FIX: Sửa lại InfoItem component
    const InfoItem = React.memo(({
        label,
        value,
        editable = false,
        onChangeText,
        inputValue
    }: {
        label: string;
        value: string;
        editable?: boolean;
        onChangeText?: (text: string) => void;
        inputValue?: string;
    }) => (
        <View style={styles.infoItem}>
            <Text style={styles.label}>{label}</Text>
            {editable && isEditing ? (
                <TextInput
                    style={styles.editableInput}
                    value={inputValue !== undefined ? inputValue : value}
                    onChangeText={onChangeText}
                    multiline={label === 'Địa chỉ'}
                    autoFocus={label === 'Họ và tên'}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    textContentType="name"
                    autoCorrect={false}
                    autoCapitalize="words"
                />
            ) : (
                <Text style={[styles.value, !editable && styles.disabledValue]}>
                    {value}
                </Text>
            )}
        </View>
    ));

    // Hiển thị loading - ✅ Chỉ hiện khi thực sự chưa có dữ liệu
    if (loading && !isInitialized) {
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
                            setEditingName(profileData.fullName); // ✅ Set giá trị ban đầu khi bắt đầu edit
                            setIsEditing(true);
                        }
                    }}
                >
                    <Text style={styles.editButtonText}>
                        {isEditing ? 'Lưu' : 'Sửa'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#795548']}
                        tintColor={'#795548'}
                        title="Kéo để làm mới..."
                        titleColor={'#795548'}
                    />
                }
            >
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
                    {/* ✅ FIX: Sử dụng editingName và setEditingName */}
                    <InfoItem
                        label="Họ và tên"
                        value={profileData.fullName}
                        inputValue={editingName}
                        editable={isEditing}
                        onChangeText={handleNameChange}
                    />


                    <InfoItem
                        label="Email"
                        value={email}
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
        textAlignVertical: 'top',
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