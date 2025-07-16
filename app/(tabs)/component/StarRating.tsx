import { FontAwesome } from '@expo/vector-icons'; // dùng icon FontAwesome
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define types for props for better type safety and clarity
type StarRatingProps = {
  maxStars?: number; // Optional, defaults to 5
  rating: number; // The current rating value from the parent state
  setRating: (rating: number) => void; // Function to update the rating in the parent
};

const StarRating: React.FC<StarRatingProps> = ({ maxStars = 5, rating, setRating }) => {
  // The 'rating' state should ideally be managed by the parent component (ReviewScreen)
  // so it can be submitted along with other review data.
  // We're now receiving 'rating' and 'setRating' as props.

  const handlePress = (starNumber: number) => {
    // If the user clicks the currently selected star, it should clear the rating (set to 0)
    // Otherwise, set the rating to the clicked star number.
    setRating(starNumber === rating ? 0 : starNumber);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đánh giá tổng thể của bạn</Text>
      <View style={styles.starContainer}>
        {[...Array(maxStars)].map((_, index) => {
          const starNumber = index + 1;
          const isSelected = starNumber <= rating;

          return (
            <TouchableOpacity key={index} onPress={() => handlePress(starNumber)} activeOpacity={0.7}>
              <FontAwesome
                name="star"
                size={40}
                // Corrected logic: Use a yellow/gold for selected, and a gray for unselected
                color={isSelected ? '#FFD700' : '#CCCCCC'} // Gold for selected, light gray for unselected
                style={styles.star} // Apply general star styling
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
    marginVertical: 16, // Use marginVertical for consistent spacing
    backgroundColor: '#fff', // Add a background for the rating section
    borderRadius: 10,
    paddingVertical: 20, // More padding
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18, // Slightly larger title
    fontWeight: '600', // Bolder title
    marginBottom: 15, // More space below title
    color: '#333',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center stars horizontally
  },
  star: {
    marginHorizontal: 4, // Slightly less horizontal margin to bring stars closer
  },
  // Removed unselectedStar style as it's no longer needed
});

export default StarRating;