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
  discount_amount: number;        // ✅ Thêm discount_amount
  start_date: string;
  end_date: string;
  quantity: number;           // tổng số lượng phát hành
  used_count: number;         // đã dùng bao nhiêu
  max_usage_per_user: number; // tối đa mỗi user được dùng
  min_order_value: number;    // ✅ giá trị đơn hàng tối thiểu
  status: 'active' | 'inactive'; // trạng thái voucher
}

export interface UserVoucher {
  _id: string;
  Account_id: string;
  voucher_id: string | Voucher;
  code: string;                   // Copy từ voucher gốc
  bill_id?: string;              // Tham chiếu bill nếu có
  status: 'available' | 'active' | 'in_use'; // ✅ Chỉ còn 2 status chính
  usage_count: number;           // Số lần đã sử dụng
  saved_at: string;             // Thời gian lưu voucher
  used_at?: string;            // Thời gian sử dụng (nếu có)
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

export interface UseVoucherResponse {
  success: boolean;
  message: string;
  data?: {
    voucherUser: UserVoucher;
    voucher: {
      code: string;
      discount_percent: number;
      used_count: number;
      quantity: number;
    };
  };
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
      let vouchers: Voucher[] = response.data.data;

      // Lọc bỏ voucher đã hết lượt sử dụng
      // ✅ FIX: quantity = 0 có nghĩa là vô hạn lượt
      vouchers = vouchers.filter(
        (voucher) => voucher.quantity === 0 || voucher.used_count < voucher.quantity
      );

      console.log('✅ Lấy danh sách voucher thành công:', vouchers);
      return { ...response.data, data: vouchers };
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
      console.log('📥 Response từ API:', response.data);
      
      if (response.data.success) {
        const userVouchers = response.data.data as UserVoucher[];
        
        console.log('📋 UserVouchers received:', userVouchers.length);
        userVouchers.forEach((uv, index) => {
          console.log(`  ${index + 1}. ${typeof uv.voucher_id === 'object' ? uv.voucher_id.code : uv.voucher_id} - Status: ${uv.status}`);
        });

        return {
          success: true,
          message: "Lấy danh sách voucher đã lưu thành công",
          data: userVouchers,
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Không thể lấy danh sách voucher",
          data: [],
        };
      }
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy danh sách voucher account:', error);
      return {
        success: false,
        message: "Không thể lấy danh sách voucher",
        data: [],
      };
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
        voucher.status === 'active' &&
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

  // Lưu voucher vào danh sách với kiểm tra trùng lặp
  async saveVoucherToList(voucher: Voucher): Promise<any> {
  try {
    // Kiểm tra trước khi gọi API
    // ✅ FIX: quantity = 0 có nghĩa là vô hạn lượt
    if (voucher.quantity > 0 && voucher.used_count >= voucher.quantity) {
      throw new Error('Voucher này đã hết lượt sử dụng!');
    }

    const accountId = await this.getAccountId();
    const payload = {
      Account_id: accountId,
      voucher_id: voucher._id
    };

    console.log('💾 Đang lưu voucher:', payload);
    const response = await axios.post(`${BASE_URL}/voucher_users/save`, payload);
    console.log('✅ Lưu voucher thành công:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Lỗi khi lưu voucher:', error);

    if (error.response?.status === 409) {
      throw new Error('Bạn đã sử dụng giới hạn của voucher này!');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Voucher không hợp lệ');
    } else if (error.response?.status === 404) {
      throw new Error('Voucher không tồn tại hoặc đã bị vô hiệu hóa');
    }

    throw error.response?.data || error;
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

  // ✅ Đánh dấu voucher đang sử dụng khi tạo đơn hàng
  async markVoucherInUse(voucherUserId: string, billId?: string): Promise<any> {
    try {
      const payload = { voucherUserId, billId };

      console.log('🎯 Đang đánh dấu voucher đang sử dụng:', payload);
      const response = await axios.post(`${BASE_URL}/voucher_users/mark-in-use`, payload);
      console.log('✅ Đánh dấu voucher đang sử dụng thành công:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi đánh dấu voucher đang sử dụng:', error);
      throw error.response?.data || error;
    }
  }

  // ✅ Rollback voucher khi hủy đơn hàng - DISABLED
  // Voucher một khi đã sử dụng sẽ không được hoàn lại
  async rollbackVoucher(voucherUserId: string): Promise<any> {
    console.log('⚠️ Rollback voucher đã bị vô hiệu hóa - voucher không được hoàn lại khi hủy đơn');
    return {
      success: false,
      message: 'Voucher không được hoàn lại khi hủy đơn hàng'
    };
  }

  // Đánh dấu voucher đã sử dụng (gọi khi đơn hàng thành công)
  async markVoucherAsUsed(voucherUserId: string, billId?: string): Promise<UseVoucherResponse> {
    try {
      const payload = { voucherUserId, billId };

      console.log('🎯 Đang đánh dấu voucher đã sử dụng:', payload);
      const response = await axios.post(`${BASE_URL}/voucher_users/mark-used`, payload);
      console.log('✅ Đánh dấu voucher thành công:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi đánh dấu voucher đã sử dụng:', error);
      throw error.response?.data || error;
    }
  }

  // Sử dụng voucher (API cũ - giữ lại để tương thích)
  async useVoucher(voucherUserId: string): Promise<UseVoucherResponse> {
    try {
      const accountId = await this.getAccountId();

      const payload = {
        accountId,
        voucherUserId
      };

      console.log('🎫 Đang sử dụng voucher:', payload);
      const response = await axios.post(`${BASE_URL}/voucher_users/use`, payload);
      console.log('✅ Sử dụng voucher thành công:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi sử dụng voucher:', error);
      throw error.response?.data || error;
    }
  }

  // Cập nhật voucher hết hạn tự động
  async updateExpiredVouchers(): Promise<any> {
    try {
      console.log('⏰ Đang cập nhật voucher hết hạn...');
      const response = await axios.post(`${BASE_URL}/voucher_users/update-expired`);
      console.log('✅ Cập nhật voucher hết hạn thành công:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi cập nhật voucher hết hạn:', error);
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