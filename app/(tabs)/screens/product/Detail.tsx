import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from '@react-navigation/native';
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
  // stock: number;
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
  size: string; // 👉 đổi từ number → string
  price_increase: number;
}


interface RouteParams {
  id: string;
}

type RootStackParamList = {
  Checkout: undefined;
  Review: { productId: string };
};

const Detail: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  // const { id } = route.params as RouteParams;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [sizes, setSizes] = useState<Size[]>([]);

  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `${BASE_URL}/productsandcategoryid`;


//   const sizeOptions = [
//   { label: '13x6cm (mini)', value: 1 },
//   { label: '17x8cm (nhỏ)', value: 2 },
//   { label: '21x8cm (vừa)', value: 3 },
//    { label: '100g (nhỏ)', value: 4 },
//     { label: '200g (vừa)', value: 5 },
//      { label: '500g (lớn)', value: 6 },
// ];


  useEffect(() => {
 fetchData()
    fetchProductDetails();
    fetchsize();
  }, []);


     const fetchData = async () => {
    const user = await getUserData('userData');
    if (user) {
      console.log('User ID-Details:', user);
    }
  };
  
 useEffect(() => {
  if (product) {
    let basePrice = product.discount_price || product.price;

  const sizeData = sizes.find(s => s.size === selectedSize);


    if (sizeData) {
      basePrice += sizeData.price_increase * 1000; // vì price_increase là đơn vị ngàn
    }

    setTotalPrice(quantity * basePrice);
  }
}, [quantity, product, selectedSize, sizes]);




  const fetchsize=async ()=>{
    try{
      setLoading(true);
      setError(null);
       const dateSize = await axios.get(`${BASE_URL}/sizes`);
        console.log('API response dateSize:', dateSize.data);
      let size = [];
      if (Array.isArray(dateSize.data)) {
        size = dateSize.data;
      } else if (Array.isArray(dateSize.data.data)) {
        size = dateSize.data.data;
      } else {
        throw new Error('Unexpected response format');
      }
       const id = await getUserData('productID');
      console.log("productID lấy ra1:", id);
     const foundSizes = size.filter((item: Size) => item.Product_id === id);
      setSizes(foundSizes);

           if (foundSizes) {
        console.log("foundSize lấy ra ID:", foundSizes);
        setProduct(foundSizes);
      } else {
        setError('Không tìm thấy sản phẩm');
      }
    }catch(err){
      console.log(err)
    }


  }


  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(baseUrl);
      console.log('API response orderDetails:', response.data);
      
      let products = [];
      if (Array.isArray(response.data)) {
        products = response.data;
      } else if (Array.isArray(response.data.data)) {
        products = response.data.data;
      } else {
        throw new Error('Unexpected response format');
      }
     const id = await getUserData('productID');
      console.log("productID lấy ra:", id);
      
      const foundProduct = products.find((item: Product) => item._id === id,)
      
      if (foundProduct) {
        console.log("Id lấy ra:", foundProduct._id);
        setProduct(foundProduct);
      } else {
        setError('Không tìm thấy sản phẩm');
      }
    } catch (err) {
      console.error('API error:', err);
      setError('Lỗi khi tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

const incrementQuantity = () => {
  const sizeData = sizes.find(s => {
    const label = s.size || `Không xác định`;
    return label === selectedSize;
  });
  if (sizeData && quantity < sizeData.quantity) {
    setQuantity(prev => prev + 1);
  } else {
    Alert.alert('Thông báo', 'Không đủ hàng trong kho hoặc chưa chọn size');
  }
};

const decrementQuantity = () => {
  if (quantity > 0) {
    setQuantity(prev => prev - 1);
  }
};


const handleAddToCart = () => {
  if (quantity === 0) {
    Alert.alert('Thông báo', 'Vui lòng chọn số lượng sản phẩm');
    return;
  }

  // Tìm size đã chọn
 const sizeData = sizes.find(s => s.size === selectedSize);

  // Log toàn bộ dữ liệu
  console.log("=== DỮ LIỆU ĐÃ RENDER ===");
  console.log("Product:", product);
  console.log("Selected Size:", selectedSize);
  console.log("Size Data:", sizeData);
  console.log("Quantity:", quantity);
  console.log("Total Price:", totalPrice);

  Alert.alert(
    'Thêm vào giỏ hàng',
    `Đã thêm ${quantity} ${product?.name} (size ${selectedSize || "M"}) vào giỏ hàng với tổng giá ${formatPrice(totalPrice)}đ`,
    [{ text: 'OK' }]
  );
};


  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
    Alert.alert(
      'Thông báo',
      isFavorite ? "Đã xóa khỏi yêu thích!" : "Đã thêm vào danh sách yêu thích!"
    );
  };

  const formatPrice = (value: number): string => {
    return value.toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.SafeAreaView}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6B4F35" />
          <Text style={{marginTop: 10}}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.SafeAreaView}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchProductDetails}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.SafeAreaView}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Không có dữ liệu sản phẩm</Text>
        </View>
      </SafeAreaView>
    );
  }

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