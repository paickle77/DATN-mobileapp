import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { BASE_URL } from "../../services/api";
import { getUserData } from "../utils/storage";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number;
  image_url: string;
  rating: number;
  is_active: boolean;
  category_id: {
    _id: string;
    name: string;
  };
  ingredient_id: {
    _id: string;
    name: string;
  };
}

interface Size {
  _id: string;
  Product_id: string;
  quantity: number;
  size: string;
  price_increase: number;
}

type RootStackParamList = {
  Checkout: undefined;
  Review: { productId: string };
};

const Detail: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [product, setProduct] = useState<Product | null>(null);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProductDetails();
    fetchSizes();
    checkFavoriteStatus();
  }, []);

  useEffect(() => {
    if (product) {
      let basePrice = product.discount_price || product.price;
      const sizeData = sizes.find(s => s.size === selectedSize);
      if (sizeData) basePrice += sizeData.price_increase * 1000;
      setTotalPrice(quantity * basePrice);
    }
  }, [quantity, product, selectedSize, sizes]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/productsandcategoryid`);
      const id = await getUserData('productID');
      const products = res.data.data || res.data;
      const found = products.find((item: Product) => item._id === id);
      if (found) setProduct(found);
      else setError('Không tìm thấy sản phẩm');
    } catch (err) {
      setError('Lỗi khi tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchSizes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/sizes`);
      const id = await getUserData('productID');
      const allSizes = res.data.data || res.data;
      const foundSizes = allSizes.filter((s: Size) => s.Product_id === id);
      setSizes(foundSizes);
    } catch (err) {
      console.error(err);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/favorites2`);
      const format = res.data.data;
      const userID = await getUserData('userData');
      const productID = await getUserData('productID');
      const found = format.find(item => item.user_id === userID && item.product_id?._id === productID);
      setIsFavorite(!!found);
    } catch (err) {
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/favorites2`);
      const data = res.data.data;
      const userID = await getUserData('userData');
      const id = await getUserData('productID');
      const found = data.find(item => item.user_id === userID && item.product_id?._id === id);
      if (found) {
        await axios.delete(`${BASE_URL}/favorites/${found._id}`);
        setIsFavorite(false);
        Alert.alert('Thông báo', 'Đã xóa khỏi danh sách yêu thích!');
      } else {
        await axios.post(`${BASE_URL}/favorites`, { user_id: userID, product_id: id });
        setIsFavorite(true);
        Alert.alert('Thành công', 'Đã thêm vào danh sách yêu thích!');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích.');
    }
  };

  const incrementQuantity = () => {
    const sizeData = sizes.find(s => s.size === selectedSize);
    if (sizeData && quantity < sizeData.quantity) setQuantity(q => q + 1);
    else Alert.alert('Thông báo', 'Không đủ hàng trong kho hoặc chưa chọn size');
  };

  const decrementQuantity = () => {
    if (quantity > 0) setQuantity(q => q - 1);
  };

