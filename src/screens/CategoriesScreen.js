import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import CategoryCard from '../components/CategoryCard';
import HeaderIcons from '../components/HeaderIcons';
import { getCategories } from '../services/api';

const { width } = Dimensions.get('window');

// Layout measured off the design mockup at a 335px content width.
// Cap at 430px so fonts don't blow up on web/wide browser windows.
const MOCK_W = 335;
const cs = (n) => (Math.min(width, 430) * n) / MOCK_W;

const CategoriesScreen = ({ navigation }) => {
  const tabBarHeight = useBottomTabBarHeight();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch {
      setError('Failed to load categories. Make sure JSON server is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>MyShoppy</Text>
        <HeaderIcons size={cs(17)} gap={cs(11)} />
      </View>

      <Text style={styles.title}>Categories</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2A7F7F" />
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠ {error}</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: tabBarHeight + cs(16) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2A7F7F']}
            />
          }
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onPress={() =>
                navigation.navigate('ProductList', {
                  category: item.name,
                  color: item.color,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No categories found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F5F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: cs(9),
    paddingRight: cs(4),
    paddingTop: cs(6),
    paddingBottom: cs(10),
  },
  logo: {
    fontSize: cs(21),
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#0E4C4C',
    letterSpacing: -0.3,
    textDecorationLine: 'underline',
  },
  title: {
    fontSize: cs(13),
    fontWeight: '700',
    color: '#748C8C',
    marginLeft: cs(9),
    marginBottom: cs(12),
  },
  list: {
    paddingHorizontal: cs(16),
  },
  row: {
    justifyContent: 'space-between',
  },
  errorBox: {
    margin: cs(16),
    backgroundColor: '#FFF3F3',
    borderRadius: 10,
    padding: 14,
  },
  errorText: { color: '#C0392B', fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#888' },
});

export default CategoriesScreen;
