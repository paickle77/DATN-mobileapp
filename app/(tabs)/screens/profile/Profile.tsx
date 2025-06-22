import { Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { profileService, Users } from '../../services/ProfileService';
import { getUserData } from '../utils/storage';

const MenuItem = ({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIcon}>{icon}</View>
        <Text style={styles.menuLabel}>{label}</Text>
        <Feather name="chevron-right" size={22} color="#222" style={styles.chevron} />
    </TouchableOpacity>
);

type RootStackParamList = {
    Settings: { userId: string } | undefined;
    UserProfile: { userId: string } | undefined;
    AddressList: { userId: string } | undefined;
    PaymentMethods: { userId: string } | undefined;
    OrderHistoryScreen: { userId: string } | undefined;
    Login: undefined;
};

const ProfileScreen = () => {
    const [logoutVisible, setLogoutVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<Users | null>(null);

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    // Fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                const userData = await getUserData();
                console.log('Current user data:', userData);

                const result = await profileService.getAll();
                console.log('✅ Dữ liệu trả về từ API:', JSON.stringify(result, null, 2));

                // Check if data exists (the API response has 'data' and 'msg' properties)
                if (result.data && result.data.length > 0 && userData && userData.userId) {
                    // Find user by userId from storage
                    const currentUser = result.data.find((item: any) => item._id === userData.userId);
                    console.log('Current user:', currentUser);
                    
                    if (currentUser) {
                        console.log('🟢 Found current user:', JSON.stringify(currentUser, null, 2));
                        setUserProfile(currentUser);
                    } else {
                        console.log('⚠️ User not found in API data');
                        Alert.alert('Thông báo', 'Không tìm thấy thông tin người dùng');
                    }
                } else if (!userData || !userData.userId) {
                    Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng trong bộ nhớ');
                    console.error('❌ Error: userData is null or missing userId');
                } else {
                    Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
                    console.error('❌ Error fetching user data:', result?.msg ?? 'Không có dữ liệu');
                }
            } catch (error) {
                console.error('❌ Error fetching profile:', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải thông tin người dùng');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        setLogoutVisible(false);
        // TODO: Add your logout logic here (clear storage, etc.)
    };

    const LogoutDialog = ({
        visible,
        onCancel,
        onConfirm,
    }: {
        visible: boolean;
        onCancel: () => void;
        onConfirm: () => void;
    }) => (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <View style={{
                    width: 320,
                    backgroundColor: '#fff',
                    borderRadius: 18,
                    paddingTop: 18,
                    paddingBottom: 20,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 5,
                }}>
                    <Text style={{
                        fontWeight: '600',
                        fontSize: 16,
                        marginBottom: 10,
                    }}>Đăng xuất</Text>
                    <View style={{
                        width: '100%',
                        height: 1,
                        backgroundColor: '#eee',
                        marginBottom: 18,
                    }} />
                    <Text style={{
                        color: '#888',
                        fontSize: 14,
                        marginBottom: 24,
                    }}>Bạn có chắc chắn muốn đăng xuất?</Text>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '90%',
                    }}>
                        <TouchableOpacity
                            onPress={onCancel}
                            style={{
                                flex: 1,
                                backgroundColor: '#eee',
                                borderRadius: 24,
                                paddingVertical: 12,
                                marginRight: 10,
                                alignItems: 'center',
                            }}>
                            <Text style={{
                                color: '#795548',
                                fontWeight: '600',
                                fontSize: 15,
                            }}>Huỷ bỏ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                onConfirm();
                                navigation.navigate('Login');
                            }}
                            style={{
                                flex: 1,
                                backgroundColor: '#795548',
                                borderRadius: 24,
                                paddingVertical: 12,
                                alignItems: 'center',
                            }}>
                            <Text style={{
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: 15,
                            }}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Show loading indicator while fetching data
    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#795548" />
                <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Hồ sơ</Text>
            <View style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                    <Image
                        source={require('../../../../assets/images/avatar-placeholder.png')}
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.editIcon}>
                        <MaterialIcons name="edit" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.name}>
                    {userProfile?.name || 'Người Dùng'}
                </Text>
            </View>
            <View style={styles.menu}>
                <MenuItem
                    icon={<Ionicons name="person-outline" size={24} color="#222" />}
                    label="Hồ sơ của bạn"
                    onPress={() => navigation.navigate('UserProfile', { userId: userProfile?._id ?? '' })}
                />
                <MenuItem
                    icon={<Ionicons name="location-outline" size={24} color="#222" />}
                    label="Danh sách địa chỉ"
                    onPress={() => navigation.navigate('AddressList', { userId: userProfile?._id ?? '' })}
                />
                <MenuItem
                    icon={<FontAwesome5 name="credit-card" size={20} color="#222" />}
                    label="Phương thức thanh toán"
                    onPress={() => navigation.navigate('PaymentMethods', { userId: userProfile?._id ?? '' })}
                />
                <MenuItem
                    icon={<Feather name="file-text" size={22} color="#222" />}
                    label="Đơn hàng của bạn"
                    onPress={() => navigation.navigate('OrderHistoryScreen', { userId: userProfile?._id ?? '' })}
                />
                <MenuItem
                    icon={<Feather name="settings" size={22} color="#222" />}
                    label="Cài đặt"
                    onPress={() => navigation.navigate('Settings', { userId: userProfile?._id ?? '' })}
                />
            </View>
            <TouchableOpacity style={styles.logout} onPress={() => setLogoutVisible(true)}>
                <Feather name="log-out" size={22} color="#F00" />
                <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
            <LogoutDialog
                visible={logoutVisible}
                onCancel={() => setLogoutVisible(false)}
                onConfirm={handleLogout}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 32,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        fontSize: 22,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 8,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarWrapper: {
        position: 'relative',
        width: 90,
        height: 90,
        marginBottom: 8,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#eee',
    },
    editIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#795548',
        borderRadius: 12,
        padding: 3,
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontWeight: '600',
        fontSize: 16,
        marginTop: 2,
        color: '#222',
    },
    email: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    phone: {
        fontSize: 14,
        color: '#666',
        marginTop: 1,
    },
    menu: {
        marginHorizontal: 0,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    menuIcon: {
        width: 28,
        alignItems: 'center',
        marginRight: 12,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: '#222',
    },
    chevron: {
        marginLeft: 8,
    },
    logout: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 8,
    },
    logoutText: {
        color: '#F00',
        fontSize: 16,
        marginLeft: 10,
        fontWeight: '500',
    },
});

export default ProfileScreen;