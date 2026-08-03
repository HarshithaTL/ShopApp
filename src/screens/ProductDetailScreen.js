import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StarRating from '../components/StarRating';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../constants/images';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);

  const { addToCart, cartItems } = useCart();
  const inCart = product && cartItems.some((i) => i.id === product.id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const stock = product?.quantity ?? Infinity;
  const atStockLimit = qty >= stock;

  const handleAddToCart = () => {
    if (!product || !product.inStock) return;
    const safeQty = Math.min(qty, stock);
    for (let i = 0; i < safeQty; i++) {
      addToCart(product);
    }
    navigation.navigate('CartTab');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2A7F7F" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠ {error || 'Product not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnAlt}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button overlay on image */}
        <View style={styles.imageWrapper}>
          <Image
            source={getProductImage(product.id) ?? { uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          {!product.inStock && (
            <View style={styles.outBadge}>
              <Text style={styles.outBadgeText}>Out of Stock</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Category badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>

          {/* Product name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <StarRating rating={product.rating} reviews={product.reviews} size={16} />
          </View>

          {/* Price + stock count */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.inStock && product.quantity != null && (
              <View style={[
                styles.stockBadge,
                product.quantity <= 5 && styles.stockBadgeLow,
              ]}>
                <Text style={[
                  styles.stockBadgeText,
                  product.quantity <= 5 && styles.stockBadgeTextLow,
                ]}>
                  {product.quantity <= 5
                    ? `⚠ Only ${product.quantity} left!`
                    : `${product.quantity} in stock`}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Quantity selector */}
          {product.inStock && (
            <>
              <Text style={styles.sectionLabel}>Quantity</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{qty}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, atStockLimit && styles.qtyBtnDisabled]}
                  onPress={() => setQty((q) => Math.min(stock, q + 1))}
                  disabled={atStockLimit}
                >
                  <Text style={[styles.qtyBtnText, atStockLimit && styles.qtyBtnTextDisabled]}>+</Text>
                </TouchableOpacity>
                <Text style={styles.subtotal}>
                  Subtotal: ${(product.price * qty).toFixed(2)}
                </Text>
              </View>
              {atStockLimit && (
                <Text style={styles.stockWarn}>
                  ⚠ Only {stock} available — that's the maximum you can add.
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>${(product.price * qty).toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addToCartBtn,
            (!product.inStock) && styles.disabledBtn,
          ]}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        >
          <Text style={styles.addToCartText}>
            {!product.inStock
              ? 'Unavailable'
              : inCart
              ? 'View Cart →'
              : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  imageWrapper: { position: 'relative' },
  productImage: {
    width,
    height: 280,
    backgroundColor: '#e0e0e0',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: { fontSize: 20, color: '#333' },
  outBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#C62828',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  outBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
    paddingBottom: 100,
  },
  categoryBadge: {
    backgroundColor: '#E8F5F5',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  categoryText: { color: '#2A7F7F', fontSize: 12, fontWeight: '700' },
  productName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A2E',
    lineHeight: 28,
    marginBottom: 10,
  },
  ratingRow: { marginBottom: 14 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  price: { fontSize: 28, fontWeight: '900', color: '#2A7F7F' },
  stockBadge: {
    backgroundColor: '#E8F5E9', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  stockBadgeLow: { backgroundColor: '#FFF3E0' },
  stockBadgeText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
  stockBadgeTextLow: { color: '#E65100' },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnDisabled: { backgroundColor: '#E8E8E8' },
  qtyBtnText: { fontSize: 22, color: '#333', fontWeight: '700', lineHeight: 28 },
  qtyBtnTextDisabled: { color: '#bbb' },
  qtyValue: { fontSize: 18, fontWeight: '800', color: '#1A1A2E', minWidth: 28, textAlign: 'center' },
  subtotal: { fontSize: 14, color: '#2A7F7F', fontWeight: '700', marginLeft: 8 },
  stockWarn: {
    marginTop: 10, fontSize: 13, color: '#E65100',
    fontWeight: '600', lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  priceInfo: { flex: 1 },
  totalLabel: { fontSize: 12, color: '#888' },
  totalPrice: { fontSize: 22, fontWeight: '900', color: '#1A1A2E' },
  addToCartBtn: {
    backgroundColor: '#2A7F7F',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  disabledBtn: { backgroundColor: '#aaa' },
  addToCartText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  errorText: { color: '#C0392B', fontSize: 15, marginBottom: 16, textAlign: 'center' },
  backBtnAlt: {
    backgroundColor: '#2A7F7F',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtnText: { color: '#fff', fontWeight: '700' },
});

export default ProductDetailScreen;
