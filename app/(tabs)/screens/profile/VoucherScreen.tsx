// screens/VoucherScreen.tsx
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { UserVoucher, Voucher, voucherService } from '../../services/VoucherService';

const VoucherCard = ({
    voucher,
    userVoucher,
    onClaim,
    isLoading
}: {
    voucher: Voucher;
    userVoucher?: UserVoucher;
    onClaim: (voucherId: string) => void;
    isLoading: boolean;
}) => {
    const isExpired = !voucherService.isVoucherValid(voucher);
    const isUnavailable = !voucherService.isVoucherAvailable(voucher);
    const isOwned = !!userVoucher;
    const isUsed = userVoucher?.is_used;

    const getStatusText = () => {
        if (isUsed) return 'Đã sử dụng';
        if (isExpired) return 'Hết hạn';
        if (isUnavailable) return 'Hết lượt';
        if (isOwned) return 'Đã sở hữu';
        return 'Thu thập';
    };

    const getStatusColor = () => {
        if (isUsed) return '#999';
        if (isExpired || isUnavailable) return '#F44336';
        if (isOwned) return '#4CAF50';
        return '#795548';
    };

    const canClaim = !isExpired && !isUnavailable && !isOwned;

    return (
        <View style={[styles.voucherCard, (isExpired || isUsed) && styles.voucherCardDisabled]}>
            <View style={styles.voucherLeft}>
                <View style={[styles.discountBadge, { backgroundColor: getStatusColor() }]}>
                    <Text style={styles.discountText}>
                        {voucherService.formatDiscountValue(voucher)}
                    </Text>
                </View>
            </View>

            <View style={styles.voucherContent}>
                <Text style={styles.voucherTitle} numberOfLines={1}>
                    {voucher.code}
                </Text>
                <Text style={styles.voucherDescription} numberOfLines={2}>
                    {voucher.description}
                </Text>
                <Text style={styles.voucherCondition}>
                    Giảm: {voucher.discount_percent}%
                </Text>
                <Text style={styles.voucherExpiry}>
                    HSD: {new Date(voucher.end_date).toLocaleDateString('vi-VN')}
                </Text>
            </View>

            <View style={styles.voucherRight}>
                <TouchableOpacity
                    style={[
                        styles.claimButton,
                        !canClaim && styles.claimButtonDisabled,
                    ]}
                    onPress={() => canClaim && onClaim(voucher._id)}
                    disabled={!canClaim || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={[
                            styles.claimButtonText,
                            !canClaim && styles.claimButtonTextDisabled,
                        ]}>
                            {getStatusText()}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const VoucherScreen = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
    const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
    const [activeTab, setActiveTab] = useState<'available' | 'owned'>('available');
    const navigation = useNavigation();

    const fetchData = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const [availableResponse, userResponse] = await Promise.all([
                voucherService.getAllVouchers(),
                voucherService.getUserVouchers(),
            ]);

            if (availableResponse.success) {
                setAvailableVouchers(availableResponse.data);
            }

            if (userResponse.success) {
                setUserVouchers(userResponse.data);
            }
        } catch (error) {
            console.error('❌ Lỗi khi tải voucher:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách voucher');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const handleClaimVoucher = async (voucherId: string) => {
        setClaimingId(voucherId);
        try {
            const response = await voucherService.claimVoucher(voucherId);
            if (response.success) {
                Alert.alert('Thành công', 'Thu thập voucher thành công!', [
                    { text: 'OK', onPress: () => fetchData() }
                ]);
            } else {
                Alert.alert('Lỗi', response.message || 'Không thể thu thập voucher');
            }
        } catch (error) {
            console.error('❌ Lỗi khi thu thập voucher:', error);
            Alert.alert('Lỗi', 'Không thể thu thập voucher');
        } finally {
            setClaimingId(null);
        }
    };

    const renderAvailableVouchers = () => {
        if (availableVouchers.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <MaterialIcons name="local-offer" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>Không có voucher nào</Text>
                </View>
            );
        }

        return availableVouchers.map((voucher) => {
            const userVoucher = userVouchers.find(uv => uv.voucher_id === voucher._id);
            return (
                <VoucherCard
                    key={voucher._id}
                    voucher={voucher}
                    userVoucher={userVoucher}
                    onClaim={handleClaimVoucher}
                    isLoading={claimingId === voucher._id}
                />
            );
        });
    };

    const renderOwnedVouchers = () => {
        if (userVouchers.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <MaterialIcons name="inventory" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>Bạn chưa có voucher nào</Text>
                </View>
            );
        }

        return userVouchers.map((userVoucher) => (
            <VoucherCard
                key={userVoucher._id}
                voucher={userVoucher.voucher}
                userVoucher={userVoucher}
                onClaim={() => { }}
                isLoading={false}
            />
        ));
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#795548" />
                <Text style={styles.loadingText}>Đang tải voucher...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kho Voucher</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'available' && styles.activeTab]}
                    onPress={() => setActiveTab('available')}
                >
                    <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
                        Có sẵn ({availableVouchers.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'owned' && styles.activeTab]}
                    onPress={() => setActiveTab('owned')}
                >
                    <Text style={[styles.tabText, activeTab === 'owned' && styles.activeTabText]}>
                        Của tôi ({userVouchers.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
                }
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'available' ? renderAvailableVouchers() : renderOwnedVouchers()}
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    header: {
        flexDirection: 'row'
        , alignItems: 'center'
        , justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 44,
        paddingBottom: 16,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222'
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#795548'
    },
    tabText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500'
    },
    activeTabText: {
        color: '#795548',
        fontWeight: '600'
    },
    content: {
        flex: 1,
        padding: 16
    },
    voucherCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    voucherCardDisabled: {
        opacity: 0.6
    },
    voucherLeft: {
        marginRight: 16,
        justifyContent: 'center'
    },
    discountBadge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    discountText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
        textAlign: 'center',
    },
    voucherContent: {
        flex: 1
    },
    voucherTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 4
    },
    voucherDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20
    },
    voucherCondition: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2
    },
    voucherExpiry: {
        fontSize: 12,
        color: '#888'
    },
    voucherRight: {
        justifyContent: 'center',
        marginLeft: 12
    },
    claimButton: {
        backgroundColor: '#795548',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    claimButtonDisabled: {
        backgroundColor: '#ccc'
    },
    claimButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600'
    },
    claimButtonTextDisabled: {
        color: '#888'
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666'
    },
});

export default VoucherScreen;
