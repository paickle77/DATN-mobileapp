# 📋 ACCOUNT MODEL FIELDS DOCUMENTATION

## 🔐 **REFRESH_TOKENS ARRAY** - Multi-Device Support

### **`token_hash`** (String, required)
- **Tác dụng**: Lưu hash SHA256 của refresh token thay vì plaintext
- **Bảo mật**: Nếu database bị hack, hacker không thể sử dụng token
- **Ví dụ**: `"a1b2c3d4e5f6..."` thay vì `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

### **`expires_at`** (Date, required)  
- **Tác dụng**: Thời điểm hết hạn của refresh token
- **Logic**: User 7 ngày, Admin 1 ngày (development có thể dài hơn)
- **Use case**: Auto cleanup tokens hết hạn, không để DB phình to

### **`device_info`** (String)
- **Tác dụng**: Nhận diện thiết bị đăng nhập
- **Ví dụ**: `"iPhone 14 Pro"`, `"Chrome 118.0 (Windows 11)"`, `"Samsung Galaxy S23"`
- **Admin dashboard**: "User john@email.com đang đăng nhập trên 3 thiết bị"
- **User benefit**: "Đăng xuất iPhone từ xa"

### **`ip_address`** (String)
- **Tác dụng**: Track địa điểm đăng nhập
- **Use case**: Phát hiện login từ quốc gia khác, IP đáng ngờ
- **Alert**: "Tài khoản của bạn đăng nhập từ IP 1.2.3.4 (Vietnam) lúc 14:30"

### **`created_at`** (Date)
- **Tác dụng**: Audit trail - biết token được tạo khi nào
- **Use case**: "User này tạo token hồi nào mà chưa dùng?"

### **`last_used`** (Date)
- **Tác dụng**: Track lần cuối sử dụng token
- **Cleanup logic**: Xóa tokens không dùng quá 30 ngày
- **Sort logic**: Xóa token ít dùng nhất khi vượt quá limit thiết bị

---

## 🛡️ **SECURITY TRACKING FIELDS**

### **`last_login_ip`** (String)
- **Tác dụng**: IP đăng nhập gần nhất của user
- **So sánh**: Nếu khác xa IP trước → cảnh báo
- **Example**: `"192.168.1.100"` → `"14.161.25.10"` → Alert!

### **`last_login_device`** (String) 
- **Tác dụng**: Device đăng nhập gần nhất
- **Pattern recognition**: User thường dùng iPhone → đột nhiên Android → đáng ngờ
- **Admin view**: "User xyz đổi từ iPhone sang PC"

### **`last_login_at`** (Date)
- **Tác dụng**: Timestamp đăng nhập cuối cùng
- **Inactive users**: Tìm user không hoạt động > 30 ngày
- **Security**: "Tài khoản không dùng lâu bị hack" → disable

---

## 🚨 **BRUTE FORCE PROTECTION**

### **`login_attempts`** (Number, default: 0)
- **Tác dụng**: Đếm số lần nhập sai mật khẩu liên tiếp
- **Logic**: 
  - Admin: 3 lần → khóa
  - User: 5 lần → khóa  
  - Reset về 0 khi login thành công
- **Chống bot**: Bot không thể brute force

### **`locked_until`** (Date)
- **Tác dụng**: Thời điểm tự động mở khóa
- **Duration**: 
  - Admin: 30 phút (security cao hơn)
  - User: 15 phút
- **Manual unlock**: Admin có thể unlock sớm

---

## ⚠️ **SUSPICIOUS ACTIVITY TRACKING**

### **`suspicious_login_count`** (Number, default: 0)
- **Tác dụng**: Đếm các lần đăng nhập "lạ" 
- **Triggers**:
  - IP từ quốc gia khác
  - Thiết bị chưa từng dùng
  - Login vào giờ lạ (3AM)
  - Nhiều device cùng lúc
- **Threshold**: ≥ 3 → cần admin review

### **`last_suspicious_ip`** (String)
- **Tác dụng**: Lưu IP đáng ngờ gần nhất
- **Admin action**: Có thể block IP này
- **Evidence**: Khi report với police về hack

---

## 📊 **USE CASES THỰC TẾ**

### **🔍 Admin Dashboard Queries:**
```javascript
// Tài khoản đa thiết bị
db.accounts.find({ $expr: { $gte: [{ $size: "$refresh_tokens" }, 3] } })

// Đăng nhập đáng ngờ
db.accounts.find({ suspicious_login_count: { $gte: 2 } })

// Tài khoản bị brute force  
db.accounts.find({ login_attempts: { $gte: 3 } })

// User không hoạt động
db.accounts.find({ 
  last_login_at: { $lt: new Date(Date.now() - 30*24*60*60*1000) } 
})
```

### **🚀 Business Logic:**
```javascript
// Cleanup tokens hết hạn
account.refresh_tokens = account.refresh_tokens.filter(
  token => new Date() < token.expires_at
);

// Giới hạn thiết bị (max 5 user, 2 admin)
if (account.refresh_tokens.length >= maxDevices) {
  // Xóa token cũ nhất
  account.refresh_tokens.sort((a, b) => a.last_used - b.last_used);
  account.refresh_tokens.shift();
}

// Phát hiện login lạ
if (currentIP !== account.last_login_ip) {
  account.suspicious_login_count++;
  sendSecurityAlert(account.email, currentIP);
}
```

### **📧 Security Alerts:**
- "Tài khoản đăng nhập từ thiết bị mới: Chrome/Linux"
- "Phát hiện login từ IP lạ: 1.2.3.4 (Singapore)"  
- "Tài khoản bị thử đăng nhập sai 2/3 lần"
- "5 thiết bị đang đăng nhập cùng lúc"

---

## 🎯 **KẾT LUẬN**

Mỗi field đều có mục đích bảo mật cụ thể:
- **Phòng thủ**: Chống brute force, multi-device abuse
- **Phát hiện**: Suspicious activity, compromised accounts  
- **Audit**: Theo dõi đầy đủ user activity
- **Quản lý**: Admin có thể can thiệp khi cần

**→ Từ authentication đơn giản thành enterprise security system!** 🛡️
