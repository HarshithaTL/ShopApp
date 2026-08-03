import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../constants/images';

// Native Alert is a no-op on web, so we use a custom Modal instead.
const ConfirmDialog = ({ visible, title, message, onConfirm, onCancel, confirmLabel = 'Remove' }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
    <View style={dialogStyles.backdrop}>
      <View style={dialogStyles.box}>
        <Text style={dialogStyles.title}>{title}</Text>
        <Text style={dialogStyles.message}>{message}</Text>
        <View style={dialogStyles.row}>
          <TouchableOpacity style={dialogStyles.cancelBtn} onPress={onCancel}>
            <Text style={dialogStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={dialogStyles.confirmBtn} onPress={onConfirm}>
            <Text style={dialogStyles.confirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const dialogStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  title: { fontSize: 17, fontWeight: '800', color: '#1A1A2E', marginBottom: 8 },
  message: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#555' },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#E8554E',
    alignItems: 'center',
  },
  confirmText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

const CartScreen = ({ navigation }) => {
  const { cartItems, cartTotal, removeFromCart, incrementQty, decrementQty, clearCart } =
    useCart();

  const [dialog, setDialog] = useState({ visible: false, title: '', message: '', onConfirm: null, confirmLabel: 'Remove' });
  // id of the item that just hit its stock limit (cleared after 2 s)
  const [stockLimitId, setStockLimitId] = useState(null);

  const handleIncrement = (item) => {
    if (item.quantity != null && item.cartQty >= item.quantity) {
      setStockLimitId(item.id);
      setTimeout(() => setStockLimitId(null), 2500);
      return;
    }
    incrementQty(item.id);
  };

  const closeDialog = () => setDialog((d) => ({ ...d, visible: false }));

  const confirmRemove = (item) => {
    setDialog({
      visible: true,
      title: 'Remove Item',
      message: `Remove "${item.name}" from your cart?`,
      confirmLabel: 'Remove',
      onConfirm: () => { removeFromCart(item.id); closeDialog(); },
    });
  };

  const confirmClearAll = () => {
    setDialog({
      visible: true,
      title: 'Clear Cart',
      message: 'Remove all items from your cart?',
      confirmLabel: 'Clear All',
      onConfirm: () => { clearCart(); closeDialog(); },
    });
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🛒 My Cart</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add products to get started</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            // Naming the nested screen pops the Categories stack back to its
            // root; without it the tab restores the last product list viewed.
            onPress={() =>
              navigation.navigate('CategoriesTab', { screen: 'Categories' })
            }
          >
            <Text style={styles.browseBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛒 My Cart</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.ordersBtn} onPress={() => navigation.navigate('OrderHistory')}>
            <Text style={styles.ordersBtnText}>📋 Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmClearAll}>
            <Text style={styles.clearAll}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image
              source={getProductImage(item.id) ?? { uri: item.image }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              {/* Stock count */}
              {item.quantity != null && (
                <Text style={[
                  styles.stockLabel,
                  item.quantity <= 5 && styles.stockLabelLow,
                ]}>
                  {item.quantity <= 5
                    ? `⚠ Only ${item.quantity} available`
                    : `${item.quantity} in stock`}
                </Text>
              )}
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => decrementQty(item.id)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.cartQty}</Text>
                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    item.quantity != null && item.cartQty >= item.quantity && styles.qtyBtnDisabled,
                  ]}
                  onPress={() => handleIncrement(item)}
                >
                  <Text style={[
                    styles.qtyBtnText,
                    item.quantity != null && item.cartQty >= item.quantity && styles.qtyBtnTextDisabled,
                  ]}>+</Text>
                </TouchableOpacity>
                <Text style={styles.subtotal}>
                  ${(item.price * item.cartQty).toFixed(2)}
                </Text>
              </View>
              {/* Inline stock-limit toast */}
              {stockLimitId === item.id && (
                <Text style={styles.stockToast}>
                  ⚠ Only {item.quantity} available — can't add more.
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => confirmRemove(item)}
            >
              <Text style={styles.removeIcon}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.summaryRow}>
                <Text style={styles.summaryName} numberOfLines={1}>
                  {item.name} × {item.cartQty}
                </Text>
                <Text style={styles.summaryPrice}>
                  ${(item.price * item.cartQty).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${cartTotal.toFixed(2)}</Text>
            </View>
          </View>
        }
      />

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalSmall}>Total Amount</Text>
          <Text style={styles.totalLarge}>${cartTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Delivery')}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout →</Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: '#1A1A2E' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ordersBtn: {
    backgroundColor: '#E8F5F5', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  ordersBtnText: { fontSize: 12, fontWeight: '700', color: '#2A7F7F' },
  clearAll: { fontSize: 13, color: '#E8554E', fontWeight: '700' },
  list: { padding: 16, paddingBottom: 120 },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: { flex: 1, paddingHorizontal: 12 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  itemPrice: { fontSize: 13, color: '#2A7F7F', fontWeight: '700', marginBottom: 8 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stockLabel: { fontSize: 11, color: '#2E7D32', fontWeight: '600', marginBottom: 4 },
  stockLabelLow: { color: '#E65100' },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#F0F8F8', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A7F7F',
  },
  qtyBtnDisabled: { backgroundColor: '#F5F5F5', borderColor: '#ddd' },
  qtyBtnText: { fontSize: 18, color: '#2A7F7F', fontWeight: '700', lineHeight: 22 },
  qtyBtnTextDisabled: { color: '#bbb' },
  qtyValue: { fontSize: 16, fontWeight: '800', color: '#1A1A2E', minWidth: 24, textAlign: 'center' },
  subtotal: { fontSize: 13, color: '#F5A623', fontWeight: '800' },
  stockToast: {
    marginTop: 6, fontSize: 12, color: '#E65100',
    fontWeight: '700', lineHeight: 16,
  },
  removeBtn: { alignSelf: 'flex-start', padding: 4 },
  removeIcon: { fontSize: 20 },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryName: { fontSize: 13, color: '#555', flex: 1, marginRight: 8 },
  summaryPrice: { fontSize: 13, color: '#333', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#2A7F7F' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 10,
  },
  totalSmall: { fontSize: 12, color: '#888' },
  totalLarge: { fontSize: 22, fontWeight: '900', color: '#1A1A2E' },
  checkoutBtn: {
    backgroundColor: '#2A7F7F',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  checkoutText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A2E', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888', marginBottom: 24 },
  browseBtn: {
    backgroundColor: '#2A7F7F',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  browseBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default CartScreen;
