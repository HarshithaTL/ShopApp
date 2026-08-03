import React from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { getCategoryImage } from '../constants/images';

const { width } = Dimensions.get('window');

// Grid metrics measured off the design mockup at a 335px content width.
const MOCK_W = 335;
const cs = (n) => (Math.min(width, 430) * n) / MOCK_W;

const MAX_W = Math.min(width, 430);
const CARD_WIDTH = (MAX_W - cs(48)) / 2;
const CARD_ASPECT = 141 / 160;
// Pinned rather than left to `aspectRatio`, which a flex row can stretch.
const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT;

const CategoryCard = ({ category, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    <Image
      source={getCategoryImage(category.name) ?? { uri: category.image }}
      style={styles.image}
      resizeMode="contain"
    />
    <Text style={styles.name} numberOfLines={1}>
      {category.name}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: cs(10),
    marginBottom: cs(7),
    overflow: 'hidden',
    backgroundColor: '#E4ECEC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    position: 'absolute',
    top: cs(12),
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#fff',
    fontSize: cs(15),
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default CategoryCard;
