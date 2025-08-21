import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

type StarRatingProps = {
  maxStars?: number;
  rating: number;
  setRating: (rating: number) => void;
};

const StarRating: React.FC<StarRatingProps> = ({ maxStars = 5, rating, setRating }) => {
  const scaleAnimations = useRef([...Array(maxStars)].map(() => new Animated.Value(1))).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  const getRatingText = (rating: number) => {
    const texts = [
      { text: 'Chọn số sao đánh giá', emoji: '⭐', color: '#95A5A6' },
      { text: 'Rất tệ', emoji: '😞', color: '#E74C3C' },
      { text: 'Tệ', emoji: '😕', color: '#E67E22' },
      { text: 'Bình thường', emoji: '😐', color: '#F39C12' },
      { text: 'Tốt', emoji: '😊', color: '#2ECC71' },
      { text: 'Tuyệt vời!', emoji: '🤩', color: '#27AE60' }
    ];
    return texts[rating];
  };

  const handlePress = (starNumber: number) => {
    setRating(starNumber === rating ? 0 : starNumber);
    
    // Animate pressed star
    Animated.sequence([
      Animated.timing(scaleAnimations[starNumber - 1], {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[starNumber - 1], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();

    // Glow effect
    Animated.sequence([
      Animated.timing(glowAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const currentRatingInfo = getRatingText(rating);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#F8F9FA']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Icon name="star-outline" size={24} color="#FF6B35" />
        <Text style={styles.title}>Đánh giá sản phẩm</Text>
      </View>

      {/* Stars Container */}
      <View style={styles.starsContainer}>
        <View style={styles.starsRow}>
          {[...Array(maxStars)].map((_, index) => {
            const starNumber = index + 1;
            const isSelected = starNumber <= rating;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handlePress(starNumber)}
                activeOpacity={0.8}
                style={styles.starButton}
              >
                <Animated.View
                  style={[
                    styles.starWrapper,
                    {
                      transform: [{ scale: scaleAnimations[index] }],
                    }
                  ]}
                >
                  {/* Glow effect background */}
                  {isSelected && (
                    <Animated.View
                      style={[
                        styles.starGlow,
                        {
                          opacity: glowAnimation,
                        }
                      ]}
                    />
                  )}
                  
                  {/* Star icon */}
                  <Icon
                    name={isSelected ? 'star' : 'star-outline'}
                    size={40}
                    color={isSelected ? '#FFD700' : '#E0E0E0'}
                    style={[
                      styles.star,
                      isSelected && styles.selectedStar
                    ]}
                  />
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Rating Description */}
        <View style={styles.ratingDescriptionContainer}>
          <LinearGradient
            colors={rating > 0 ? ['rgba(255, 107, 53, 0.1)', 'rgba(247, 147, 30, 0.1)'] : ['transparent', 'transparent']}
            style={styles.ratingDescriptionBg}
          >
            <Text style={styles.ratingEmoji}>{currentRatingInfo.emoji}</Text>
            <Text style={[styles.ratingDescription, { color: currentRatingInfo.color }]}>
              {currentRatingInfo.text}
            </Text>
          </LinearGradient>
        </View>

        {/* Progress Bar */}
        {rating > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${(rating / maxStars) * 100}%`,
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>{rating}/{maxStars}</Text>
          </View>
        )}
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Icon name="information-circle-outline" size={16} color="#7F8C8D" />
        <Text style={styles.tipsText}>
          Đánh giá của bạn sẽ giúp người khác lựa chọn sản phẩm tốt nhất
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 107, 53, 0.1)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginLeft: 8,
    letterSpacing: 0.5,
  },

  starsContainer: {
    alignItems: 'center',
  },

  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  starButton: {
    padding: 8,
    marginHorizontal: 6,
  },

  starWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  starGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },

  star: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  selectedStar: {
    elevation: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  ratingDescriptionContainer: {
    marginBottom: 16,
    minHeight: 50,
    justifyContent: 'center',
  },

  ratingDescriptionBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 200,
  },

  ratingEmoji: {
    fontSize: 24,
    marginRight: 8,
  },

  ratingDescription: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
  },

  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },

  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    minWidth: 35,
  },

  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  tipsText: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginLeft: 6,
    fontStyle: 'italic',
    flex: 1,
  },
});

export default StarRating;