// hooks/useVoucher.ts
import { useState } from 'react';
import { UserVoucher, Voucher, voucherService } from '../app/(tabs)/services/VoucherService';

interface UseVoucherReturn {
    selectedVoucher: UserVoucher | null;
    discount: number;
    finalAmount: number;
    selectVoucher: (voucher: UserVoucher | null) => void;
    calculateDiscount: (voucher: Voucher, orderValue: number) => number;
    validateVoucherForOrder: (voucher: Voucher, orderValue: number) => boolean;
    formatDiscountText: (voucher: Voucher) => string;
}

export const useVoucher = (orderValue: number): UseVoucherReturn => {
    const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);

    const calculateDiscount = (voucher: Voucher, orderValue: number): number => {
        if (orderValue < voucher.min_order_value) {
            return 0;
        }

        if (voucher.discount_type === 'percentage') {
            const discount = (orderValue * voucher.discount_value) / 100;
            return voucher.max_discount_amount 
                ? Math.min(discount, voucher.max_discount_amount)
                : discount;
        } else {
            return Math.min(voucher.discount_value, orderValue);
        }
    };

    const validateVoucherForOrder = (voucher: Voucher, orderValue: number): boolean => {
        // Kiểm tra đơn hàng có đủ điều kiện không
        if (orderValue < voucher.min_order_value) {
            return false;
        }

        // Kiểm tra voucher còn hạn không
        if (!voucherService.isVoucherValid(voucher)) {
            return false;
        }

        // Kiểm tra voucher còn lượt sử dụng không
        if (!voucherService.isVoucherAvailable(voucher)) {
            return false;
        }

        return true;
    };

    const selectVoucher = (voucher: UserVoucher | null) => {
        if (voucher && !validateVoucherForOrder(voucher.voucher, orderValue)) {
            console.warn('Voucher không hợp lệ cho đơn hàng này');
            return;
        }
        setSelectedVoucher(voucher);
    };

    const formatDiscountText = (voucher: Voucher): string => {
        return voucherService.formatDiscountValue(voucher);
    };

    const discount = selectedVoucher 
        ? calculateDiscount(selectedVoucher.voucher, orderValue)
        : 0;

    const finalAmount = Math.max(0, orderValue - discount);

    return {
        selectedVoucher,
        discount,
        finalAmount,
        selectVoucher,
        calculateDiscount,
        validateVoucherForOrder,
        formatDiscountText,
    };
};

export default useVoucher;