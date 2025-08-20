// screens/ProfileScreen.tsx
import { Feather, Ionicons } from '@expo/vector-icons';
import { CommonActions, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator, Alert, Image, Modal,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

import { profileService, Users } from '../../services/ProfileService';
import { clearUserData, getUserData } from '../utils/storage';
const MenuItem = ({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIcon}>{icon}</View>
        <Text style={styles.menuLabel}>{label}</Text>
        <Feather name="chevron-right" size={22} color="#222" style={styles.chevron} />
    </TouchableOpacity>
);

type RootStackParamList = {
    Settings: { userId: string } | undefined;
    UserProfile: { userId: string ,accountId: String} | undefined;
    AddressList: { userId: string } | undefined;
    PaymentMethods: { userId: string } | undefined;
    OrderHistoryScreen: { userId: string } | undefined;
    VoucherScreen: { userId: string } | undefined;
    Login: undefined;
    Message: { userId: string } | undefined;
};

const ProfileScreen = () => {
    const [logoutVisible, setLogoutVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<Users | null>(null);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    // Xoá useState cho user vì không dùng đến
    // 👉 Gọi hàm từ service để lấy user
    useFocusEffect(
        useCallback(() => {
            const fetchUserFromStorage = async () => {
                setLoading(true);
                try {
                    const userData = await getUserData('userData') as Users | null;
                    if (!userData || !userData) return;

                    const accountId = await getUserData('userData'); // là account_id đã lưu từ login
                   
                    const user = await profileService.getProfileByAccountId(accountId);
                    
                    setUserProfile(user);
                    setUserProfile(user);
                } catch (err) {
                    console.error('❌ Lỗi khi lấy user:', err);
                }
                setLoading(false);
            };

            fetchUserFromStorage();
        }, [])
    );



    const handleLogout = async () => {
        try {
            setLogoutVisible(false);
            await clearUserData('userData'); // ✅ Xoá dữ liệu người dùng
            console.log('🟢 Đã xoá dữ liệu người dùng');
            // await clearUserData('token');    // ✅ Nếu bạn lưu token cũng xoá luôn
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })
            );
        } catch (err) {
            console.error('❌ Lỗi khi logout:', err);
            Alert.alert('Lỗi', 'Không thể đăng xuất');
        }
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
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
            <View style={styles.logoutOverlay}>
                <View style={styles.logoutBox}>
                    <Text style={styles.logoutTitle}>Đăng xuất</Text>
                    <View style={styles.logoutDivider} />
                    <Text style={styles.logoutMsg}>Bạn có chắc chắn muốn đăng xuất?</Text>
                    <View style={styles.logoutActions}>
                        <TouchableOpacity style={styles.logoutCancel} onPress={onCancel}>
                            <Text style={styles.logoutCancelText}>Huỷ bỏ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.logoutConfirm} onPress={onConfirm}>
                            <Text style={styles.logoutConfirmText}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

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
                <Image
                    source={{
                        uri: `data:image/jpeg;base64,${userProfile?.image || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqMZXi12fBQGZpQvD27ZJvSGmn-oNCXI9Etw&s'}`,
                    }}
                    style={styles.reviewImage}
                />
                <Text style={styles.name}>{userProfile?.name || 'Người Dùng'}</Text>
            </View>

            <View style={styles.menu}>
                <MenuItem icon={<Ionicons name="person-outline" size={24} color="#222" />} label="Hồ sơ của bạn"
                    onPress={() => navigation.navigate('UserProfile', {
                        userId: userProfile?._id ?? '',
                        accountId: userProfile?.account_id ?? '',
                        
                    })} />
                <MenuItem icon={<Ionicons name="pricetags-outline" size={24} color="#222" />} label="Kho voucher"
                    onPress={() => navigation.navigate('VoucherScreen',
                        { userId: userProfile?._id ?? '' },
                    )} />
                <MenuItem icon={<Ionicons name="location-outline" size={24} color="#222" />} label="Danh sách địa chỉ"
                    onPress={() => navigation.navigate('AddressList',
                        { userId: userProfile?._id ?? '' }
                    )} />

                <MenuItem icon={<Feather name="file-text" size={22} color="#222" />} label="Đơn hàng của bạn"
                    onPress={() => navigation.navigate('OrderHistoryScreen',
                        { userId: userProfile?._id ?? '' }
                    )} />
                <MenuItem icon={<Feather name="settings" size={22} color="#222" />} label="Cài đặt"
                    onPress={() => navigation.navigate('Settings',
                        { userId: userProfile?._id ?? '' },

                    )} />
                <MenuItem icon={<Feather name="message-circle" size={22} color="#222" />} label="Trò chuyện với admin"
                    onPress={() => navigation.navigate('Message',
                        { userId: userProfile?._id ?? '' },

                    )} />
            </View>

            <TouchableOpacity style={styles.logout} onPress={() => setLogoutVisible(true)}>
                <Feather name="log-out" size={22} color="#F00" />
                <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>

            <LogoutDialog visible={logoutVisible} onCancel={() => setLogoutVisible(false)} onConfirm={handleLogout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: 32 },
    header: { fontSize: 22, fontWeight: '500', textAlign: 'center', marginBottom: 8 },
    avatarContainer: { alignItems: 'center', marginBottom: 16 },
    avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#eee' },
    name: { fontWeight: '600', fontSize: 16, marginTop: 2, color: '#222' },
    menu: {},
    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 18,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
    },
    menuIcon: { width: 28, alignItems: 'center', marginRight: 12 },
    menuLabel: { flex: 1, fontSize: 16, color: '#222' },
    chevron: { marginLeft: 8 },
    logout: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginTop: 8 },
    logoutText: { color: '#F00', fontSize: 16, marginLeft: 10, fontWeight: '500' },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
    logoutOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    logoutBox: {
        width: 320, backgroundColor: '#fff',
        borderRadius: 18, paddingTop: 18, paddingBottom: 20,
        alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    },
    logoutTitle: { fontWeight: '600', fontSize: 16, marginBottom: 10 },
    logoutDivider: { width: '100%', height: 1, backgroundColor: '#eee', marginBottom: 18 },
    logoutMsg: { color: '#888', fontSize: 14, marginBottom: 24 },
    logoutActions: { flexDirection: 'row', justifyContent: 'space-between', width: '90%' },
    logoutCancel: {
        flex: 1, backgroundColor: '#eee', borderRadius: 24,
        paddingVertical: 12, marginRight: 10, alignItems: 'center',
    },
    logoutCancelText: { color: '#795548', fontWeight: '600', fontSize: 15 },
    logoutConfirm: {
        flex: 1, backgroundColor: '#795548', borderRadius: 24,
        paddingVertical: 12, alignItems: 'center',
    },
    logoutConfirmText: { color: '#fff', fontWeight: '600', fontSize: 15 },
    reviewImage: {
        width: 120,
        height: 120,
        borderRadius: 100,
        marginRight: 12,
        backgroundColor: '#EEE',
    },
});

export default ProfileScreen;
