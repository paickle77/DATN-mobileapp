import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from "react";
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
import detailService, { Product, ReviewSummary, Size } from "../../services/DetailService";
import { getUserData } from "../utils/storage";

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Checkout: undefined;
  Review: { productId: string };
  Cart: undefined;
  comment: { productId: string };
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
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
    averageRating: 0,
    totalReviews: 0,
    reviews: []
  });
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  const HandleNavigatetocomment=(ProductID :String)=>{

  }


  const [notification, setNotification] = useState({
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    visible: false,
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type, visible: true });
  };

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [quantity, product, selectedSize, sizes]);

  // Refresh review data when screen comes into focus (after review submission)
  useFocusEffect(
    useCallback(() => {
      const refreshReviews = async () => {
        const productId = await getUserData('productID');
        if (productId && reviewsLoaded) {
          console.log('🔄 Product Detail focused - refreshing review data...');
          fetchReviewSummary(productId);
        }
      };
      refreshReviews();
    }, [reviewsLoaded])
  );

  const initializeData = async () => {
    try {
      setLoading(true);
      const productId = await getUserData('productID');
      
      if (!productId) {
        setError('Không tìm thấy ID sản phẩm');
        return;
      }

      // Load product, sizes, favorite status ngay lập tức
      await Promise.all([
        fetchProductDetails(productId),
        fetchSizes(productId),
        checkFavoriteStatus(productId),
      ]);

      // Load review summary sau (lazy loading)
      setTimeout(() => {
        fetchReviewSummary(productId);
      }, 500);
      
    } catch (err) {
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (productId: string) => {
    try {
      const productData = await detailService.getProductDetails(productId);
      if (productData) {
        setProduct(productData);
      } else {
        setError('Không tìm thấy sản phẩm');
      }
    } catch (error) {
      setError('Lỗi khi tải dữ liệu sản phẩm');
      throw error;
    }
  };

  const fetchSizes = async (productId: string) => {
    try {
      const sizesData = await detailService.getProductSizes(productId);
      setSizes(sizesData);
    } catch (error) {
      console.error('Lỗi khi tải sizes:', error);
      // Không throw error để không làm crash app
    }
  };

  const checkFavoriteStatus = async (productId: string) => {
    try {
      const userId = await getUserData('userData');
      if (!userId) return;
      
      const favoriteStatus = await detailService.checkFavoriteStatus(userId, productId);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái yêu thích:', error);
      setIsFavorite(false);
    }
  };

  const fetchReviewSummary = async (productId: string) => {
    try {
      const summary = await detailService.getReviewSummary(productId);
      setReviewSummary(summary);
      setReviewsLoaded(true);
    } catch (error) {
      console.error('Lỗi khi tải tóm tắt đánh giá:', error);
      setReviewsLoaded(true);
    }
  };

  const toggleFavorite = async () => {
    try {
      const userId = await getUserData('userData');
      const productId = await getUserData('productID');
      
      if (!userId || !productId) {
        showNotification('Không thể xác định thông tin người dùng', 'error');
        return;
      }

      const result = await detailService.toggleFavorite(userId, productId);
      
      setIsFavorite(result.isAdded);
      showNotification(
        result.isAdded 
          ? 'Đã thêm vào danh sách yêu thích!' 
          : 'Đã xóa khỏi danh sách yêu thích!',
        result.isAdded ? 'success' : 'info'
      );
    } catch (error) {
      showNotification('Không thể cập nhật danh sách yêu thích.', 'error');
    }
  };

  const calculateTotalPrice = () => {
    if (!product) return;
    
    let basePrice = product.discount_price || product.price;
    const sizeData = sizes.find(s => s.size === selectedSize);
    if (sizeData) {
      basePrice += sizeData.price_increase ;
    }
    setTotalPrice(quantity * basePrice);
  };

  const incrementQuantity = () => {
    const sizeData = sizes.find(s => s.size === selectedSize);
    if (sizeData && quantity < sizeData.quantity) {
      setQuantity(q => q + 1);
    } else {
      showNotification('Không đủ hàng trong kho hoặc chưa chọn size', 'warning');
    }
  };

  const decrementQuantity = () => {
    if (quantity > 0) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCart = async () => {
    if (quantity === 0) {
      return showNotification('Vui lòng chọn số lượng sản phẩm', 'warning');
    }

    if (!selectedSize) {
      return showNotification('Vui lòng chọn size sản phẩm', 'warning');
    }

    try {
      const userId = await getUserData('accountId');
      const sizeData = sizes.find(s => s.size === selectedSize);
      
      if (!sizeData) {
        return showNotification('Vui lòng chọn size hợp lệ', 'error');
      }

      if (!product?._id || !userId) {
        return showNotification('Thông tin không hợp lệ', 'error');
      }

      const result = await detailService.handleAddToCart(
        userId,
        product._id,
        sizeData._id,
        quantity,
        sizeData.quantity
      );
      if (result.exceeded) {
        showNotification('Không thể thêm vào giỏ hàng. Số lượng trong giỏ hàng vượt quá số lượng trong kho.', 'error');
      } else {
if (result.exceeded) {
  showNotification(
    'Không thể thêm vào giỏ hàng. Số lượng trong giỏ hàng vượt quá số lượng trong kho.',
    'error'
  );

  // Giảm quantity về tồn kho tối đa
  const sizeData = sizes.find(s => s.size === selectedSize);
  if (sizeData) {
    setQuantity(sizeData.quantity); // gán về tồn kho hiện tại
  }
  return; // thoát hẳn, không chạy tiếp
}
 else {
          showNotification(
            `Đã thêm ${quantity} sản phẩm vào giỏ hàng`,
            'success'
          );
        }
      }
   

    } catch (error) {
      showNotification('Không thể thêm vào giỏ hàng. Vui lòng thử lại.', 'error');
    }
  };

  const formatPrice = (val: number) => val.toLocaleString("vi-VN");

  const renderStars = (rating: number, size: number = 14) => {
    return Array.from({ length: 5 }, (_, i) => {
      const isFilled = i + 1 <= rating;
      const isHalf = i + 0.5 <= rating && i + 1 > rating;
      
      return (
        <Ionicons
          key={i}
          name={isFilled ? 'star' : isHalf ? 'star-half' : 'star-outline'}
          size={size}
          color={isFilled || isHalf ? '#FFD700' : '#E0E0E0'}
          style={{ marginRight: 2 }}
        />
      );
    });
  };

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
        <TouchableOpacity style={styles.retryButton} onPress={initializeData}>
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
                <View style={styles.starsContainer}>
                  {renderStars(reviewSummary.averageRating)}
                </View>
                <Text style={styles.ratingText}>
                  {reviewSummary.averageRating > 0 ? reviewSummary.averageRating.toFixed(1) : '0.0'}
                </Text>
                <Text style={styles.reviewCount}>
                  ({reviewSummary.totalReviews})
                </Text>
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

          {/* Reviews Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="chatbubble-outline" size={20} color="#2196F3" /> Đánh giá sản phẩm
            </Text>
            <View style={styles.reviewSummaryContainer}>
              <View style={styles.ratingOverview}>
                <Text style={styles.averageRatingLarge}>
                  {reviewSummary.averageRating > 0 ? reviewSummary.averageRating.toFixed(1) : '0.0'}
                </Text>
                <View style={styles.starsContainerLarge}>
                  {renderStars(reviewSummary.averageRating, 16)}
                </View>
                <Text style={styles.totalReviewsText}>
                  {reviewSummary.totalReviews} đánh giá
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewAllReviewsButton}
                onPress={() => navigation.navigate('comment', { productId: product._id })}
              >
                <Text style={styles.viewAllReviewsText}>Xem tất cả</Text>
                <Ionicons name="chevron-forward" size={16} color="#2196F3" />
              </TouchableOpacity>
            </View>
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
                    +{formatPrice(s.price_increase )}đ
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
                adjustedPrice += sizeData.price_increase ;
              }
              return (
                <View style={styles.priceContainer}>
                  {product.discount_price ? (
                    <>
                      <Text style={styles.originalPrice}>
                        {(() => {
                          const sizeInfo = sizes.find(s => s.size === selectedSize);
                          const priceIncrease = sizeInfo ? sizeInfo.price_increase : 0;
                          const fullOriginalPrice = product.price + priceIncrease;
                          return `${formatPrice(fullOriginalPrice)}đ`;
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
    paddingBottom: 200,
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
    justifyContent: 'space-between',
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  cartButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  productInfoOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8F00',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#546E7A',
    textAlign: 'justify',
  },
 
  reviewSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingOverview: {
    flex: 1,
  },
  averageRatingLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF8F00',
    marginBottom: 4,
  },
  starsContainerLarge: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  totalReviewsText: {
    fontSize: 13,
    color: '#666',
  },
  viewAllReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  viewAllReviewsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginRight: 4,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  sizeButton: {
    minWidth: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
  },
  activeSizeButton: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  activeSizeText: {
    color: '#FF9800',
  },
  sizePrice: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  activeSizePrice: {
    color: '#FF9800',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  inStock: {
    color: '#4CAF50',
  },
  outOfStock: {
    color: '#F44336',
  },
  noSelection: {
    color: '#FF9800',
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
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  bottomFixedSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Safe area for iPhone
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  quantityTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantitySection: {
    flex: 1,
    marginRight: 20,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  quantityControls: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'flex-start',     // tự ôm chiều ngang nội dung
  backgroundColor: '#dfd6d6ff',
  borderRadius: 25,
  paddingHorizontal: 6,        // nhỏ lại padding ngang
  paddingVertical: 4,
},
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    shadowOpacity: 0,
    elevation: 0,
  },
  quantityDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  totalSection: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewButton: {
    flex: 0.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  addToCartButton: {
    flex: 0.7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
export default Detail;
