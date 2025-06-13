import { FontAwesome } from '@expo/vector-icons'; // dùng icon FontAwesome
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const StarRating = ({ maxStars = 5, onRatingChange }) => {
  const [rating, setRating] = useState(0);

  const handlePress = (star) => {
    setRating(star);
    if (onRatingChange) {
      onRatingChange(star);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đánh giá tổng thể của bạn</Text>
      <View style={styles.starContainer}>
        {[...Array(maxStars)].map((_, index) => {
          const starNumber = index + 1;
          const isSelected = starNumber <= rating;

          return (
            <TouchableOpacity key={index} onPress={() => handlePress(starNumber)}>
              <FontAwesome
                name="star"
                size={40}
                color={isSelected ? '#FFD700' : '#FFFFFF'}
                style={[styles.star, !isSelected && styles.unselectedStar]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 16
  },
  title: {
    fontSize: 16,
    marginBottom: 8
  },
  starContainer: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: 6,
  },
  unselectedStar: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    padding: 2,
  }
});

export default StarRating;
