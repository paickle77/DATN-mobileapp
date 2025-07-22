// services/VoucherService.ts
import axios from 'axios';
import { getUserData } from '../screens/utils/storage';
import { BASE_URL } from './api';

export interface Voucher {
  _id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed'; // percentage hoặc fixed amount
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  usage_limit: number;
  used_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  __v: number;
}

export interface UserVoucher {
  _id: string;
  user_id: string;
  voucher_id: string;
  voucher: Voucher;
  is_used: boolean;
  used_date?: string;
  created_at: string;
  updated_at: string;
}

export interface VoucherResponse {
  success: boolean;
  message: string;
  data: Voucher[];
}

export interface UserVoucherResponse {
  success: boolean;
  message: string;
  data: UserVoucher[];
}

class VoucherService {
 

  // Lấy tất cả voucher có sẵn
  async getAllVouchers(): Promise<VoucherResponse> {
    try {
      const response = await axios.get(`${BASE_URL}/vouchers`);
      console.log('====================================');
      console.log('✅ Lấy danh sách voucher thành công:', response.data     );
      console.log('====================================');
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách voucher:', error);
      throw error;
    }
  }

  // Lấy voucher của user hiện tại
  async getUserVouchers(): Promise<UserVoucherResponse> {
    try {
      const userId = await getUserData('userData');
      if (!userId) {
        throw new Error('Không tìm thấy thông tin user');
      }

      const response = await axios.get(`${BASE_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy voucher của user:', error);
      throw error;
    }
  }

  // Thu thập voucher (claim voucher)
  async claimVoucher(voucherId: string): Promise<any> {
    try {
      const userId = await getUserData('userData');
      if (!userId) {
        throw new Error('Không tìm thấy thông tin user');
      }

      const response = await axios.post(`${BASE_URL}/user-vouchers/claim`, {
        user_id: userId,
        voucher_id: voucherId,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi thu thập voucher:', error);
      throw error;
    }
  }

  // Sử dụng voucher
  async useVoucher(userVoucherId: string, orderId: string): Promise<any> {
    try {
      const response = await axios.put(`${BASE_URL}/user-vouchers/${userVoucherId}/use`, {
        order_id: orderId,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi sử dụng voucher:', error);
      throw error;
    }
  }

  // Kiểm tra voucher có thể sử dụng không
  async validateVoucher(voucherCode: string, orderValue: number): Promise<any> {
    try {
      const response = await axios.post(`${BASE_URL}/vouchers/validate`, {
        code: voucherCode,
        order_value: orderValue,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi validate voucher:', error);
      throw error;
    }
  }

  // Format discount value để hiển thị
  formatDiscountValue(voucher: Voucher): string {
    if (voucher.discount_type === 'percentage') {
      return `${voucher.discount_value}%`;
    } else {
      return `${voucher.discount_value.toLocaleString('vi-VN')}đ`;
    }
  }

  // Kiểm tra voucher còn hạn không
  isVoucherValid(voucher: Voucher): boolean {
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);
    
    return now >= startDate && now <= endDate && voucher.is_active;
  }

  // Kiểm tra voucher còn lượt sử dụng không
  isVoucherAvailable(voucher: Voucher): boolean {
    return voucher.used_count < voucher.usage_limit;
  }
}

export const voucherService = new VoucherService();
export default voucherService;