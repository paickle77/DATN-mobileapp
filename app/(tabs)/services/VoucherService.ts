// services/VoucherService.ts
import axios from 'axios';
import dayjs from 'dayjs';
import { getUserData } from '../screens/utils/storage';
import { BASE_URL } from './api';

// --- INTERFACES ---

export interface Voucher {
  _id: string;
  code: string;
  description: string;
  discount_percent: number;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  usage_limit?: number;
  used_count?: number;
  min_order_value?: number;
  max_discount_amount?: number;
}

export interface UserVoucher {
  _id: string;
  Account_id: string;
  voucher_id: string | Voucher;
  is_used: boolean;
  used_date?: string;
  status: string; // 'active', 'used', 'expired'
  start_date: string;
  created_at?: string;
  updated_at?: string;
  __v?: number;
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

export interface ValidationResponse {
  success: boolean;
  message: string;
  data?: {
    isValid: boolean;
    discount_amount: number;
    final_amount: number;
    voucher: Voucher;
  }
}

// --- MAIN CLASS ---

class VoucherService {
  // Helper: Lấy accountId từ local storage
  private async getAccountId(): Promise<string> {
    const userData = await getUserData('userData');
    if (typeof userData === 'string') return userData;
    if (typeof userData === 'object' && userData !== null) {
      return userData._id || userData.id || userData.accountId;
    }
    throw new Error('Không tìm thấy thông tin tài khoản');
  }

  // Helper: Populate thông tin voucher nếu chỉ là ID
  private async populateVoucherDetails(userVouchers: UserVoucher[]): Promise<void> {
    try {
      const voucherIds = userVouchers
        .filter(item => typeof item.voucher_id === 'string')
        .map(item => item.voucher_id as string);

      if (voucherIds.length === 0) return;

      const voucherPromises = voucherIds.map(id => this.getVoucherById(id));
      const voucherResults = await Promise.allSettled(voucherPromises);

      userVouchers.forEach(userVoucher => {
        if (typeof userVoucher.voucher_id === 'string') {
          const voucherIndex = voucherIds.indexOf(userVoucher.voucher_id);
          const result = voucherResults[voucherIndex];
          if (result.status === 'fulfilled' && result.value.success) {
            userVoucher.voucher_id = result.value.data!;
          }
        }
      });
    } catch (error) {
      console.error('❌ Lỗi khi populate voucher details:', error);
    }
  }

  // Lấy tất cả voucher có sẵn
  async getAllVouchers(): Promise<VoucherResponse> {
    try {
      const response = await axios.get(`${BASE_URL}/vouchers`);
      console.log('✅ Lấy danh sách voucher thành công:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy danh sách voucher:', error);
      throw error;
    }
  }

  // Lấy danh sách voucher đã lưu theo account
  async getUserVouchers(): Promise<UserVoucherResponse> {
    try {
      const accountId = await this.getAccountId();
      console.log('🔍 Đang lấy danh sách voucher đã save của account:', accountId);
      const response = await axios.get(`${BASE_URL}/voucher_users/account/${accountId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy danh sách voucher account:', error);
      throw error;
    }
  }

  // Lấy voucher chưa lưu
  async getAvailableVouchers(): Promise<VoucherResponse> {
    try {
      const allVouchersResponse = await this.getAllVouchers();
      if (!allVouchersResponse.success) {
        throw new Error(allVouchersResponse.message);
      }

      const userVouchersResponse = await this.getUserVouchers();
      const savedVoucherIds = userVouchersResponse.data.map(item =>
        typeof item.voucher_id === 'object' ? item.voucher_id._id : item.voucher_id
      );

      const availableVouchers = allVouchersResponse.data.filter(voucher =>
        !savedVoucherIds.includes(voucher._id) &&
        voucher.is_active !== false &&
        dayjs(voucher.end_date).isAfter(dayjs())
      );

      return {
        success: true,
        message: 'Lấy danh sách voucher khả dụng thành công',
        data: availableVouchers
      };
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy voucher khả dụng:', error);
      throw error;
    }
  }

  // Lưu voucher vào danh sách
  async saveVoucherToList(voucher_id: string): Promise<any> {
    try {
      const accountId = await this.getAccountId();

      const payload = {
        Account_id: accountId,
        voucher_id,
        status: 'active',
        start_date: new Date().toISOString(),
        is_used: false
      };

      console.log('💾 Đang lưu voucher:', payload);
      const response = await axios.post(`${BASE_URL}/voucher_users`, payload);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi lưu voucher:', error);
      throw error;
    }
  }

  // Xoá voucher đã lưu
  async removeVoucherFromList(userVoucherId: string): Promise<any> {
    try {
      const response = await axios.delete(`${BASE_URL}/voucher_users/${userVoucherId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi xóa voucher:', error);
      throw error;
    }
  }

  // Lấy chi tiết một voucher theo ID
  async getVoucherById(id: string): Promise<{ success: boolean; message: string; data?: Voucher }> {
    try {
      const response = await axios.get(`${BASE_URL}/vouchers/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Không tìm thấy voucher'
      };
    }
  }
}

export default new VoucherService();