import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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

const { width } = Dimensions.get('window');

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SafeAreaView style={styles.SafeAreaView}>
        <ImageBackground
          source={{ uri: product.image_url }}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          <View style={styles.gradientOverlay} />
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={24} color="#2C3E50" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#E74C3C" : "#2C3E50"}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.productInfoOverlay}>
            <Text style={styles.title}>{product.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#F39C12" />
              <Text style={styles.rating}>{product.rating}</Text>
              <Text style={styles.categoryText}>• {product.category_id?.name || 'Chưa phân loại'}</Text>
            </View>
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
                  adjustedPrice += sizeData.price_increase * 1000;
                }

                return (
                  <View style={styles.priceRow}>
                    {product.discount_price ? (
                      <>
                        <Text style={styles.originalPrice}>
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
                        <Text style={styles.discountPrice}>
                          {formatPrice(adjustedPrice)}đ
                        </Text>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>SALE</Text>
                        </View>
                      </>
                    ) : (
                      <Text style={styles.regularPrice}>{formatPrice(adjustedPrice)}đ</Text>
                    )}
                  </View>
                );
              })()}
            </View>
          </View>

          {/* Quantity and Total */}
          <View style={styles.section}>
            <View style={styles.quantityHeader}>
              <Text style={styles.quantityLabel}>Số lượng</Text>
              <Text style={styles.totalLabel}>Tạm tính</Text>
            </View>

            <View style={styles.quantityRow}>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.quantityButton, quantity === 0 && styles.disabledButton]}
                  onPress={decrementQuantity}
                  disabled={quantity === 0}
                >
                  <Text style={[styles.quantityButtonText, quantity === 0 && styles.disabledButtonText]}>−</Text>
                </TouchableOpacity>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityText}>{quantity}</Text>
                </View>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={incrementQuantity}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.totalPrice}>{formatPrice(totalPrice)}đ</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.secondaryButton]}
              onPress={() => navigation.navigate('comment', { productId: product._id })}
            >
              <Text style={styles.reviewButtonText}>Xem đánh giá</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  SafeAreaView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imageBackground: {
    width: "100%",
    height: 450,
    justifyContent: "flex-end",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  iconButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfoOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 'auto',
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E50",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: "#F39C12",
    marginLeft: 5,
    fontWeight: "600",
  },
  categoryText: {
    fontSize: 16,
    color: "#7F8C8D",
    marginLeft: 5,
    fontWeight: "500",
  },
  contentContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5D6D7E",
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D4A574',
  },
  ingredientContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientChip: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  ingredientText: {
    color: '#27AE60',
    fontSize: 14,
    fontWeight: '600',
  },
  sizeContainer: {
    flexDirection: "row",
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 10,
  },
  sizeButton: {
    backgroundColor: "#ECF0F1",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#BDC3C7',
    minWidth: 110,
  },
  activeSizeButton: {
    backgroundColor: "#D4A574",
    borderColor: "#B8956A",
  },
  sizeText: {
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
    fontSize: 14,
  },
  activeSizeText: {
    color: "#fff",
  },
  stockText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  inStock: {
    color: "#27AE60",
  },
  outOfStock: {
    color: "#E74C3C",
  },
  priceContainer: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
    color: '#95A5A6',
    fontWeight: '500',
  },
  discountPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#E74C3C',
  },
  regularPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4A574',
  },
  discountBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  quantityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 15,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#95A5A6',
  },
  quantityDisplay: {
    minWidth: 50,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4A574',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  reviewButton: {
    flex: 1,
    backgroundColor: '#E8E6FF',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C5CE7',
  },
  addToCartButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  addToCartButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    color: '#E74C3C',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Detail;