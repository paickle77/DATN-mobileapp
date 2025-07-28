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
  user_id: string;
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
  // Helper: Lấy userId từ local storage
  private async getUserId(): Promise<string> {
    const userData = await getUserData('userData');
    if (typeof userData === 'string') return userData;
    if (typeof userData === 'object' && userData !== null) {
      return userData._id || userData.id || userData.userId;
    }
    throw new Error('Không tìm thấy thông tin user');
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
      if (error.response) {
        const message = error.response.data?.message || 'Lỗi từ server';
        throw new Error(`${error.response.status}: ${message}`);
      } else if (error.request) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        throw new Error(error.message || 'Đã xảy ra lỗi không xác định');
      }
    }
  }

  // Lấy danh sách voucher mà user đã thu thập
  async getUserVouchers(): Promise<UserVoucherResponse> {
    try {
      const userId = await this.getUserId();
      console.log('🔍 Đang lấy danh sách voucher đã save của user:', userId);
      const response = await axios.get(`${BASE_URL}/voucher_users/user/${userId}`);
      console.log('✅ Đã lấy danh sách voucher user:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy danh sách voucher user:', error);
      if (error.response) {
        const message = error.response.data?.message || 'Lỗi từ server';
        throw new Error(`${error.response.status}: ${message}`);
      } else if (error.request) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        throw new Error(error.message || 'Đã xảy ra lỗi không xác định');
      }
    }
  }

  // Lấy voucher chưa lưu
  async getAvailableVouchers(): Promise<VoucherResponse> {
    try {
      const userId = await this.getUserId();

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

  // Save voucher vào danh sách của user
  async saveVoucherToList(voucher_id: string): Promise<any> {
    try {
      const user_id = await this.getUserId();

      const payload = {
        user_id,
        voucher_id,
        status: 'active',
        start_date: new Date().toISOString(),
        is_used: false
      };

      console.log('💾 Đang save voucher vào danh sách:', payload);
      const response = await axios.post(`${BASE_URL}/voucher_users`, payload);
      console.log('✅ Đã save voucher vào danh sách:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi save voucher:', error);
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Lỗi từ server';
        if (status === 400) {
          throw new Error('Dữ liệu gửi không hợp lệ: ' + message);
        } else if (status === 409) {
          throw new Error('Bạn đã có voucher này trong danh sách rồi!');
        } else {
          throw new Error(`${status}: ${message}`);
        }
      } else if (error.request) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        throw new Error(error.message || 'Đã xảy ra lỗi không xác định');
      }
    }
  }

  // Xoá voucher đã lưu
  async removeVoucherFromList(userVoucherId: string): Promise<any> {
    try {
      const response = await axios.delete(`${BASE_URL}/voucher_users/${userVoucherId}`);
      console.log('✅ Đã xóa voucher khỏi danh sách:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi xóa voucher:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Không thể xóa voucher');
      } else {
        throw new Error('Không thể kết nối đến server');
      }
    }
  }

  // Lấy chi tiết một voucher theo ID
  async getVoucherById(id: string): Promise<{ success: boolean, message: string, data?: Voucher }> {
    try {
      const response = await axios.get(`${BASE_URL}/vouchers/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy chi tiết voucher:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Không tìm thấy voucher'
      };
    }
  }
}

export default new VoucherService();
