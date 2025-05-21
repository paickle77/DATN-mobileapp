import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import CategoryItem from '../(tabs)/component/category';
import TabLayout from '../(tabs)/component/tabbar';
import EventItem from '../(tabs)/component/Event';
import HotItem from './component/hotcake';
import logo from '../../assets/images/logo.png';
import banner from '../../assets/images/banner.png';
import banner2 from '../../assets/images/banner2.png';





const hotItems = [
  {
    name: "Bánh su kem Pháp",
    description: "Bánh su kem mềm mịn với lớp vỏ mỏng và nhân kem vani thơm béo đặc trưng kiểu Pháp.",
    image: "https://daynghebanh.vn/wp-content/uploads/2018/10/banh-su-kem-choux-a-la-creme-phat-minh-quan-trong-cua-lang-banh-ngot-phap-1-1.jpg"
  },
  {
    name: "Bánh mousse socola",
    description: "Bánh mousse socola mát lạnh, tan ngay trong miệng, lớp nền là bạt bánh mềm mịn.",
    image: "https://daylambanh.edu.vn/wp-content/uploads/2017/09/cach-lam-banh-mousse-chocolate-600x398.jpg"
  },
  {
    name: "Bánh kem matcha",
    description: "Bánh kem vị trà xanh thơm mát, trang trí đơn giản nhưng tinh tế, phù hợp mọi dịp lễ.",
    image: "https://savourebakery.com/storage/images/san-pham/Banh-tra-xanh-dau-do/Banh-Kem-Tra-Xanh-2.jpg"
  },
  {
    name: "Bánh bông lan trứng muối",
    description: "Lớp bánh bông lan mềm xốp kết hợp với trứng muối mặn mặn và chà bông hấp dẫn.",
    image: "https://www.cet.edu.vn/wp-content/uploads/2019/11/banh-bong-lan-trung-muoi.jpg"
  },
  {
    name: "Bánh tart trứng Hong Kong",
    description: "Lớp vỏ tart giòn tan hòa quyện cùng nhân trứng ngọt béo, đúng chuẩn vị Hong Kong.",
    image: "https://cdn.tgdd.vn/Files/2015/03/23/624011/cach-lam-banh-tart-trung-banh-trung-kfc-egg-tart-hong-kong-7.jpg"
  },
  {
    name: "Bánh tiramisu Ý",
    description: "Bánh tiramisu truyền thống với lớp kem mascarpone, cà phê espresso và cacao đậm vị.",
    image: "https://daotaobeptruong.vn/wp-content/uploads/2020/11/banh-tiramisu.jpg"
  }
];



const images = [logo, banner, banner2];

const event = [
  {
    id: 'ev1',
    name: 'Sale off 10% với mỗi sản phẩm',
    description: 'tất cả sản phẩm sẽ được giảm 10% khi bạn áp mã giảm giá...',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStbtLaa6aLWogpLtbls8Kvfy83iGrkLJwMyQ&s',
  },
  {
    id: 'ev2',
    name: 'Sale off 20% với loại bánh trứng muối',
    description: 'tất cả sản phẩm sẽ được giảm 10% khi bạn áp mã giảm giá...',
    image: 'https://t4.ftcdn.net/jpg/00/63/83/29/360_F_63832924_PE0b9gQltaKya7t6mIQLWat5ob0KcuXr.jpg',
  },
  {
    id: 'ev3',
    name: 'Giảm thêm 10% khi đơn hàng đạt giá trị 500k',
    description: 'tất cả sản phẩm sẽ được giảm 10% khi bạn áp mã giảm giá...',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStbtLaa6aLWogpLtbls8Kvfy83iGrkLJwMyQ&s',
  },
];

const items = [
  {
    id: 'cake001',
    name: 'Bánh bông lan trứng muối',
    quantity: 10,
    image: 'https://tiki.vn/blog/wp-content/uploads/2024/08/thumb-15.jpg',
  },
  {
    id: 'cake002',
    name: 'Bánh tart trái cây',
    quantity: 15,
    image: 'https://www.huongnghiepaau.com/wp-content/uploads/2017/11/tart-trai-cay-tot-cho-suc-khoe.jpg',
  },
  {
    id: 'cake003',
    name: 'Bánh cheesecake dâu tây',
    quantity: 8,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXDFjLB5H_9o42-ZEPwWHCaDN3sdNWQZFrlg&s',
  },
  {
    id: 'cake004',
    name: 'Bánh mì ngọt nhân kem',
    quantity: 20,
    image: 'https://lambanhngon.com/news_pictures/eks1360998762.jpg',
  },
  {
    id: 'cake005',
    name: 'Bánh su kem',
    quantity: 12,
    image: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/487/455/products/choux-1695873488314.jpg?v=1724205292207',
  },
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Nội dung cuộn */}
      <ScrollView style={{ flex: 1 }}>
        <Image source={images[currentImageIndex]} style={styles.IMG} />

        <Text style={styles.title}>Bánh đang có sẵn 🧁 </Text>
        <ScrollView horizontal contentContainerStyle={styles.scrollContainer} showsHorizontalScrollIndicator={false}>
          {items.map((item, index) => (
            <CategoryItem
              key={index}
              name={item.name}
              quantity={item.quantity}
              image={item.image}
            />
          ))}
        </ScrollView>


        <Text style={styles.title}>Các voucher hiện đang diễn ra 🎟️ </Text>
        <ScrollView horizontal contentContainerStyle={styles.scrollContainer} showsHorizontalScrollIndicator={false}>
          {event.map((item, index) => (
            <EventItem 
              key={index}
              name={item.name}
              image={item.image}
              description={item.description}
            />
          ))}
        </ScrollView>
 <Text style={styles.title}> Mẫu bánh bán chạy 🔥</Text>
          <View style={styles.gridContainer}>
  {hotItems.map((item, index) => (
    <View key={index} style={styles.gridItem}>
      <HotItem
        name={item.name}
        // quantity={item.quantity}
        description={item.description}
        image={item.image}
      />
    </View>
  ))}
</View>
      </ScrollView>

      {/* Cố định thanh tab ở dưới */}
      <View style={styles.tabBarContainer}>
        <TabLayout />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    gridContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  paddingHorizontal: 10,
  paddingBottom: 16,
},

gridItem: {
  width: '48%', // 2 item mỗi hàng, có khoảng cách
  marginBottom: 12,
},

  IMG: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  tabBarContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
  },
  scrollContainer: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    paddingBottom: 16,
  },
});
