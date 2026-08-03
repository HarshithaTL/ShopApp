import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { order, total } = route.params || {};

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Background decoration */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.container}>
        {/* Success icon with animation */}
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconRing}>
            <View style={styles.iconInner}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
          </View>
          {/* Confetti dots */}
          <Text style={[styles.confetti, styles.c1]}>🎉</Text>
          <Text style={[styles.confetti, styles.c2]}>⭐</Text>
          <Text style={[styles.confetti, styles.c3]}>✨</Text>
        </Animated.View>

        {/* Success text */}
        <Animated.View
          style={[
            styles.textBlock,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.successTitle}>Order Confirmed! 🎊</Text>
          <Text style={styles.successSub}>
            Your order has been accepted
          </Text>

          {/* Transaction details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{order?.transactionId || 'TXN000000'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={[styles.detailValue, styles.amountValue]}>
                ${(total || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>✓ Confirmed</Text>
              </View>
            </View>
          </View>

          <Text style={styles.deliveryNote}>
            🚚 Your order will be delivered within 3–5 business days.
          </Text>
        </Animated.View>

        {/* Action buttons */}
        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.continueShopping}
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'HomeTab' }],
              });
            }}
          >
            <Text style={styles.continueText}>Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewOrders}
            onPress={() => {
              // Reset to CartTab with Cart at the bottom and OrderHistory on top.
              // This means: Back from OrderHistory → Cart, and the Cart tab button
              // always shows Cart (not a dangling OrderHistory).
              navigation.reset({
                index: 0,
                routes: [{
                  name: 'CartTab',
                  state: {
                    routes: [
                      { name: 'Cart' },
                      { name: 'OrderHistory' },
                    ],
                    index: 1,
                  },
                }],
              });
            }}
          >
            <Text style={styles.viewOrdersText}>📋 View My Orders</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#E8F5F5',
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF5E8',
    bottom: 100,
    left: -60,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(42, 127, 127, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2A7F7F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2A7F7F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  checkIcon: { fontSize: 44, color: '#fff' },
  confetti: { position: 'absolute', fontSize: 24 },
  c1: { top: -10, right: -10 },
  c2: { top: -10, left: -10 },
  c3: { bottom: -10, right: -5 },
  textBlock: { width: '100%', alignItems: 'center' },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1A1A2E',
    marginBottom: 6,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: { fontSize: 13, color: '#888', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#1A1A2E', fontWeight: '700' },
  amountValue: { fontSize: 18, color: '#2A7F7F', fontWeight: '900' },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: { color: '#2E7D32', fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f5f5f5', marginVertical: 10 },
  deliveryNote: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  actions: { width: '100%', marginTop: 28, gap: 12 },
  continueShopping: {
    backgroundColor: '#F5A623',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  viewOrders: {
    borderWidth: 2,
    borderColor: '#2A7F7F',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  viewOrdersText: { color: '#2A7F7F', fontSize: 16, fontWeight: '700' },
});

export default OrderConfirmationScreen;
