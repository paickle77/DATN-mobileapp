// utils/auth.utils.ts
import { clearAllStorage, getUserData } from '../screens/utils/storage';
import { loginAuthService } from '../services/LoginAuthService';

export class AuthUtils {
  /**
   * Đăng xuất toàn diện - xóa token trên server và local
   */
  static async logout(): Promise<void> {
    try {
      // Gọi API logout để xóa refresh token khỏi server
      await loginAuthService.logout();
      
      // Xóa tất cả dữ liệu local
      await clearAllStorage();
      
      console.log('✅ Đăng xuất hoàn tất');
    } catch (error) {
      console.error('❌ Lỗi khi đăng xuất:', error);
      
      // Vẫn xóa local storage dù API lỗi
      await clearAllStorage();
    }
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  static async isLoggedIn(): Promise<boolean> {
    try {
      const accessToken = await getUserData('accessToken');
      const refreshToken = await getUserData('refreshToken');
      
      return !!(accessToken || refreshToken);
    } catch (error) {
      return false;
    }
  }

  /**
   * Kiểm tra access token có hết hạn chưa
   */
  static async isAccessTokenValid(): Promise<boolean> {
    try {
      const expiresString = await getUserData('accessTokenExpires');
      if (!expiresString) return false;
      
      const expires = parseInt(expiresString);
      return Date.now() < expires;
    } catch (error) {
      return false;
    }
  }

  /**
   * Kiểm tra refresh token có hết hạn chưa
   */
  static async isRefreshTokenValid(): Promise<boolean> {
    try {
      const expiresString = await getUserData('refreshTokenExpires');
      if (!expiresString) return false;
      
      const expires = parseInt(expiresString);
      return Date.now() < expires;
    } catch (error) {
      return false;
    }
  }

  /**
   * Kiểm tra session còn hợp lệ không (access token hoặc refresh token còn hạn)
   */
  static async isSessionValid(): Promise<boolean> {
    const isAccessTokenValid = await this.isAccessTokenValid();
    const isRefreshTokenValid = await this.isRefreshTokenValid();
    
    return isAccessTokenValid || isRefreshTokenValid;
  }

  /**
   * Force refresh token
   */
  static async forceRefreshToken(): Promise<boolean> {
    try {
      const result = await loginAuthService.refreshToken();
      return result.success;
    } catch (error) {
      console.error('❌ Lỗi khi force refresh token:', error);
      return false;
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  static async getCurrentUserInfo(): Promise<{
    accountId?: string;
    userId?: string;
    userRole?: string;
    userEmail?: string;
    userName?: string;
  }> {
    try {
      const accountId = await getUserData('accountId');
      const userId = await getUserData('userId');
      const userRole = await getUserData('userRole');
      const userEmail = await getUserData('userEmail');
      const userName = await getUserData('userName');

      return {
        accountId: accountId || undefined,
        userId: userId || undefined,
        userRole: userRole || undefined,
        userEmail: userEmail || undefined,
        userName: userName || undefined,
      };
    } catch (error) {
      console.error('❌ Lỗi khi lấy thông tin user:', error);
      return {};
    }
  }

  /**
   * Xử lý auto-navigation sau khi login/register thành công
   * @param navigation - React Navigation object
   * @param userRole - Vai trò của user (user, admin, shipper)
   */
  static handlePostAuthNavigation(navigation: any, userRole?: string): void {
    console.log('🎯 Điều hướng sau auth với role:', userRole);
    
    switch (userRole) {
      case 'admin':
        // Admin → Vẫn vào TabNavigator nhưng sẽ có admin features
        console.log('👑 Admin login → TabNavigator');
        navigation.reset({
          index: 0,
          routes: [{ name: 'TabNavigator' }],
        });
        break;
      case 'shipper':
        // Shipper → ShipTabNavigator 
        console.log('🚚 Shipper login → ShipTabNavigator');
        navigation.reset({
          index: 0,
          routes: [{ name: 'ShipTabNavigator' }],
        });
        break;
      case 'user':
      default:
        // User thường → TabNavigator
        console.log('👤 User login → TabNavigator');
        navigation.reset({
          index: 0,
          routes: [{ name: 'TabNavigator' }],
        });
        break;
    }
  }

  /**
   * Quick check xem có cần auto-login không (gọi từ màn hình chính)
   */
  static async shouldAutoLogin(): Promise<{
    shouldLogin: boolean;
    userInfo?: any;
  }> {
    try {
      const isSessionValid = await this.isSessionValid();
      
      if (isSessionValid) {
        const userInfo = await this.getCurrentUserInfo();
        
        // Thử refresh token để đảm bảo session còn hoạt động
        const refreshSuccess = await this.forceRefreshToken();
        
        if (refreshSuccess) {
          return { shouldLogin: true, userInfo };
        } else {
          // Token không thể refresh → logout
          await this.logout();
          return { shouldLogin: false };
        }
      }
      
      return { shouldLogin: false };
    } catch (error) {
      console.error('❌ Lỗi khi check auto-login:', error);
      return { shouldLogin: false };
    }
  }
}

export default AuthUtils;
