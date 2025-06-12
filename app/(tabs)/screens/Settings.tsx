import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Định nghĩa interface cho props của MenuItem
interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
    showChevron?: boolean;
    textColor?: string;
}

// Component MenuItem tái sử dụng
const MenuItem = ({ icon, label, onPress, showChevron = true, textColor = '#222' }: MenuItemProps) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIcon}>{icon}</View>
        <Text style={[styles.menuLabel, { color: textColor }]}>{label}</Text>
        {showChevron && <Feather name="chevron-right" size={22} color="#222" style={styles.chevron} />}
    </TouchableOpacity>
);

const SettingsScreen = () => {
    const navigation = useNavigation();
    
    // Trạng thái điều hướng giữa các màn hình
    const [currentScreen, setCurrentScreen] = useState<'main' | 'notifications' | 'password' | 'delete'>('main');
    
    // Cài đặt thông báo
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    
    // Form đổi mật khẩu
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Xóa tài khoản
    const [deletePassword, setDeletePassword] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // Hàm quay lại màn hình trước
    const goBack = () => {
        if (currentScreen === 'main') {
            navigation.goBack();
        } else {
            setCurrentScreen('main');
        }
    };

    // Xử lý cập nhật mật khẩu
    const handlePasswordUpdate = () => {
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        // TODO: Thêm logic cập nhật mật khẩu ở đây
        alert('Cập nhật mật khẩu thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // Xử lý xóa tài khoản
    const handleDeleteAccount = () => {
        if (!confirmDelete) {
            alert('Vui lòng xác nhận bạn muốn xóa tài khoản!');
            return;
        }
        if (!deletePassword) {
            alert('Vui lòng nhập mật khẩu để xác nhận!');
            return;
        }
        setDeleteModalVisible(true);
    };

    // Xác nhận xóa tài khoản cuối cùng
    const confirmDeleteAccount = () => {
        setDeleteModalVisible(false);
        // TODO: Thêm logic xóa tài khoản ở đây
        alert('Tài khoản đã được xóa!');
        navigation.navigate('Login' as never);
    };

    // Dialog xác nhận xóa tài khoản
    const DeleteConfirmDialog = () => (
        <Modal
            transparent
            visible={deleteModalVisible}
            animationType="fade"
            onRequestClose={() => setDeleteModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Xác nhận xóa tài khoản</Text>
                    <View style={styles.modalDivider} />
                    <Text style={styles.modalText}>
                        Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn? 
                        Hành động này không thể hoàn tác!
                    </Text>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            onPress={() => setDeleteModalVisible(false)}
                            style={[styles.modalButton, styles.cancelButton]}
                        >
                            <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={confirmDeleteAccount}
                            style={[styles.modalButton, styles.confirmButton]}
                        >
                            <Text style={styles.confirmButtonText}>Xóa tài khoản</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Màn hình cài đặt chính
    const MainSettingsScreen = () => (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cài đặt</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <MenuItem
                    icon={<Ionicons name="notifications-outline" size={24} color="#4A90E2" />}
                    label="Cài đặt thông báo"
                    onPress={() => setCurrentScreen('notifications')}
                />
                <MenuItem
                    icon={<Feather name="lock" size={22} color="#50C878" />}
                    label="Quản lý mật khẩu"
                    onPress={() => setCurrentScreen('password')}
                />
                <MenuItem
                    icon={<Feather name="trash-2" size={22} color="#FF6B6B" />}
                    label="Xóa tài khoản"
                    onPress={() => setCurrentScreen('delete')}
                    textColor="#FF6B6B"
                />
            </ScrollView>
        </View>
    );

    // Màn hình cài đặt thông báo
    const NotificationSettingsScreen = () => (
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
                        thumbColor={pushNotifications ? '#fff' : '#fff'}
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
                        thumbColor={emailNotifications ? '#fff' : '#fff'}
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
                        thumbColor={soundEnabled ? '#fff' : '#fff'}
                    />
                </View>
            </ScrollView>
        </View>
    );

    // Màn hình quản lý mật khẩu
    const PasswordManagementScreen = () => (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý mật khẩu</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Đổi mật khẩu</Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu hiện tại"
                        secureTextEntry
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu mới"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Xác nhận mật khẩu mới"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    
                    <TouchableOpacity style={styles.primaryButton} onPress={handlePasswordUpdate}>
                        <Text style={styles.primaryButtonText}>Cập nhật mật khẩu</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.securityFeature}>
                        <MaterialIcons name="security" size={24} color="#4A90E2" />
                        <Text style={styles.formTitle}>Xác thực hai yếu tố</Text>
                    </View>
                    <Text style={styles.securityDescription}>
                        Tăng cường bảo mật cho tài khoản của bạn
                    </Text>
                    <TouchableOpacity style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>Kích hoạt 2FA</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );

    // Màn hình xóa tài khoản
    const DeleteAccountScreen = () => (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Xóa tài khoản</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.warningContainer}>
                    <Feather name="alert-triangle" size={32} color="#FF6B6B" />
                    <Text style={styles.warningTitle}>Cảnh báo!</Text>
                    <Text style={styles.warningText}>
                        Việc xóa tài khoản sẽ không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn, bao gồm:
                    </Text>
                    <Text style={styles.warningList}>
                        • Thông tin cá nhân{'\n'}
                        • Lịch sử hoạt động{'\n'}
                        • Cài đặt và tùy chọn{'\n'}
                        • Tất cả dữ liệu liên quan
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Nhập mật khẩu để xác nhận</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu của bạn"
                        secureTextEntry
                        value={deletePassword}
                        onChangeText={setDeletePassword}
                    />

                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity 
                            style={styles.checkbox}
                            onPress={() => setConfirmDelete(!confirmDelete)}
                        >
                            {confirmDelete && <Feather name="check" size={16} color="#fff" />}
                        </TouchableOpacity>
                        <Text style={styles.checkboxText}>
                            Tôi hiểu rằng việc này không thể hoàn tác và muốn xóa tài khoản vĩnh viễn
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
                        <Text style={styles.dangerButtonText}>Xóa tài khoản vĩnh viễn</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );

    // Render màn hình tương ứng
    const renderScreen = () => {
        switch (currentScreen) {
            case 'notifications':
                return <NotificationSettingsScreen />;
            case 'password':
                return <PasswordManagementScreen />;
            case 'delete':
                return <DeleteAccountScreen />;
            default:
                return <MainSettingsScreen />;
        }
    };

    return (
        <>
            {renderScreen()}
            <DeleteConfirmDialog />
        </>
    );
};

// Styles cho toàn bộ component
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
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    menuIcon: {
        width: 32,
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
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#222',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
    },
    formContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    primaryButton: {
        backgroundColor: '#50C878',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    securityFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    securityDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    warningContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: '#fff5f5',
        borderWidth: 1,
        borderColor: '#fed7d7',
        borderRadius: 12,
        alignItems: 'center',
    },
    warningTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B6B',
        marginTop: 8,
        marginBottom: 12,
    },
    warningText: {
        fontSize: 14,
        color: '#744210',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 20,
    },
    warningList: {
        fontSize: 14,
        color: '#744210',
        lineHeight: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#222',
        marginBottom: 8,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#FF6B6B',
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#FF6B6B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    dangerButton: {
        backgroundColor: '#FF6B6B',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    dangerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
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
    },
    modalTitle: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 10,
        color: '#222',
    },
    modalDivider: {
        width: '100%',
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 18,
    },
    modalText: {
        color: '#666',
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
    },
    modalButton: {
        flex: 1,
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#eee',
        marginRight: 10,
    },
    confirmButton: {
        backgroundColor: '#FF6B6B',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 15,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
});

export default SettingsScreen;