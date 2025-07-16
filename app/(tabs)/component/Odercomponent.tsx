import { useNavigation } from 'expo-router';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Import TouchableOpacity and Alert

// Định nghĩa kiểu dữ liệu cho props của component
type OrderItemProps = {
  orderItem: {
    _id: string;
    bill_id: {
      _id: string; // Mã đơn hàng
      // Các trường khác của bill_id nếu cần, nhưng không dùng trong render này
    };
    product_id: {
      _id: string;
      name: string; // Tên sản phẩm
      price: number; // Giá tiền sản phẩm
      image_url: string; // Ảnh sản phẩm
      // Các trường khác của product_id
    };
    size: string; // Kích thước sản phẩm (lưu ý: dữ liệu mẫu của bạn có 'size' trực tiếp ở cấp ngoài, không phải trong product_id)
    quantity: number; // Số lượng
    price: number; // Giá tiền của mục (đã tính discount nếu có, hoặc giá gốc)
    total: number; // Tổng tiền của mục (quantity * price)
    // Các trường khác của orderItem nếu cần
  };
};

const OrderItemDetail: React.FC<OrderItemProps> = ({ orderItem }) => {
    const navigation = useNavigation();
  // Đảm bảo dữ liệu tồn tại trước khi truy cập
  if (!orderItem || !orderItem.bill_id || !orderItem.product_id) {
    return <Text style={styles.errorText}>Không có dữ liệu đơn hàng hợp lệ.</Text>;
  }

  const handleReviewPress = (ProductId) => {
    console.log('Đi tới đánh giá đơn:', ProductId);
    navigation.navigate('Review', { ProductId });
  };

  // Tính toán tổng giá dựa trên số lượng và giá của mục
  // Sử dụng orderItem.total nếu nó đã được tính toán đúng từ API
  const itemTotalPrice = orderItem.total || (orderItem.quantity * orderItem.price);

  const handleReviewProduct = () => {
    // Logic để điều hướng đến màn hình đánh giá sản phẩm cụ thể
    Alert.alert(
      'Đánh giá sản phẩm',
      `Bạn muốn đánh giá sản phẩm "${orderItem.product_id.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đánh giá ngay', onPress: () => handleReviewPress(orderItem.product_id._id) }
      ]
    );
    // Trong ứng dụng thực tế, bạn sẽ dùng navigation ở đây:
    // navigation.navigate('ProductReviewScreen', { productId: orderItem.product_id._id, productName: orderItem.product_id.name });
  };

  return (
    <View style={styles.container}>
      <View style={styles.productInfoRow}>
        {/* Ảnh sản phẩm */}
        {orderItem.product_id.image_url ? (
          <Image
            source={{ uri: orderItem.product_id.image_url }}
            style={styles.productImage}
            resizeMode="cover" // 'cover' thường phù hợp hơn cho ảnh sản phẩm
          />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}

        <View style={styles.details}>
          {/* Tên sản phẩm */}
          <Text style={styles.productName}>{orderItem.product_id.name}</Text>

          {/* Kích thước */}
          <Text style={styles.detailText}>Kích thước: <Text style={styles.detailValue}>{orderItem.size}</Text></Text>

          {/* Giá đơn vị */}
          <Text style={styles.detailText}>Giá đơn vị: <Text style={styles.detailValue}>{orderItem.product_id.price.toLocaleString('vi-VN')} VNĐ</Text></Text>

          {/* Số lượng */}
          <Text style={styles.detailText}>Số lượng: <Text style={styles.detailValue}>{orderItem.quantity}</Text></Text>
        </View>
      </View>

      <View style={styles.priceReviewContainer}>
        {/* Tổng tiền mục */}
        <Text style={styles.itemTotalPrice}>Tổng cộng: <Text style={styles.itemTotalAmount}>{itemTotalPrice.toLocaleString('vi-VN')} VNĐ</Text></Text>

        {/* Nút đánh giá */}
        <TouchableOpacity style={styles.reviewButton} onPress={handleReviewProduct}>
          <Text style={styles.reviewButtonText}>Đánh giá sản phẩm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10, // Adjusted for better spacing on `OderDetails` screen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // More pronounced shadow
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6, // Android shadow
    borderWidth: 1, // Subtle border
    borderColor: '#e0e0e0',
  },
  productInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // Light separator
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 15,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  noImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  noImageText: {
    fontSize: 12,
    color: '#888',
  },
  details: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700', // Bolder font
    color: '#2c3e50', // Darker text for prominence
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#7f8c8d', // Softer color for details
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: '600', // Make values slightly bolder
    color: '#34495e',
  },
  priceReviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  itemTotalPrice: {
    fontSize: 15,
    color: '#34495e',
    fontWeight: '600',
  },
  itemTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60', // Green for total amount
  },
  reviewButton: {
    backgroundColor: '#3498db', // Blue for action button
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  reviewButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c', // Red for error
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default OrderItemDetail;