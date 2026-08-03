import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import ProductCard from '../components/ProductCard';
import { getProductsByCategory } from '../services/api';

const FILTERS = ['All', 'In Stock', 'Top Rated', 'Price: Low to High', 'Price: High to Low'];

const ProductListScreen = ({ route, navigation }) => {
  const { category, color = '#2A7F7F' } = route.params || {};
  const tabBarHeight = useBottomTabBarHeight();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);  // 0 = "not set yet" — initialised after products load

  // Derive absolute min/max from the fetched product list
  const priceFloor = useMemo(() => (products.length ? Math.floor(Math.min(...products.map((p) => p.price))) : 0), [products]);
  const priceCeil  = useMemo(() => (products.length ? Math.ceil(Math.max(...products.map((p) => p.price)))  : 500), [products]);

  const priceFilterActive = products.length > 0 && (minPrice > priceFloor || maxPrice < priceCeil);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getProductsByCategory(category);
      setProducts(data);
      setFiltered(data);
      if (data.length) {
        const floor = Math.floor(Math.min(...data.map((p) => p.price)));
        const ceil  = Math.ceil(Math.max(...data.map((p) => p.price)));
        setMinPrice(floor);
        setMaxPrice(ceil);
      }
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    let result = [...products];

    if (search.trim()) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    if (activeFilter === 'In Stock') {
      result = result.filter((p) => p.inStock);
    } else if (activeFilter === 'Top Rated') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (activeFilter === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (activeFilter === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    }

    setFiltered(result);
  }, [search, activeFilter, minPrice, maxPrice, products]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={color} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSub}>Categories /</Text>
          <Text style={styles.headerTitle}>{category}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search in ${category}…`}
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips + Price Range toggle */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && { backgroundColor: color }]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Price range toggle chip */}
        <TouchableOpacity
          style={[styles.chip, (showPriceFilter || priceFilterActive) && { backgroundColor: color }]}
          onPress={() => setShowPriceFilter((v) => !v)}
        >
          <Text style={[styles.chipText, (showPriceFilter || priceFilterActive) && styles.chipTextActive]}>
            💲 Price Range{priceFilterActive ? ' ✓' : ''}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Price range slider panel */}
      {showPriceFilter && priceCeil > priceFloor && (
        <View style={styles.sliderPanel}>
          {/* Min / Max labels */}
          <View style={styles.sliderRangeRow}>
            <View style={[styles.sliderBadge, { backgroundColor: color }]}>
              <Text style={styles.sliderBadgeText}>${minPrice}</Text>
            </View>
            <Text style={styles.sliderSep}>to</Text>
            <View style={[styles.sliderBadge, { backgroundColor: color }]}>
              <Text style={styles.sliderBadgeText}>${maxPrice}</Text>
            </View>
            {priceFilterActive && (
              <TouchableOpacity
                style={[styles.resetBtn, { backgroundColor: color }]}
                onPress={() => { setMinPrice(priceFloor); setMaxPrice(priceCeil); }}
              >
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Single range slider with two thumbs */}
          <Slider
            value={[minPrice, maxPrice]}
            minimumValue={priceFloor}
            maximumValue={priceCeil}
            step={1}
            minimumTrackTintColor={color}
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor={color}
            trackStyle={styles.sliderTrack}
            thumbStyle={styles.sliderThumb}
            onValueChange={(vals) => {
              setMinPrice(Math.round(vals[0]));
              setMaxPrice(Math.round(vals[1]));
            }}
          />

          <View style={styles.sliderEndLabels}>
            <Text style={styles.sliderEndText}>${priceFloor}</Text>
            <Text style={styles.sliderEndText}>${priceCeil}</Text>
          </View>
        </View>
      )}

      {/* Title */}
      <Text style={styles.sectionTitle}>
        {category} For You!{filtered.length !== products.length ? `  (${filtered.length})` : ''}
      </Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠ {error}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarHeight + 24 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate('ProductDetail', { productId: item.id })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubText}>Try adjusting your filters</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  clearBtn: { fontSize: 14, color: '#aaa' },
  // The ScrollView must not claim vertical space from the product grid below it.
  filtersScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipText: { fontSize: 12, color: '#666', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  sliderPanel: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sliderRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sliderBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  sliderBadgeText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  sliderSep: { fontSize: 13, color: '#aaa', fontWeight: '600' },
  sliderTrack: { height: 4, borderRadius: 2 },
  sliderThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  sliderEndLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sliderEndText: { fontSize: 11, color: '#aaa', fontWeight: '600' },
  resetBtn: {
    marginLeft: 'auto',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  resetBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  clearPriceBtn: {
    marginTop: 6,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  clearPriceBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A2E',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  list: { paddingHorizontal: 16 },
  row: { justifyContent: 'space-between' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
  emptySubText: { fontSize: 13, color: '#888' },
  errorBox: { margin: 16, backgroundColor: '#FFF3F3', borderRadius: 10, padding: 14 },
  errorText: { color: '#C0392B', fontSize: 13 },
});

export default ProductListScreen;
