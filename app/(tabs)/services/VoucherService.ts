// services/VoucherService.ts
import axios from 'axios';
import { getUserData } from '../screens/utils/storage';
import { BASE_URL } from './api';

// Voucher object từ backend
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
}

// Voucher của user đã thu thập
export interface UserVoucher {
  _id: string;
  user_id: string;
  voucher_id: string | Voucher; // Có thể là object (populated) hoặc chỉ ID
  is_used: boolean;
  used_date?: string;
  status: string;
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

class VoucherService {
  validateVoucher(arg0: string, orderValue: number) {
      throw new Error('Method not implemented.');
  }
  // Lấy tất cả voucher có sẵn
  async getAllVouchers(): Promise<VoucherResponse> {
    try {
      const response = await axios.get(`${BASE_URL}/vouchers`);
      console.log('✅ Lấy danh sách voucher thành công:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách voucher:', error);
      throw error;
    }
  }

  // Lấy các voucher mà user đã thu thập
  async getUserVouchers(): Promise<UserVoucherResponse> {
    try {
      const userData = await getUserData('userData');
      const userId = userData;

      if (!userId) {
        throw new Error('Không tìm thấy thông tin user');
      }

      const response = await axios.get(`${BASE_URL}/voucher_users/user/${userId}`);
      console.log('✅ Lấy danh sách voucher của user:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy voucher của user:', error);
      throw error;
    }
  }
  // Thêm 1 voucher vào user (thu thập voucher)
  async addVoucherToUser(voucher_id: string): Promise<any> {
    try {
      const userData = await getUserData('userData');
      const user_id = userData;

      if (!user_id) {
        throw new Error('Không tìm thấy thông tin user');
      }

      const payload = {
        user_id,
        voucher_id,
        status: 'active',
         start_date: new Date().toISOString(), 
      };
      console.log('Payload gửi:', payload); // debug
      const response = await axios.post(`${BASE_URL}/voucher_users`, payload);
      console.log('✅ Đã thêm voucher vào user:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi thêm voucher vào user:', error);
      throw error;
    }
  }


}

export const voucherService = new VoucherService();
export default voucherService;
