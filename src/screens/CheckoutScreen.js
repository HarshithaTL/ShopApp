import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/api';
import { getProductImage } from '../constants/images';

const CheckoutScreen = ({ route, navigation }) => {
  const { delivery } = route.params;
  const { cartItems, removeItems, incrementQty, decrementQty } = useCart();

  const scrollRef = useRef(null);

  // All items selected by default.
  const [selectedIds, setSelectedIds] = useState(() => new Set(cartItems.map((i) => i.id)));

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(cartItems.map((i) => i.id)));
  const deselectAll = () => setSelectedIds(new Set());
  const allSelected = selectedIds.size === cartItems.length;

  const selectedItems = cartItems.filter((i) => selectedIds.has(i.id));
  const selectedTotal = selectedItems.reduce((s, i) => s + i.price * i.cartQty, 0);

  const [placing, setPlacing] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setPlacing(true);
    try {
      const order = await placeOrder({
        items: selectedItems,
        total: selectedTotal,
        delivery,
      });
      removeItems(selectedItems.map((i) => i.id));
      navigation.replace('OrderConfirmation', { order, total: selectedTotal });
    } catch {
      setErrorModal(true);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Review Order</Text>
          <Text style={styles.headerSub}>Step 2 of 2</Text>
        </View>
      </View>

      {/* Delivery summary banner */}
      <View style={styles.deliveryBanner}>
        <Text style={styles.bannerIcon}>📍</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerName}>{delivery.name}  ·  {delivery.phone}</Text>
          <Text style={styles.bannerAddr} numberOfLines={1}>
            {delivery.address}, {delivery.city} – {delivery.pincode}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.bannerEdit}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Order-failed modal (Alert.alert is a no-op on web) */}
      <Modal transparent animationType="fade" visible={errorModal} onRequestClose={() => setErrorModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Order Failed</Text>
            <Text style={styles.modalMessage}>
              Unable to place your order. Please check your connection and try again.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setErrorModal(false)}>
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Items card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.selectAllRow} onPress={allSelected ? deselectAll : selectAll}>
            <View style={[styles.checkbox, allSelected && styles.checkboxChecked]}>
              {allSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.selectAllLabel}>{allSelected ? 'Deselect All' : 'Select All'}</Text>
          </TouchableOpacity>

          {selectedItems.length === 0 && (
            <Text style={styles.noneWarning}>⚠ Select at least one item to place an order.</Text>
          )}

          {cartItems.map((item) => {
            const checked = selectedIds.has(item.id);
            return (
              <View key={item.id} style={[styles.itemRow, !checked && styles.dimmed]}>
                <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkboxWrap}>
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <Image
                  source={getProductImage(item.id) ?? { uri: item.image }}
                  style={styles.itemImg}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementQty(item.id)}>
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyNum}>{item.cartQty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => incrementQty(item.id)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.itemTotal}>${(item.price * item.cartQty).toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Price summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {selectedItems.length === 0 ? (
            <Text style={styles.noItems}>No items selected</Text>
          ) : (
            selectedItems.map((item) => (
              <View key={item.id} style={styles.priceRow}>
                <Text style={styles.priceName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.priceQty}>×{item.cartQty}</Text>
                <Text style={styles.priceAmt}>${(item.price * item.cartQty).toFixed(2)}</Text>
              </View>
            ))
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${selectedTotal.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.placeBtn, (placing || selectedItems.length === 0) && styles.disabledBtn]}
          onPress={handlePlaceOrder}
          disabled={placing || selectedItems.length === 0}
        >
          {placing
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.placeBtnText}>Place Order</Text>}
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: '#333' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A2E' },
  headerSub: { fontSize: 12, color: '#2A7F7F', fontWeight: '600', marginTop: 1 },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d0ecec',
  },
  bannerIcon: { fontSize: 18 },
  bannerName: { fontSize: 13, fontWeight: '700', color: '#1A1A2E' },
  bannerAddr: { fontSize: 12, color: '#555', marginTop: 1 },
  bannerEdit: { fontSize: 13, color: '#2A7F7F', fontWeight: '700' },
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A2E', marginBottom: 14 },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  selectAllLabel: { fontSize: 13, fontWeight: '700', color: '#2A7F7F' },
  noneWarning: { fontSize: 12, color: '#E8554E', marginBottom: 12, fontWeight: '600' },
  noItems: { fontSize: 13, color: '#aaa', marginBottom: 8 },
  checkboxWrap: { paddingRight: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: '#2A7F7F', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: '#2A7F7F', borderColor: '#2A7F7F' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '900', lineHeight: 16 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 14, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#f8f8f8',
  },
  dimmed: { opacity: 0.4 },
  itemImg: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#f0f0f0' },
  itemDetails: { flex: 1, paddingHorizontal: 10 },
  itemName: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', marginBottom: 3 },
  itemPrice: { fontSize: 12, color: '#2A7F7F', fontWeight: '700', marginBottom: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 6,
    backgroundColor: '#F0F8F8', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A7F7F',
  },
  qtyBtnText: { fontSize: 16, color: '#2A7F7F', fontWeight: '700', lineHeight: 20 },
  qtyNum: { fontSize: 14, fontWeight: '800', color: '#1A1A2E' },
  itemTotal: { fontSize: 15, fontWeight: '800', color: '#2A7F7F' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  priceName: { flex: 1, fontSize: 13, color: '#555' },
  priceQty: { fontSize: 13, color: '#999', marginRight: 12 },
  priceAmt: { fontSize: 13, fontWeight: '700', color: '#333' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#2A7F7F' },
  placeBtn: {
    backgroundColor: '#2A7F7F', borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    shadowColor: '#2A7F7F', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  disabledBtn: { backgroundColor: '#aaa' },
  placeBtnText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  modalBox: {
    width: 300, backgroundColor: '#fff', borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A2E', marginBottom: 8 },
  modalMessage: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 20 },
  modalBtn: { backgroundColor: '#2A7F7F', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  modalBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

export default CheckoutScreen;
