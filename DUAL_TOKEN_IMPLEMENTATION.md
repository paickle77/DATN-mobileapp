# 🔐 Nâng cấp Authentication System - Dual Token Implementation

## 📋 Tổng quan
Đã nâng cấp hệ thống authentication từ **single token** lên **dual token system** với:
- **Access Token**: Thời hạn 8 tiếng
- **Refresh Token**: Thời hạn 7 ngày

## 🛠️ Các thay đổi đã thực hiện

### 🔹 Backend Changes
1. **Environment Variables** (`.env`)
   - Thêm `REFRESH_TOKEN_SECRET` cho refresh token

2. **Database Schema** (`account.model.js`)
   - Thêm `refresh_token: String`
   - Thêm `refresh_token_expires: Date`

3. **JWT Utilities** (`utils/jwt.utils.js`)
   - `generateAccessToken()` - Tạo access token 8h
   - `generateRefreshToken()` - Tạo refresh token 7 ngày
   - `verifyAccessToken()` / `verifyRefreshToken()` - Verify tokens
   - `generateTokenPair()` - Tạo cặp token

4. **Auth Controller** (`api.auth.controller.js`)
   - **Login**: Trả về cặp token thay vì single token
   - **Register**: Tự động tạo tokens khi đăng ký
   - **Refresh Token API**: `/refresh-token` - Làm mới tokens
   - **Logout API**: `/logout` - Xóa refresh token khỏi DB

5. **Auth Middleware** (`api.auth.js`)
   - Sử dụng `JWTUtils.verifyAccessToken()`
   - Trả về lỗi cụ thể khi token hết hạn (`TOKEN_EXPIRED`)

6. **Routes** (`api.js`)
   - Thêm `POST /refresh-token`
   - Thêm `POST /logout`

### 🔹 Frontend Changes
1. **LoginAuthService.ts**
   - `login()`: Lưu access token, refresh token và expiry times
   - `refreshToken()`: API call để refresh tokens
   - `logout()`: Xóa refresh token trên server
   - `ensureValidToken()`: Auto refresh nếu cần

2. **RegisterAuthService.ts**  
   - Cập nhật để sử dụng `apiClient` với auto-refresh
   - Lưu tokens khi đăng ký thành công

3. **API Interceptor** (`api.interceptor.ts`)
   - **Request Interceptor**: Tự động thêm access token vào header
   - **Response Interceptor**: Auto refresh khi gặp lỗi `TOKEN_EXPIRED`
   - **Queue System**: Đợi refresh token xong mới retry requests

4. **Auth Utils** (`utils/auth.utils.ts`)
   - `logout()`: Đăng xuất toàn diện (server + local)
   - `isLoggedIn()` / `isSessionValid()`: Kiểm tra trạng thái
   - `getCurrentUserInfo()`: Lấy thông tin user hiện tại

5. **ProfileService.ts**
   - Sử dụng `apiClient` thay vì `axios` để tự động refresh

6. **Profile.tsx**
   - Cập nhật `handleLogout()` sử dụng `AuthUtils.logout()`

7. **useAuth Hook** (`hooks/useAuth.ts`)
   - Hook quản lý toàn diện auth state
   - Tự động kiểm tra và refresh token
   - Cung cấp methods: `login`, `logout`, `refreshToken`

## 🔄 Flow hoạt động

### Login Flow:
1. User đăng nhập → Server tạo cặp token → Lưu vào DB & client
2. Mọi API call tự động thêm access token vào header

### Auto Refresh Flow:
1. API call với access token hết hạn
2. Interceptor detect lỗi `TOKEN_EXPIRED`
3. Tự động gọi `/refresh-token` với refresh token
4. Lưu tokens mới và retry request gốc
5. Nếu refresh token hết hạn → Logout tự động

### Logout Flow:
1. Gọi API `/logout` để xóa refresh token khỏi server
2. Xóa tất cả data local (AsyncStorage)
3. Redirect về Login screen

## 📱 Cách sử dụng

### Trong Component:
```tsx
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { isLoggedIn, isLoading, userInfo, login, logout } = useAuth();
  
  // Auto handle login/logout states
};
```

### API Calls:
```tsx
import apiClient from '../services/api.interceptor';

// Tự động thêm access token và refresh nếu cần
const response = await apiClient.get('/protected-route');
```

## ✅ Lợi ích
- **Bảo mật cao hơn**: Access token ngắn hạn, refresh token dài hạn
- **UX tốt hơn**: User không bị logout đột ngột
- **Tự động hóa**: Auto refresh transparent với user
- **Logout an toàn**: Xóa tokens cả client và server

## 🔧 Cấu hình
- Access Token: **8 tiếng**
- Refresh Token: **7 ngày** (có thể thay đổi lên 30 ngày)
- Auto refresh khi access token gần hết hạn
- Logout tự động khi cả 2 token hết hạn
