// SettingService.ts
import { BASE_URL } from './api'; // Đảm bảo bạn đã định nghĩa BASE_URL trong config

export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface NotificationSettingsRequest {
  userId: string;
  settings: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
}

export interface DeleteAccountRequest {
  userId: string;
  password: string;
}

class SettingService {
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Thêm authorization header nếu cần
          // 'Authorization': `Bearer ${token}`,
        },
      };

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Đổi mật khẩu
  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return this.request<ChangePasswordResponse>('/api/user/change-password', 'POST', request);
  }

  // Cập nhật cài đặt thông báo
  async updateNotificationSettings(request: NotificationSettingsRequest): Promise<any> {
    return this.request('/api/user/notification-settings', 'PUT', request);
  }

  // Xóa tài khoản
  async deleteAccount(request: DeleteAccountRequest): Promise<any> {
    return this.request('/api/user/delete-account', 'DELETE', request);
  }

  // Lấy thông tin cài đặt hiện tại
  async getUserSettings(userId: string): Promise<any> {
    return this.request(`/api/user/settings/${userId}`, 'GET');
  }
}

export default new SettingService();