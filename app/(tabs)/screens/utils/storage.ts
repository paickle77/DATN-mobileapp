import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  value: string;
  key: string;
}

// Lưu thông tin người dùng
export const saveUserData = async (data: UserData) => {
  try {
    const jsonValue = JSON.stringify(data.value);
    await AsyncStorage.setItem(data.key, jsonValue);
  } catch (e) {
    console.error('❌ Lỗi khi lưu user data:', e);
  }
};

// ✅ Hàm xóa toàn bộ dữ liệu trong AsyncStorage
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('✅ Đã xóa toàn bộ AsyncStorage');
  } catch (e) {
    console.error('❌ Lỗi khi xóa toàn bộ AsyncStorage:', e);
  }
};

// Lấy thông tin người dùng theo key
export const getUserData = async (key: string): Promise<any | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Lỗi lấy user data:', e);
    return null;
  }
};

// ✅ Hàm xóa dữ liệu theo key cụ thể
export const removeUserDataByKey = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`✅ Đã xóa key: ${key}`);
  } catch (e) {
    console.error(`❌ Lỗi khi xóa key ${key}:`, e);
  }
};

// ✅ THÊM: Lấy tất cả thông tin user đã lưu
export const getAllUserData = async () => {
  try {
    const [
      accountId,
      profileId, 
      addressId,
      userRole,
      userEmail,
      userName,
      userPhone,
      authToken,
      fullUserData
    ] = await Promise.all([
      getUserData('accountId'),
      getUserData('profileId'),
      getUserData('addressId'), 
      getUserData('userRole'),
      getUserData('userEmail'),
      getUserData('userName'),
      getUserData('userPhone'),
      getUserData('authToken'),
      getUserData('fullUserData')
    ]);

    return {
      accountId,
      profileId,
      addressId,
      userRole,
      userEmail,
      userName,
      userPhone,
      authToken,
      fullUserData: fullUserData ? JSON.parse(fullUserData) : null
    };
  } catch (e) {
    console.error('Lỗi lấy all user data:', e);
    return null;
  }
};

// // ✅ THÊM: Xóa tất cả thông tin user
// export const clearAllUserData = async () => {
//   try {
//     await Promise.all([
//       clearUserData('accountId'),
//       clearUserData('profileId'),
//       clearUserData('addressId'),
//       clearUserData('userRole'),
//       clearUserData('userEmail'),
//       clearUserData('userName'),
//       clearUserData('userPhone'),
//       clearUserData('authToken'),
//       clearUserData('fullUserData'),

//       // 💥 THÊM các key liên quan đến giỏ hàng, voucher
//       clearUserData('selectedVoucher'),
//       clearUserData('selectedAddress'),
//       clearUserData('selectedPaymentMethod'),
//       clearUserData('discount_percent'),
//       clearUserData('userData'), // nếu bạn dùng key này cho _id
//       clearUserData('code'),     // key 'code' dùng trong loadVoucher()
//     ]);

//     console.log('✅ Đã xóa toàn bộ dữ liệu người dùng (bao gồm cả dữ liệu giỏ hàng & thanh toán)');
//   } catch (e) {
//     console.error('❌ Lỗi xóa all user data:', e);
//   }
// };


// ✅ THÊM: Kiểm tra user có đăng nhập không
export const isUserLoggedIn = async (): Promise<boolean> => {
  try {
    const accountId = await getUserData('accountId');
    const authToken = await getUserData('authToken');
    return !!(accountId && authToken);
  } catch (e) {
    console.error('Lỗi kiểm tra login status:', e);
    return false;
  }
};

// ✅ THÊM: Debug - In tất cả dữ liệu đã lưu
export const debugStoredData = async () => {
  try {
    console.log('🔍 === DEBUG: KIỂM TRA DỮ LIỆU ĐÃ LỮU ===');
    
    const accountId = await getUserData('accountId');
    const userId = await getUserData('userId');
    const addressId = await getUserData('addressId');
    const userRole = await getUserData('userRole');
    const userEmail = await getUserData('userEmail');
    const authToken = await getUserData('authToken');
    const fullUserData = await getUserData('fullUserData');

    console.log('📋 Account ID:', accountId);
    console.log('📋 User ID:', userId);
    console.log('📋 Address ID:', addressId);
    console.log('📋 User Role:', userRole);
    console.log('📋 User Email:', userEmail);
    console.log('📋 Auth Token:', authToken);
    console.log('📋 Full User Data:', fullUserData);
    
    console.log('🔍 === END DEBUG ===');
    
    return {
      accountId,
      userId,
      addressId,
      userRole,
      userEmail,
      authToken,
      fullUserData
    };
  } catch (e) {
    console.error('Lỗi debug stored data:', e);
    return null;
  }
};