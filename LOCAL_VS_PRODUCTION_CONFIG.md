# 🔧 Local Development vs Production Configuration

## 🏠 **LOCAL DEVELOPMENT** (`NODE_ENV=development`)

### Token Duration:
- **Access Token**: 24h (cả admin và user)
- **Refresh Token**: Admin 7 ngày, User 30 ngày

### Security Measures:
- ✅ **NO** IP whitelist checking
- ✅ **NO** login attempt limits 
- ✅ **NO** account locking
- ✅ **NO** suspicious activity tracking
- ✅ **10 devices** cho cả admin và user

### Benefits:
- Không bị logout liên tục khi code
- Không lo IP thay đổi
- Test được trên nhiều thiết bị/browser
- Không bị khóa tài khoản khi nhập sai

---

## 🏢 **PRODUCTION** (`NODE_ENV=production`)

### Token Duration:
- **Access Token**: Admin 2h, User 8h  
- **Refresh Token**: Admin 1 ngày, User 7 ngày

### Security Measures:
- 🔒 **Admin IP whitelist** required
- 🔒 **Login limits**: Admin 3 tries, User 5 tries
- 🔒 **Account locking**: Admin 30min, User 15min
- 🔒 **Suspicious tracking** enabled
- 🔒 **Device limits**: Admin 2, User 5

### Benefits:
- Bảo mật cao cho production
- Phát hiện tấn công sớm
- Audit trail đầy đủ
- Compliance với security standards

---

## 🚀 **Khi nào switch sang Production mode:**

```bash
# Trong .env file
NODE_ENV=production
```

### Cần chuẩn bị:
1. **IP Whitelist** cho admin accounts
2. **Monitoring dashboard** để track security events
3. **Alert system** cho suspicious activities
4. **Backup plan** cho locked accounts

---

## 💡 **Tip cho Development:**

### Nếu muốn test production security locally:
```bash
NODE_ENV=production_test
```

Rồi thêm condition:
```javascript
const isProdTest = process.env.NODE_ENV === 'production_test';
// Apply production rules but với settings nhẹ hơn
```

### Test credentials suggestion:
```
Admin: admin@test.com / admin123
User: user@test.com / user123  
```

**Kết luận**: Hiện tại cấu hình development-friendly, khi deploy production sẽ tự động apply security nghiêm ngặt! 🛡️
