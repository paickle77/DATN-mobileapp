import axios from 'axios';
import { BASE_URL } from './api';

// Interface cho Address
export interface Address {
  _id?: string;
  user_id: string;
  name?: string;        // 👉 Thêm để lưu tên từ user
  phone?: string;       // 👉 Thêm để lưu số điện thoại từ user
  detail_address?: string;
  ward?: string;
  district?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
  address?: string;     // Địa chỉ đầy đủ dạng string
  is_default?: boolean;
}

// Interface cho response API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class AddressService {


// tạo địa chỉ đầu tiên 
  static async createFirstAddress(account_id: string, addressData: Partial<Address>): Promise<Address> {
    try {
      console.log('📍 Tạo địa chỉ đầu tiên với account_id:', account_id);
      
      const body = {
        account_id,
        ...addressData,
        is_default: true,
      };

      console.log('📍 Data gửi lên:', body);

      const response = await axios.post<ApiResponse<Address>>(`${BASE_URL}/addresses/first`, body);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể cập nhật địa chỉ');
      }

      console.log('✅ Cập nhật địa chỉ thành công');
      return response.data.data;
    } catch (error) {
      console.error('❌ Lỗi cập nhật địa chỉ:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Không thể cập nhật địa chỉ');
      }
      throw error;
    }
  }

  // Xóa địa chỉ
  static async deleteAddress(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Xóa địa chỉ:', id);

      await axios.delete(`${BASE_URL}/addresses/${id}`);

      console.log('✅ Xóa địa chỉ thành công');
      return true;
    } catch (error) {
      console.error('❌ Lỗi xóa địa chỉ:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Không thể xóa địa chỉ');
      }
      throw error;
    }
  }

  // Tạo địa chỉ mới
  static async createAddress(addressData: Omit<Address, '_id'>): Promise<Address> {
    try {
      const response = await axios.post<ApiResponse<Address>>(`${BASE_URL}/addresses`, addressData);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi tạo địa chỉ:', error);
      throw error;
    }
  }

  // Lấy địa chỉ theo user ID
  static async getAddressByUserId(userId: string): Promise<Address[]> {
    try {
      const response = await axios.get<ApiResponse<Address[]>>(`${BASE_URL}/addresses/user/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi lấy địa chỉ:', error);
      throw error;
    }
  }

  // Cập nhật địa chỉ
  static async updateAddress(id: string, addressData: Partial<Address>): Promise<Address> {
    try {
      const response = await axios.put<ApiResponse<Address>>(`${BASE_URL}/addresses/${id}`, addressData);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi cập nhật địa chỉ:', error);
      throw error;
    }
  }
// ✅ THÊM: Format địa chỉ thành string đầy đủ
  static formatAddressString(address: Address): string {
    const parts = [
      address.detail_address,
      address.ward,
      address.district,
      address.city
    ].filter(part => part && part.trim());

    return parts.length > 0 ? parts.join(', ') : (address.address || '');
  }

  // Xử lý địa chỉ từ string thành object
  static parseAddressString(addressString: string): Partial<Address> {
    const parts = addressString.split(',').map(part => part.trim());
    
    if (parts.length >= 4) {
      return {
        detail_address: parts[0],
        ward: parts[1],
        district: parts[2],
        city: parts[3]
      };
    }
    
    // Nếu không đủ 4 phần, trả về địa chỉ nguyên bản
    return { address: addressString };
  }
}