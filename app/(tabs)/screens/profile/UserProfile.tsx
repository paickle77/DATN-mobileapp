import { Feather, MaterialIcons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type RootStackParamList = {
    TabNavigator: undefined;
    // ... các routes khác
};

const UserProfileScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    
    // State cho các thông tin người dùng
    const [profileData, setProfileData] = useState({
        avatar: require('../../../../assets/images/avatar-placeholder.png'),
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0123456789',
        address: '123 Đường ABC, Quận 1, TP.HCM'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({
        fullName: profileData.fullName,
        address: profileData.address
    });

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
                avatar: { uri: result.assets[0].uri }
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
                avatar: { uri: result.assets[0].uri }
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
    const handleSave = () => {
        setProfileData(prev => ({
            ...prev,
            fullName: editableData.fullName,
            address: editableData.address
        }));
        setIsEditing(false);
        Alert.alert('Thành công', 'Thông tin đã được cập nhật!');
    };

    // Hàm hủy chỉnh sửa
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
                        value={isEditing ? editableData.fullName : profileData.fullName}
                        editable={true}
                        onChangeText={(text) => setEditableData(prev => ({ ...prev, fullName: text }))}
                    />
                    
                    <InfoItem
                        label="Email"
                        value={profileData.email}
                        editable={false}
                    />
                    
                    <InfoItem
                        label="Số điện thoại"
                        value={profileData.phone}
                        editable={false}
                    />
                    
                    <InfoItem
                        label="Địa chỉ"
                        value={isEditing ? editableData.address : profileData.address}
                        editable={true}
                        onChangeText={(text) => setEditableData(prev => ({ ...prev, address: text }))}
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