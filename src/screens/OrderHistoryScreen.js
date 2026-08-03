import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const STATUS_COLOR = { confirmed: '#2E7D32', pending: '#F5A623', cancelled: '#C62828' };
const STATUS_BG    = { confirmed: '#E8F5E9', pending: '#FFF3E0', cancelled: '#FFEBEE' };

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null); // order pending cancel confirmation
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      // json-server v1 uses `-field` prefix for descending sort
      const res = await api.get('/orders?_sort=-createdAt');
      setOrders(res.data);
    } catch {
      setError('Could not load orders. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancelOrder = async () => {
    if (!confirmOrder) return;
    setCancelling(true);
    try {
      await api.patch(`/orders/${confirmOrder.id}`, { status: 'cancelled' });
      // Update local state immediately without refetching
      setOrders((prev) =>
        prev.map((o) => o.id === confirmOrder.id ? { ...o, status: 'cancelled' } : o)
      );
    } catch {
      setError('Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
      setConfirmOrder(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      '  ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const renderOrder = ({ item }) => {
    const status = item.status || 'confirmed';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>#{item.transactionId || item.id}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[status] || '#E8F5E9' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLOR[status] || '#2E7D32' }]}>
              ✓ {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>

        {item.delivery && (
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.addressText} numberOfLines={1}>
              {item.delivery.name}  ·  {item.delivery.address}, {item.delivery.city}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        {(item.items || []).map((p, i) => (
          <TouchableOpacity
            key={i}
            style={styles.itemRow}
            activeOpacity={0.65}
            onPress={() =>
              navigation.navigate('HomeTab', {
                screen: 'ProductDetail',
                params: { productId: p.id },
              })
            }
          >
            <Text style={styles.itemName} numberOfLines={1}>{p.name}</Text>
            <Text style={styles.itemQty}>×{p.cartQty}</Text>
            <Text style={styles.itemAmt}>${(p.price * p.cartQty).toFixed(2)}</Text>
            <Text style={styles.itemArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {(item.items || []).length} item{(item.items || []).length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.totalValue}>${(item.total || 0).toFixed(2)}</Text>
        </View>

        {status !== 'cancelled' && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setConfirmOrder(item)}
          >
            <Text style={styles.cancelBtnText}>✕  Cancel Order</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header navigation={navigation} count={0} />
        <View style={styles.center}><ActivityIndicator size="large" color="#2A7F7F" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header navigation={navigation} count={orders.length} />

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>⚠ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchOrders()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOrders(true)}
              tintColor="#2A7F7F"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySub}>Your order history will appear here</Text>
              <TouchableOpacity
                style={styles.shopBtn}
                onPress={() => navigation.navigate('CategoriesTab', { screen: 'Categories' })}
              >
                <Text style={styles.shopBtnText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Cancel confirmation modal */}
      <Modal
        transparent
        animationType="fade"
        visible={!!confirmOrder}
        onRequestClose={() => setConfirmOrder(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Cancel Order?</Text>
            <Text style={styles.modalTxnId}>
              #{confirmOrder?.transactionId || confirmOrder?.id}
            </Text>
            <Text style={styles.modalMsg}>
              This action cannot be undone. The order will be marked as cancelled.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalKeepBtn}
                onPress={() => setConfirmOrder(null)}
                disabled={cancelling}
              >
                <Text style={styles.modalKeepText}>Keep Order</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalCancelText}>Yes, Cancel</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const Header = ({ navigation, count }) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Cart')}
      style={styles.backBtn}
    >
      <Text style={styles.backIcon}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>My Orders</Text>
    {count > 0 && (
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: '#333' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#1A1A2E' },
  countBadge: {
    backgroundColor: '#2A7F7F', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  countText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 10,
  },
  orderId: { fontSize: 14, fontWeight: '800', color: '#1A1A2E' },
  orderDate: { fontSize: 12, color: '#888', marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  addressIcon: { fontSize: 13 },
  addressText: { flex: 1, fontSize: 12, color: '#555' },
  divider: { height: 1, backgroundColor: '#f5f5f5', marginVertical: 10 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 6,
    paddingVertical: 4, borderRadius: 6,
  },
  itemName: { flex: 1, fontSize: 13, color: '#333' },
  itemQty: { fontSize: 13, color: '#999', marginRight: 12, width: 28, textAlign: 'center' },
  itemAmt: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  itemArrow: { fontSize: 18, color: '#2A7F7F', marginLeft: 6, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, color: '#888' },
  totalValue: { fontSize: 18, fontWeight: '900', color: '#2A7F7F' },
  errorText: { fontSize: 14, color: '#C62828', marginBottom: 16, textAlign: 'center' },
  retryBtn: {
    backgroundColor: '#2A7F7F', borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888', marginBottom: 24 },
  shopBtn: {
    backgroundColor: '#2A7F7F', borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 13,
  },
  shopBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelBtn: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#E53935',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#E53935', fontSize: 13, fontWeight: '700' },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBox: {
    width: 310, backgroundColor: '#fff', borderRadius: 18, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 4 },
  modalTxnId: { fontSize: 12, color: '#2A7F7F', fontWeight: '700', marginBottom: 12 },
  modalMsg: { fontSize: 13, color: '#666', lineHeight: 20, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalKeepBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#2A7F7F',
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  modalKeepText: { color: '#2A7F7F', fontWeight: '700', fontSize: 14 },
  modalCancelBtn: {
    flex: 1, backgroundColor: '#E53935',
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  modalCancelText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default OrderHistoryScreen;