const handleAddToCart = async () => {
  if (quantity === 0) {
    return Alert.alert('Thông báo', 'Vui lòng chọn số lượng sản phẩm');
  }

  try {
    const userID = await getUserData('userData');
    const sizeData = sizes.find(s => s.size === selectedSize);
    if (!sizeData) return Alert.alert('Lỗi', 'Vui lòng chọn size hợp lệ');

    const productID = product?._id;
    const sizeID = sizeData._id;

    // 1. Lấy toàn bộ giỏ hàng
    const response = await axios.get(`${BASE_URL}/GetAllCarts`);
    const cartItems = response.data.data;
    console.log("response: ", cartItems);

    // 2. Kiểm tra trùng user_id + product_id + size_id
    const existingCartItem = cartItems.find((item: any) =>
      item.user_id === userID &&
      item.product_id?._id === productID &&
      item.size_id?._id === sizeID
    );

    if (existingCartItem) {
      // 3. Nếu đã có → Gọi PUT để tăng số lượng
      const updatedQuantity = existingCartItem.quantity + quantity;
      await axios.put(`${BASE_URL}/carts/${existingCartItem._id}`, {
        quantity: updatedQuantity
      });

      Alert.alert(
        'Đã cập nhật giỏ hàng',
        `Số lượng mới: ${updatedQuantity} sản phẩm ${product?.name} (size ${selectedSize})`
      );
    } else {
      // 4. Nếu chưa có → Gọi POST để thêm mới
      await axios.post(`${BASE_URL}/addtocarts`, {
        user_id: userID,
        product_id: productID,
        size_id: sizeID,
        quantity: quantity
      });

      Alert.alert(
        'Đã thêm vào giỏ hàng',
        `${quantity} ${product?.name} (size ${selectedSize}) với tổng giá ${formatPrice(totalPrice)}đ`
      );
    }

  } catch (error) {
    console.error('❌ Lỗi khi xử lý giỏ hàng:', error);
    Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
  }
};


  const formatPrice = (val: number) => val.toLocaleString("vi-VN");

  if (loading) return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6B4F35" />
        <Text style={{ marginTop: 10 }}>Đang tải...</Text>
      </View>
    </SafeAreaView>
  );

  if (error || !product) return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Không có dữ liệu sản phẩm'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProductDetails}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );


  return (
    <ScrollView>
      <SafeAreaView style={styles.SafeAreaView}>
        <ImageBackground
          source={{ uri: product.image_url }}
          style={styles.imageBackground}
        >
          <View style={styles.overlay} />
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={24} color="#1e1e1e" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "red" : "#000"}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.topSection}>
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.rating}>
              <Ionicons name="star" size={14} color="#FFD700" /> {product.rating} 
            </Text>
            <Text style={styles.categoryText}>Loại: {product.category_id?.name || 'Chưa phân loại'}</Text>
          </View>
        </ImageBackground>

        <View style={styles.bottomSection}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.fullDescription}>
            {product.description || 'Sản phẩm chất lượng cao, được làm từ những nguyên liệu tươi ngon nhất.'}
          </Text>
  <Text style={styles.sectionTitle}>
  Nguyên Liệu: {product.ingredient_id.map(i => i.name).join(", ")}
</Text>


          <Text style={styles.sectionTitle}>Kích Thước</Text>
 <View style={styles.sizeContainer}>
  {sizes.map(s => (
    <TouchableOpacity
      key={s._id}
      style={[
        styles.sizeButton,
        selectedSize === s.size ? styles.activeSize : null,
      ]}
      onPress={() => setSelectedSize(s.size)}
    >
      <Text style={[
        styles.sizeText,
        selectedSize === s.size ? styles.activeSizeText : null
      ]}>
        {s.size}
      </Text>
    </TouchableOpacity>
  ))}
</View>
   
<Text style={[
  styles.detailValuequantity,
  (() => {
   const sizeData = sizes.find(s => s.size === selectedSize);
 return sizeData && sizeData.quantity > 0 ? styles.inStock : styles.outOfStock;
  })()
]}>
  {(() => {
   const sizeData = sizes.find(s => s.size === selectedSize);

    if (!selectedSize) return 'Chưa chọn kích thước';
    return sizeData
      ? (sizeData.quantity > 0 ? `Còn ${sizeData.quantity} sp` : 'Hết hàng')
      : 'Không tìm thấy size';
  })()}
