import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';

enableScreens();
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import DeliveryScreen from '../screens/DeliveryScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import { useCart } from '../context/CartContext';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CatStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();

const TabIcon = ({ icon, label, focused, badgeCount }) => (
  <View style={tabIconStyles.wrapper}>
    {/* The badge anchors to this wrapper so it hugs the glyph rather than the
        full-width column that holds the label. */}
    <View style={tabIconStyles.iconWrap}>
      <Ionicons
        name={icon}
        size={23}
        color="#fff"
        style={!focused && tabIconStyles.inactive}
      />
      <CartBadge count={badgeCount} />
    </View>
    <Text
      style={[tabIconStyles.label, !focused && tabIconStyles.inactive]}
      numberOfLines={1}
    >
      {label}
    </Text>
  </View>
);

const tabIconStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', paddingTop: 6, width: 96 },
  iconWrap: { position: 'relative' },
  inactive: { opacity: 0.72 },
  label: { fontSize: 11, color: '#fff', marginTop: 3, fontWeight: '600' },
});

const HomeStackNav = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </HomeStack.Navigator>
);

const CatStackNav = () => (
  <CatStack.Navigator screenOptions={{ headerShown: false }}>
    <CatStack.Screen name="Categories" component={CategoriesScreen} />
    <CatStack.Screen name="ProductList" component={ProductListScreen} />
    <CatStack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </CatStack.Navigator>
);

const CartStackNav = () => (
  <CartStack.Navigator screenOptions={{ headerShown: false }}>
    <CartStack.Screen name="Cart" component={CartScreen} />
    <CartStack.Screen name="Delivery" component={DeliveryScreen} />
    <CartStack.Screen name="Checkout" component={CheckoutScreen} />
    <CartStack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
    <CartStack.Screen name="OrderHistory" component={OrderHistoryScreen} />
  </CartStack.Navigator>
);

const CartBadge = ({ count }) => {
  if (!count) return null;
  return (
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#E8554E',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  text: { color: '#fff', fontSize: 10, fontWeight: '800' },
});

const AppNavigator = () => {
  const { cartCount } = useCart();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#2A7F7F',
            height: 64,
            borderTopWidth: 0,
            paddingBottom: 0,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNav}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="home-outline" label="Home" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="CategoriesTab"
          component={CatStackNav}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="grid-outline" label="Categories" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="CartTab"
          component={CartStackNav}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon="cart-outline"
                label="Cart"
                focused={focused}
                badgeCount={cartCount}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
