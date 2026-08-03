import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../constants/images';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ProductCard = ({ product, onPress }) => {
  const { addToCart, cartItems } = useCart();

  const inCart = cartItems.some((i) => i.id === product.id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        <Image
          source={getProductImage(product.id) ?? { uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
        {!product.inStock && (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.description} numberOfLines={1}>{product.description}</Text>
        <StarRating rating={product.rating} reviews={product.reviews} size={12} />
        {/* Stock count label */}
        {product.inStock && product.quantity != null && (
          <Text style={[
            styles.stockCount,
            product.quantity <= 5 && styles.stockCountLow,
          ]}>
            {product.quantity <= 5
              ? `⚠ Only ${product.quantity} left!`
              : `${product.quantity} in stock`}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={[styles.addBtn, (!product.inStock || inCart) && styles.addBtnDisabled]}
            onPress={() => product.inStock && addToCart(product)}
            disabled={!product.inStock}
          >
            <Text style={styles.addBtnText}>
              {inCart ? '✓ Added' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  outOfStock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  info: {
    padding: 10,
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 3,
    lineHeight: 18,
    // Two lines are always reserved so the rating and price rows start at the
    // same offset whether a name wraps or not.
    minHeight: 36,
  },
  description: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  stockCount: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 4,
  },
  stockCountLow: {
    color: '#E65100',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2A7F7F',
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: '#2A7F7F',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#aaa',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ProductCard;