</Text>

          <View style={styles.priceRow}>
            <Text style={styles.sectionTitle}>Giá: </Text>
            {(() => {
              let basePrice = product.discount_price || product.price;
              let adjustedPrice = basePrice;


               const sizeData = sizes.find(s => s.size === selectedSize);

              
              if (sizeData) {
                adjustedPrice += sizeData.price_increase * 1000; // nếu đơn vị là ngàn
                console.log("price_increase: ", sizeData.price_increase);
              }
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {product.discount_price ? (
                    <>
                      <Text style={[styles.priceValue, { textDecorationLine: 'line-through', color: '#999', marginRight: 10 }]}>
                        {(() => {
                          let basePrice = product.price;
                          if (selectedSize === "17x8cm (nhỏ)") {
                            basePrice += 60000;
                          } else if (selectedSize === "21x8cm (vừa)") {
                            basePrice += 90000;
                          }
                          return `${formatPrice(basePrice)}đ`;
                        })()}
                      </Text>
                      <Text style={[styles.priceValue, { color: '#E53935' }]}>
                        {formatPrice(adjustedPrice)}đ
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.priceValue}>{formatPrice(adjustedPrice)}đ</Text>
                  )}
                </View>
              );
            })()}
          </View>
          <View style={styles.quantityTotalContainer}>
            <Text style={styles.textLabel}>Đã chọn {quantity} sản phẩm</Text>
            <Text style={styles.textLabel}>Tạm tính</Text>
          </View>

          <View style={styles.quantityRow}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={decrementQuantity}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={incrementQuantity}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.totalPriceText}>{formatPrice(totalPrice)}đ</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.secondaryButton]}
              onPress={() => navigation.navigate('Review', { productId: product._id })}
            >
              <Text style={styles.secondaryButtonText}>Xem đánh giá</Text>
            </TouchableOpacity>
<TouchableOpacity
  style={[
    styles.buyButton,
    {
      backgroundColor: (() => {
        if (!selectedSize) return '#ccc';
       const sizeData = sizes.find(s => s.size === selectedSize);

        return sizeData && sizeData.quantity > 0 ? '#6B4F35' : '#ccc';
      })()
    }
  ]}
  onPress={handleAddToCart}
  disabled={(() => {
const sizeData = sizes.find(s => s.size === selectedSize);

    return !(sizeData && sizeData.quantity > 0);
  })()}
>
  <Text style={styles.buyButtonText}>
    {(() => {
      if (!selectedSize) return 'CHỌN KÍCH THƯỚC';
const sizeData = sizes.find(s => s.size === selectedSize);

      return sizeData && sizeData.quantity > 0 ? 'CHỌN MUA' : 'HẾT HÀNG';
    })()}
  </Text>
</TouchableOpacity>

          </View>

        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageBackground: {
    width: "100%",
    height: 430,
    justifyContent: "flex-end",
  },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 1,
  },
  iconButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
  },
  topSection: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  rating: {
    fontSize: 16,
    color: "#e1aa01",
    marginVertical: 5,
    fontWeight: "bold",
  },
  categoryText: {
    fontSize: 16,
    color: "#666",
    marginVertical: 5,
  },
  bottomSection: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  fullDescription: {
    fontSize: 14,
    marginVertical: 10,
    color: "#666",
    lineHeight: 20,
  },
  sizeContainer: {
    flexDirection: "row",
    marginVertical: 5,
  },
  sizeButton: {
    backgroundColor: "#D9D9D9",
    borderRadius: 20,
    paddingVertical: 10,
    marginRight: 10,
    width: 120,
  },
  activeSize: {
    backgroundColor: "#6B4F35",
  },
  sizeText: {
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  activeSizeText: {
    color: "#fff",
  },
  detailRow: {
    flexDirection: "row",
    marginVertical: 10,
    alignItems: "center",
  },
  detailValuequantity: {
    fontSize: 16,
    fontWeight: "500",
  },
  inStock: {
    color: "#4CAF50",
  },
  outOfStock: {
    color: "#F44336",
  },
  priceRow: {
    flexDirection: "row",
    marginVertical: 10,
    alignItems: "center",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6B4F35",
  },
  quantityTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 20,
  },
  textLabel: {
    fontSize: 17,
    color: '#666',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  totalPriceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4F35',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#ddd',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 5,
  },

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#6B4F35',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 5,
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6B4F35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Detail;