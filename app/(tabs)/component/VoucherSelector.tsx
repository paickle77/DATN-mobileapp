// components/VoucherSelector.tsx
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { UserVoucher, Voucher, voucherService } from '../services/VoucherService';

interface VoucherSelectorProps {
    visible: boolean;
    orderValue: number;
    selectedVoucher?: UserVoucher | null;
    onClose: () => void;
    onSelectVoucher: (voucher: UserVoucher | null) => void;
}

const VoucherSelector: React.FC<VoucherSelectorProps> = ({
    visible,
    orderValue,
    selectedVoucher,
    onClose,
    onSelectVoucher,
}) => {
    const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
    const [loading, setLoading] = useState(false);
    const [voucherCode, setVoucherCode] = useState('');
    const [validatingCode, setValidatingCode] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchUserVouchers();
        }
    }, [visible]);

    const fetchUserVouchers = async () => {
        setLoading(true);
        try {
            const response = await voucherService.getUserVouchers();
            if (response.success) {
                // Lọc chỉ những voucher chưa sử dụng và còn hạn
                const availableVouchers = response.data.filter(uv => 
                    !uv.is_used && 
                    voucherService.isVoucherValid(uv.voucher) &&
                    orderValue >= uv.voucher.min_order_value
                );
                setUserVouchers(availableVouchers);
            }
        } catch (error) {
            console.error('❌ Lỗi khi tải voucher:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDiscount = (voucher: Voucher): number => {
        if (voucher.discount_type === 'percentage') {
            const discount = (orderValue * voucher.discount_value) / 100;
            return voucher.max_discount_amount 
                ? Math.min(discount, voucher.max_discount_amount)
                : discount;
        } else {
            return Math.min(voucher.discount_value, orderValue);
        }
    };

    const handleSelectVoucher = (userVoucher: UserVoucher) => {
        onSelectVoucher(userVoucher);
        onClose();
    };

    const handleRemoveVoucher = () => {
        onSelectVoucher(null);
        onClose();
    };

    const handleValidateCode = async () => {
        if (!voucherCode.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã voucher');
            return;
        }

        setValidatingCode(true);
        try {
            const response = await voucherService.validateVoucher(voucherCode.trim(), orderValue);
            if (response.success) {
                // Nếu validate thành công, tạo một UserVoucher tạm thời
                const tempUserVoucher: UserVoucher = {
                    _id: 'temp',
                    user_id: '',
                    voucher_id: response.data._id,
                    voucher: response.data,
                    is_used: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                onSelectVoucher(tempUserVoucher);
                onClose();
            } else {
                Alert.alert('Lỗi', response.message || 'Mã voucher không hợp lệ');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể kiểm tra mã voucher');
        } finally {
            setValidatingCode(false);
        }
    };

    const renderVoucherItem = ({ item }: { item: UserVoucher }) => {
        const discount = calculateDiscount(item.voucher);
        const isSelected = selectedVoucher?._id === item._id;

        return (
            <TouchableOpacity
                style={[styles.voucherItem, isSelected && styles.selectedVoucherItem]}
                onPress={() => handleSelectVoucher(item)}
            >
                <View style={styles.voucherInfo}>
                    <View style={styles.voucherHeader}>
                        <Text style={styles.voucherTitle} numberOfLines={1}>
                            {item.voucher.title}
                        </Text>
                        <Text style={styles.discountAmount}>
                            -{discount.toLocaleString('vi-VN')}đ
                        </Text>
                    </View>
                    <Text style={styles.voucherCode}>
                        Mã: {item.voucher.code}
                    </Text>
                    <Text style={styles.voucherDescription} numberOfLines={2}>
                        {item.voucher.description}
                    </Text>
                </View>
                {isSelected && (
                    <View style={styles.selectedIcon}>
                        <Feather name="check-circle" size={20} color="#4CAF50" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Feather name="x" size={24} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chọn Voucher</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Nhập mã voucher */}
                <View style={styles.codeInputSection}>
                    <Text style={styles.sectionTitle}>Nhập mã voucher</Text>
                    <View style={styles.codeInputContainer}>
                        <TextInput
                            style={styles.codeInput}
                            placeholder="Nhập mã voucher"
                            value={voucherCode}
                            onChangeText={setVoucherCode}
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity
                            style={[styles.validateButton, validatingCode && styles.validateButtonDisabled]}
                            onPress={handleValidateCode}
                            disabled={validatingCode}
                        >
                            {validatingCode ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.validateButtonText}>Áp dụng</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Danh sách voucher của user */}
                <View style={styles.voucherListSection}>
                    <Text style={styles.sectionTitle}>Voucher của bạn</Text>
                    
                    {selectedVoucher && (
                        <TouchableOpacity style={styles.removeVoucherButton} onPress={handleRemoveVoucher}>
                            <Text style={styles.removeVoucherText}>Bỏ chọn voucher</Text>
                        </TouchableOpacity>
                    )}

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#795548" />
                            <Text style={styles.loadingText}>Đang tải voucher...</Text>
                        </View>
                    ) : userVouchers.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                Không có voucher phù hợp với đơn hàng này
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={userVouchers}
                            renderItem={renderVoucherItem}
                            keyExtractor={(item) => item._id}
                            showsVerticalScrollIndicator={false}
                            style={styles.voucherList}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 44,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
    },
    codeInputSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 12,
    },
    codeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    codeInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginRight: 12,
        backgroundColor: '#fff',
    },
    validateButton: {
        backgroundColor: '#795548',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    validateButtonDisabled: {
        backgroundColor: '#ccc',
    },
    validateButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    voucherListSection: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    removeVoucherButton: {
        backgroundColor: '#f44336',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    removeVoucherText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    voucherList: {
        flex: 1,
    },
    voucherItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    selectedVoucherItem: {
        borderColor: '#4CAF50',
        backgroundColor: '#f1f8e9',
    },
    voucherInfo: {
        flex: 1,
    },
    voucherHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    voucherTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        flex: 1,
        marginRight: 8,
    },
    discountAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4CAF50',
    },
    voucherCode: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    voucherDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    selectedIcon: {
        marginLeft: 12,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});

export default VoucherSelector;