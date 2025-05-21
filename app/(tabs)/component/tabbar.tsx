import { useNavigation } from "expo-router";
import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native"; // Import StyleSheet
import iconhome from '../../../assets/images/iconhome.png';
import iconproduct from '../../../assets/images/iconproduct.png';
import iconheart from '../../../assets/images/iconheart.png';
import iconshopping from '../../../assets/images/iconshopping.png';
import iconprofile from '../../../assets/images/iconprofile.png';

export default function TabLayout() {
  const navigation = useNavigation();

  return (
    <View style={styles.tabBarContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('home')}>
        <Image style={styles.icon} source={iconhome} />
      </TouchableOpacity>
      <TouchableOpacity >
        <Image style={styles.icon} source={iconshopping} />
      </TouchableOpacity>
      <TouchableOpacity >
        <Image style={styles.icon} source={iconproduct} />
      </TouchableOpacity>
      <TouchableOpacity >
        <Image style={styles.icon} source={iconheart} />
      </TouchableOpacity>
      <TouchableOpacity >
        <Image style={styles.icon} source={iconprofile} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row', // Arrange icons horizontally
    justifyContent: 'space-around', // Distribute space evenly
    alignItems: 'center', // Align icons vertically
    backgroundColor: '#fff', // Or any background color you prefer
    height: 60, // Set a fixed height for the tab bar
    borderTopWidth: 1, // Optional: Add a top border
    borderTopColor: '#e0e0e0', // Optional: Border color
    position: 'absolute', // Position at the bottom of the screen
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10, // Add some horizontal padding
  },
  icon: {
    width: 28, // Set desired icon width
    height: 28, // Set desired icon height
    resizeMode: 'contain', // Ensure the image scales correctly
  },
});