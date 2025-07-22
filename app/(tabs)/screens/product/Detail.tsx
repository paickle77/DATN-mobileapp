import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import NotificationComponent from "../../component/NotificationComponent";
import { BASE_URL } from "../../services/api";
import { getUserData } from "../utils/storage";


const { width, height } = Dimensions.get('window');

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
  Cart: undefined;
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

  const [notification, setNotification] = useState({
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    visible: false,
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type, visible: true });
  };


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
        showNotification('Đã xóa khỏi danh sách yêu thích!', 'info');
      } else {
        await axios.post(`${BASE_URL}/favorites`, { user_id: userID, product_id: id });
        setIsFavorite(true);
        showNotification('Đã thêm vào danh sách yêu thích!', 'success');
      }
    } catch (err) {
      showNotification('Không thể cập nhật danh sách yêu thích.', 'error');
    }
  };

  const incrementQuantity = () => {
    const sizeData = sizes.find(s => s.size === selectedSize);
    if (sizeData && quantity < sizeData.quantity) setQuantity(q => q + 1);
    else showNotification('Không đủ hàng trong kho hoặc chưa chọn size', 'warning');
  };

  const decrementQuantity = () => {
    if (quantity > 0) setQuantity(q => q - 1);
  };

  const handleAddToCart = async () => {
    if (quantity === 0) {
      return showNotification('Vui lòng chọn số lượng sản phẩm', 'warning');
    }

    try {
      const userID = await getUserData('userData');
      const sizeData = sizes.find(s => s.size === selectedSize);
      if (!sizeData) return showNotification('Vui lòng chọn size hợp lệ', 'error');

      const productID = product?._id;
      const sizeID = sizeData._id;

      const response = await axios.get(`${BASE_URL}/GetAllCarts`);
      const cartItems = response.data.data;

      const existingCartItem = cartItems.find((item: any) =>
        item.user_id === userID &&
        item.product_id?._id === productID &&
        item.size_id?._id === sizeID
      );

      if (existingCartItem) {
        const updatedQuantity = existingCartItem.quantity + quantity;
        await axios.put(`${BASE_URL}/carts/${existingCartItem._id}`, {
          quantity: updatedQuantity
        });

        showNotification(`Đã thêm ${quantity} sản phẩm. Tổng hiện tại: ${updatedQuantity} sản phẩm`, 'success');

      } else {
        await axios.post(`${BASE_URL}/addtocarts`, {
          user_id: userID,
          product_id: productID,
          size_id: sizeID,
          quantity: quantity
        });

        showNotification(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`, 'success');

      }

    } catch (error) {
      console.error('❌ Lỗi khi xử lý giỏ hàng:', error);
      showNotification('Không thể thêm vào giỏ hàng. Vui lòng thử lại.', 'error');
    }
  };

  const formatPrice = (val: number) => val.toLocaleString("vi-VN");

  if (loading) return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>Đang tải...</Text>
      </View>
    </SafeAreaView>
  );

  if (error || !product) return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>{error || 'Không có dữ liệu sản phẩm'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProductDetails}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <View style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={{ uri: product.image_url }}
          style={styles.imageBackground}
          imageStyle={styles.backgroundImage}
        >
          <View style={styles.imageOverlay} />

          {/* Header với gradient */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
              <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[styles.headerButton, styles.cartButton]}
                onPress={() => navigation.navigate('Cart')}
              >
                <Ionicons name="bag-outline" size={22} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={22}
                  color={isFavorite ? "#FF6B6B" : "#333"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Info Overlay */}
          <View style={styles.productInfoOverlay}>
            <Text style={styles.productTitle}>{product.name}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category_id?.name || 'Chưa phân loại'}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Description Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="document-text-outline" size={20} color="#8B4513" /> Mô tả sản phẩm
            </Text>
            <Text style={styles.description}>
              {product.description || 'Sản phẩm chất lượng cao, được làm từ những nguyên liệu tươi ngon nhất.'}
            </Text>
          </View>

          {/* Ingredients Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="leaf-outline" size={20} color="#4CAF50" /> Nguyên liệu
            </Text>
            <Text style={styles.ingredientText}>
              {product.ingredient_id.map(i => i.name).join(", ")}
            </Text>
          </View>

          {/* Size Selection Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="resize-outline" size={20} color="#FF9800" /> Kích thước
            </Text>
            <View style={styles.sizeContainer}>
              {sizes.map(s => (
                <TouchableOpacity
                  key={s._id}
                  style={[
                    styles.sizeButton,
                    selectedSize === s.size && styles.activeSizeButton,
                  ]}
                  onPress={() => setSelectedSize(s.size)}
                >
                  <Text style={[
                    styles.sizeText,
                    selectedSize === s.size && styles.activeSizeText
                  ]}>
                    {s.size}
                  </Text>
                  <Text style={[
                    styles.sizePrice,
                    selectedSize === s.size && styles.activeSizePrice
                  ]}>
                    +{formatPrice(s.price_increase * 1000)}đ
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stock Status */}
            <View style={styles.stockContainer}>
              <Ionicons
                name={(() => {
                  const sizeData = sizes.find(s => s.size === selectedSize);
                  if (!selectedSize) return 'help-circle-outline';
                  return sizeData && sizeData.quantity > 0 ? 'checkmark-circle' : 'close-circle';
                })()}
                size={20}
                color={(() => {
                  const sizeData = sizes.find(s => s.size === selectedSize);
                  if (!selectedSize) return '#FF9800';
                  return sizeData && sizeData.quantity > 0 ? '#4CAF50' : '#F44336';
                })()}
              />
              <Text style={[
                styles.stockText,
                (() => {
                  const sizeData = sizes.find(s => s.size === selectedSize);
                  if (!selectedSize) return styles.noSelection;
                  return sizeData && sizeData.quantity > 0 ? styles.inStock : styles.outOfStock;
                })()
              ]}>
                {(() => {
                  const sizeData = sizes.find(s => s.size === selectedSize);
                  if (!selectedSize) return 'Chưa chọn kích thước';
                  return sizeData
                    ? (sizeData.quantity > 0 ? `Còn ${sizeData.quantity} sản phẩm` : 'Hết hàng')
                    : 'Không tìm thấy size';
                })()}
              </Text>
            </View>
          </View>

          {/* Price Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="pricetag-outline" size={20} color="#E91E63" /> Giá bán
            </Text>
            {(() => {
              let basePrice = product.discount_price || product.price;
              let adjustedPrice = basePrice;
              const sizeData = sizes.find(s => s.size === selectedSize);

              if (sizeData) {
                adjustedPrice += sizeData.price_increase * 1000;
              }
              return (
                <View style={styles.priceContainer}>
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
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>GIẢM GIÁ</Text>
                      </View>
                    </>
                  ) : null}
                  <Text style={styles.currentPrice}>{formatPrice(adjustedPrice)}đ</Text>
                </View>
              );
            })()}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Fixed Section */}
      <View style={styles.bottomFixedSection}>
        {/* Quantity and Total Row */}
        <View style={styles.quantityTotalRow}>
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Số lượng</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity === 0 && styles.disabledButton]}
                onPress={decrementQuantity}
                disabled={quantity === 0}
              >
                <Ionicons name="remove" size={20} color={quantity === 0 ? "#ccc" : "#333"} />
              </TouchableOpacity>
              <Text style={styles.quantityDisplay}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={incrementQuantity}
              >
                <Ionicons name="add" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalPrice}>{formatPrice(totalPrice)}đ</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => navigation.navigate('comment', { productId: product._id })}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.reviewButtonText}>Đánh giá</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              {
                backgroundColor: (() => {
                  if (!selectedSize) return '#E0E0E0';
                  const sizeData = sizes.find(s => s.size === selectedSize);
                  return sizeData && sizeData.quantity > 0 ? '#8B4513' : '#E0E0E0';
                })()
              }
            ]}
            onPress={handleAddToCart}
            disabled={(() => {
              const sizeData = sizes.find(s => s.size === selectedSize);
              return !(sizeData && sizeData.quantity > 0);
            })()}
          >
            <Ionicons
              name="bag-add-outline"
              size={20}
              color={(() => {
                if (!selectedSize) return '#999';
                const sizeData = sizes.find(s => s.size === selectedSize);
                return sizeData && sizeData.quantity > 0 ? '#fff' : '#999';
              })()}
            />
            <Text style={[
              styles.addToCartText,
              {
                color: (() => {
                  if (!selectedSize) return '#999';
                  const sizeData = sizes.find(s => s.size === selectedSize);
                  return sizeData && sizeData.quantity > 0 ? '#fff' : '#999';
                })()
              }
            ]}>
              {(() => {
                if (!selectedSize) return 'CHỌN SIZE';
                const sizeData = sizes.find(s => s.size === selectedSize);
                return sizeData && sizeData.quantity > 0 ? 'THÊM VÀO GIỎ' : 'HẾT HÀNG';
              })()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {notification.visible && (
        <View style={{ position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center', zIndex: 999 }}>
          <NotificationComponent
            key={notification.message + notification.type}
            message={notification.message}
            type={notification.type}
            visible={notification.visible}
            onHide={() => setNotification(prev => ({ ...prev, visible: false }))}
            style={{ width: '90%' }}
          />
        </View>
      )}
    </View>

  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  SafeAreaView: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 200, // Space for fixed bottom section
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageBackground: {
    width: width,
    height: height * 0.5,
    justifyContent: 'flex-end',
  },
  backgroundImage: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  productInfoOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2C2C2C",
    marginBottom: 10,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F57F17",
  },
  categoryBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
  },
  contentSection: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#666",
  },
  ingredientText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4CAF50",
    fontWeight: "500",
  },
  sizeContainer: {
    flexDirection: "column",
    flexWrap: 'nowrap',
    gap: 12,
    marginBottom: 16,
  },
  sizeButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: width * 0.4,
    alignItems: 'center',
  },
  activeSizeButton: {
    backgroundColor: "#8B4513",
    borderColor: "#8B4513",
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  activeSizeText: {
    color: "#FFFFFF",
  },
  sizePrice: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  activeSizePrice: {
    color: "#FFFFFF",
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 14,
    fontWeight: "500",
  },
  noSelection: {
    color: "#FF9800",
  },
  inStock: {
    color: "#4CAF50",
  },
  outOfStock: {
    color: "#F44336",
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#E91E63",
  },
  bottomFixedSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  quantityTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantitySection: {
    flex: 1,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20, // Reduced from 25
    padding: 2, // Reduced padding
    alignSelf: 'flex-start', // Added to prevent stretching
  },
  quantityButton: {
    width: 32, // Reduced from 36
    height: 32, // Reduced from 36
    borderRadius: 16, // Adjusted accordingly
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#F0F0F0',
  },
  quantityDisplay: {
    fontSize: 16, // Reduced from 18
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16, // Reduced from 20
    minWidth: 24, // Reduced from 30
    textAlign: 'center',
  },
  totalSection: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8B4513',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  addToCartButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    color: '#666',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
export default Detail;