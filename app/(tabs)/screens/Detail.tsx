import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Product {
  image: string;
  name: string;
  description: string;
  price: string;
  quantity: number; // Số lượng sản phẩm trong kho
}

interface Props {
  productId: string;
  onGoBack: () => void;
}

const ManCoffeeData: React.FC<Props> = ({ productId, onGoBack }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  // Dữ liệu cứng cho sản phẩm
  const hardcodedProduct: Product = {
  image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQYmdcip6B1qJY-P_fpuc1XzRhaNh52eOPsw&s", 
  name: "Tiramisu Việt Quất",
  description:"Bánh Tiramisu",
  price: "250.000đ",
    quantity: 10, // Giả sử có 10 sản phẩm trong kho
};


  useEffect(() => {
    // Giả lập delay load dữ liệu
    const timeout = setTimeout(() => {
      setProduct(hardcodedProduct);
      setLoading(false);
    }, 1000); // 1 giây delay

    return () => clearTimeout(timeout);
  }, []);

  
  
      const incrementQuantity = () => {
          setQuantity(prev => prev + 1);
          setPrice(prev => prev + 200000); // Giả sử mỗi lần tăng số lượng sẽ cộng thêm 200.000đ
      };
  
      const decrementQuantity = () => {
          if (quantity > 0) {
              setQuantity(prev => prev - 1);
                setPrice(prev => prev - 200000); // Giả sử mỗi lần giảm số lượng sẽ trừ đi 200.000đ
          }
      };
  if (loading) {
    return (
      <SafeAreaView style={styles.SafeAreaView}>
        <ActivityIndicator size="large" color="#ff7f50" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.SafeAreaView}>
        <Text style={styles.errorText}>Không có dữ liệu sản phẩm</Text>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    alert(
      `Đã thêm ${product.name} (size ${selectedSize || "M"}) vào giỏ hàng với giá ${product.price}`
    );
  };

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
    alert(
      isFavorite
        ? "Đã xóa khỏi yêu thích!"
        : "Đã thêm vào danh sách yêu thích!"
    );
  };

  const formatPrice = (value: number): string => {
    return value.toLocaleString("vi-VN");
};

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <ImageBackground
        source={{ uri: product.image }}
        style={styles.imageBackground}
      >
        <View style={styles.overlay} />
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoBack} style={styles.iconButton}>
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
            <Ionicons name="star" size={14} color="#FFD700" /> 4.5 (6,879)
          </Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ImageBackground>

      <View style={styles.bottomSection}>
        <Text style={styles.sectionTitle}>Mô tả</Text>
        <Text style={styles.fullDescription}>
          Bánh tiramisu việt quất không chỉ làm tăng thêm sự tươi mới cho bánh mà còn góp phần làm dịu đi độ béo ngậy của kem, mang lại cảm giác dễ chịu và lôi cuốn.
        </Text>
        <Text style={styles.sectionTitle}>Kích Thước</Text>
        <View style={styles.sizeContainer}>
          {["14 cm", "18 cm", "24 cm"].map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeButton,
                selectedSize === size ? styles.activeSize : null,
              ]}
              onPress={() => setSelectedSize(size)}
            >
              <Text style={styles.sizeText}>{size}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.detailRow}>
            <Text style={styles.sectionTitle}>Tình trạng: </Text>
            <Text style={styles.detailValuequantity}>{product.quantity ? `Còn ${product.quantity} sp` : 'Hết hàng'}</Text>
        </View>
        <View style={styles.quantityTotalContainer}>
                        <Text style={styles.textLabel}>Đã chọn {quantity} sản phẩm</Text>
                        <Text style={styles.textLabel}>Tạm tính</Text>
                    </View>

                    <View style={styles.quantityRow}>
                        <View style= {styles.quantityRow}>
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
                        <Text style={styles.totalPriceText}>{formatPrice(price)}đ</Text>

                        </View>
                    </View>

                    <TouchableOpacity
                    style={[
                        styles.buyButton, 
                        { 
                            backgroundColor: quantity > 0 ? '#28a745' : '#ccc',
                            opacity: quantity > 0 ? 1 : 0.5
                        }
                    ]}
                    disabled={quantity === 0}
                >
                    <Text style={styles.buyButtonText}>CHỌN MUA</Text>
                </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
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
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  rating: {
    fontSize: 14,
    color: "#f7ed00",
    marginVertical: 5,
  },
  description: {
    fontSize: 14,
    marginVertical: 5,
  },
  bottomSection: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  fullDescription: {
    fontSize: 14,
    marginVertical: 10,
  },
  sizeContainer: {
    flexDirection: "row",
    marginVertical: 10,
  },
  sizeButton: {
    backgroundColor: "#D9D9D9",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 35,
    marginRight: 20,
  },
  activeSize: {
    backgroundColor: "#ff7f50",
  },
  sizeText: {
    fontWeight: "bold",
  },
    detailRow: {
        flexDirection: "row",
        marginVertical: 10,
    },
    detailLabel: {
        fontSize: 18,
    fontWeight: "bold",
    },
    detailValuequantity: {
        fontSize: 18,
        color: "#000",
    },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addToCartButton: {
    backgroundColor: "#ff7f50",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  addToCartText: {
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    quantityButton: {
        width: 40,
        height: 40,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    quantityButtonText: {
        fontSize: 20,
        color: '#333',
    },
    quantityText: {
        fontSize: 18,
        marginHorizontal: 16,
    },
    totalPriceText: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 10,
        
    },
    quantityTotalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 10,
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
    buyButton: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartIcon: {
        width: 24,
        height: 24,
        tintColor: 'black', 
    },
});

export default ManCoffeeData;
