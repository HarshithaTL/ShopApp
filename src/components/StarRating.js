import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StarRating = ({ rating, reviews, size = 14, showCount = true }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[styles.star, { fontSize: size }]}>
          {i <= fullStars ? '★' : i === fullStars + 1 && hasHalf ? '⯨' : '☆'}
        </Text>
      ))}
      {showCount && reviews !== undefined && (
        <Text style={[styles.count, { fontSize: size - 2 }]}>({reviews})</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  star: {
    color: '#F5A623',
  },
  count: {
    color: '#999',
    marginLeft: 4,
  },
});

export default StarRating;
