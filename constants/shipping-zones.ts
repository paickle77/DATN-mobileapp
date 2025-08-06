// Định nghĩa các quận/huyện nội thành và ngoại thành Hà Nội
export const HANOI_INNER_DISTRICTS = [
  // Các quận trung tâm - Nội thành
  'Quận Ba Đình',
  'Quận Hoàn Kiếm', 
  'Quận Tây Hồ',
  'Quận Long Biên',
  'Quận Cầu Giấy',
  'Quận Đống Đa',
  'Quận Hai Bà Trưng',
  'Quận Hoàng Mai',
  'Quận Thanh Xuân',
  'Quận Nam Từ Liêm',
  'Quận Bắc Từ Liêm',
  'Quận Hà Đông',
];

export const HANOI_OUTER_DISTRICTS = [
  // Các huyện ngoại thành
  'Huyện Sóc Sơn',
  'Huyện Đông Anh',
  'Huyện Gia Lâm',
  'Huyện Thanh Trì',
  'Huyện Mê Linh',
  'Thị xã Sơn Tây',
  'Huyện Ba Vì',
  'Huyện Phúc Thọ',
  'Huyện Đan Phượng',
  'Huyện Hoài Đức',
  'Huyện Quốc Oai',
  'Huyện Thạch Thất',
  'Huyện Chương Mỹ',
  'Huyện Thanh Oai',
  'Huyện Thường Tín',
  'Huyện Phú Xuyên',
  'Huyện Ứng Hòa',
  'Huyện Mỹ Đức',
];

// Hàm kiểm tra một quận/huyện thuộc nội thành hay ngoại thành
export const isInnerDistrict = (district: string): boolean => {
  return HANOI_INNER_DISTRICTS.includes(district);
};

export const isOuterDistrict = (district: string): boolean => {
  return HANOI_OUTER_DISTRICTS.includes(district);
};

// Hàm lấy loại khu vực
export const getDistrictType = (district: string): 'inner' | 'outer' | 'unknown' => {
  if (isInnerDistrict(district)) return 'inner';
  if (isOuterDistrict(district)) return 'outer';
  return 'unknown';
};

// Phương thức giao hàng được cập nhật
export const getShippingMethods = (districtType: 'inner' | 'outer' | 'unknown') => {
  const baseMethod = {
    id: 'store_pickup',
    name: 'Nhận tại cửa hàng',
    time: 'Ngay khi sẵn sàng',
    price: 0,
    description: 'Miễn phí - Bánh được giữ tươi trong tủ lạnh',
    icon: 'storefront-outline' as const
  };

  if (districtType === 'inner') {
    return [
      baseMethod,
      {
        id: 'inner_city',
        name: 'Giao hàng nội thành',
        time: 'Trong vòng 2-4 giờ',
        price: 35000,
        description: 'Dành cho các quận trung tâm Hà Nội',
        icon: 'bicycle-outline' as const
      },
      {
        id: 'express',
        name: 'Giao hàng hỏa tốc',
        time: 'Trong vòng 1-2 giờ',
        price: 65000,
        description: 'Ưu tiên giao nhanh - Chỉ nội thành',
        icon: 'flash-outline' as const
      }
    ];
  } else if (districtType === 'outer') {
    return [
      baseMethod,
      {
        id: 'outer_city',
        name: 'Giao hàng ngoại thành',
        time: 'Trong vòng 4-6 giờ',
        price: 55000,
        description: 'Dành cho các huyện ngoại thành Hà Nội',
        icon: 'car-outline' as const
      },
      {
        id: 'express',
        name: 'Giao hàng hỏa tốc',
        time: 'Trong vòng 2-3 giờ',
        price: 85000,
        description: 'Ưu tiên giao nhanh - Chỉ nội thành',
        icon: 'flash-outline' as const
      }
    ];
  } else {
    // Trường hợp không xác định được khu vực
    return [
      baseMethod,
      {
        id: 'standard',
        name: 'Giao hàng tiêu chuẩn',
        time: 'Trong vòng 4-6 giờ',
        price: 30000,
        description: 'Phí giao hàng tiêu chuẩn',
        icon: 'car-outline' as const
      }
    ];
  }
};