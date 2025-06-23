import axios from 'axios';
import { BASE_URL } from './api';

// Interface cho Address
export interface Address {
  _id?: string;
  user_id: string;
  detail_address?: string;
  ward?: string;
  district?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
  address?: string; // Địa chỉ đầy đủ dạng string
}

// Interface cho response API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class AddressService {
  private static baseUrl = `${BASE_URL}/addresses`;

  // Tạo địa chỉ mới
  static async createAddress(addressData: Omit<Address, '_id'>): Promise<Address> {
    try {
      const response = await axios.post<ApiResponse<Address>>(this.baseUrl, addressData);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi tạo địa chỉ:', error);
      throw error;
    }
  }

  // Lấy địa chỉ theo user ID
  static async getAddressByUserId(userId: string): Promise<Address[]> {
    try {
      const response = await axios.get<ApiResponse<Address[]>>(`${this.baseUrl}/user/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi lấy địa chỉ:', error);
      throw error;
    }
  }

  // Cập nhật địa chỉ
  static async updateAddress(id: string, addressData: Partial<Address>): Promise<Address> {
    try {
      const response = await axios.put<ApiResponse<Address>>(`${this.baseUrl}/${id}`, addressData);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi cập nhật địa chỉ:', error);
      throw error;
    }
  }

  // Xóa địa chỉ
  static async deleteAddress(id: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
      return true;
    } catch (error) {
      console.error('Lỗi xóa địa chỉ:', error);
      throw error;
    }
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