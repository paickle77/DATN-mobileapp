import { Feather, Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Address {
    id: string;
    name: string;
    phone: string;
    address: string;
    isDefault: boolean;
}

type RootStackParamList = {
    AddAddress: undefined;
    EditAddress: { address: Address };
};

const AddressListScreen = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    
    const [addresses, setAddresses] = useState<Address[]>([
        {
            id: '1',
            name: 'Nguyễn Văn A',
            phone: '0987654321',
            address: '123 Nguyễn Trãi, Phường 5, Quận 1, TP. Hồ Chí Minh',
            isDefault: true,
        },
        {
            id: '2',
            name: 'Nguyễn Văn A',
            phone: '0987654321',
            address: '456 Lê Lợi, Phường 3, Quận 1, TP. Hồ Chí Minh',
            isDefault: false,
        },
        {
            id: '3',
            name: 'Nguyễn Văn A',
            phone: '0987654321',
            address: '789 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh',
            isDefault: false,
        },
    ]);

    const handleSetDefault = (id: string) => {
        setAddresses(prev => 
            prev.map(addr => ({
                ...addr,
                isDefault: addr.id === id
            }))
        );
        Alert.alert('Thành công', 'Đã đặt làm địa chỉ mặc định');
    };

    const handleDeleteAddress = (id: string) => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa địa chỉ này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => {
                        setAddresses(prev => prev.filter(addr => addr.id !== id));
                    }
                }
            ]
        );
    };

    const renderAddressItem = ({ item }: { item: Address }) => (
        <View style={styles.addressItem}>
            <View style={styles.addressHeader}>
                <View style={styles.namePhoneContainer}>
                    <Text style={styles.addressName}>{item.name}</Text>
                    <Text style={styles.addressPhone}>{item.phone}</Text>
                </View>
                {item.isDefault && (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Mặc định</Text>
                    </View>
                )}
            </View>
            
            <Text style={styles.addressText}>{item.address}</Text>
            
            <View style={styles.addressActions}>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('EditAddress', { address: item })}
                >
                    <Feather name="edit-3" size={16} color="#795548" />
                    <Text style={styles.actionText}>Sửa</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteAddress(item.id)}
                >
                    <Feather name="trash-2" size={16} color="#F44336" />
                    <Text style={[styles.actionText, { color: '#F44336' }]}>Xóa</Text>
                </TouchableOpacity>
                
                {!item.isDefault && (
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(item.id)}
                    >
                        <Feather name="check-circle" size={16} color="#4CAF50" />
                        <Text style={[styles.actionText, { color: '#4CAF50' }]}>Đặt mặc định</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Danh sách địa chỉ</Text>
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => navigation.navigate('Address')}
                >
                    <Ionicons name="add" size={24} color="#795548" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={addresses}
                renderItem={renderAddressItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity 
                style={styles.addAddressButton}
                onPress={() => navigation.navigate('Address')}
            >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addAddressText}>Thêm địa chỉ mới</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
    },
    addButton: {
        padding: 8,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    addressItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    namePhoneContainer: {
        flex: 1,
    },
    addressName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 4,
    },
    addressPhone: {
        fontSize: 14,
        color: '#666',
    },
    defaultBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    defaultText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    addressText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
        marginBottom: 16,
    },
    addressActions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    actionText: {
        fontSize: 14,
        color: '#795548',
        marginLeft: 4,
        fontWeight: '500',
    },
    addAddressButton: {
        position: 'absolute',
        bottom: 30,
        left: 16,
        right: 16,
        backgroundColor: '#795548',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    addAddressText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default AddressListScreen;