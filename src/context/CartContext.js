import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@shopapp_cart';
const CartContext = createContext(null);

// ─── helpers ────────────────────────────────────────────────────────────────

const readCart = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCart = async (items) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage write failure is non-fatal; in-memory state is still correct
  }
};

// ─── provider ────────────────────────────────────────────────────────────────

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    readCart().then((saved) => {
      setItems(saved);
      setLoading(false);
    });
  }, []);

  // Every operation: compute next state → write to AsyncStorage → update React state
  const commit = useCallback(async (updater) => {
    const current = await readCart();
    const next = updater(current);
    await writeCart(next);
    setItems(next);
  }, []);

  const addToCart = useCallback((product) => {
    commit((current) => {
      const idx = current.findIndex((i) => i.id === product.id);
      if (idx !== -1) {
        // Already in cart — increment, capped at stock
        return current.map((i, index) =>
          index === idx
            ? { ...i, cartQty: Math.min(i.cartQty + 1, i.quantity ?? i.cartQty + 1) }
            : i
        );
      }
      // New item — prepend so it appears at the top
      return [{ ...product, cartQty: 1 }, ...current];
    });
  }, [commit]);

  const removeFromCart = useCallback((id) => {
    commit((current) => current.filter((i) => i.id !== id));
  }, [commit]);

  const incrementQty = useCallback((id) => {
    commit((current) =>
      current.map((i) =>
        i.id === id
          ? { ...i, cartQty: Math.min(i.cartQty + 1, i.quantity ?? i.cartQty + 1) }
          : i
      )
    );
  }, [commit]);

  const decrementQty = useCallback((id) => {
    commit((current) =>
      current.map((i) =>
        i.id === id ? { ...i, cartQty: Math.max(1, i.cartQty - 1) } : i
      )
    );
  }, [commit]);

  const removeItems = useCallback((ids) => {
    commit((current) => current.filter((i) => !ids.includes(i.id)));
  }, [commit]);

  const clearCart = useCallback(() => {
    commit(() => []);
  }, [commit]);

  const cartTotal = items.reduce((sum, i) => sum + i.price * i.cartQty, 0);
  const cartCount = items.reduce((sum, i) => sum + i.cartQty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems: items,
        cartLoading: loading,
        cartTotal,
        cartCount,
        addToCart,
        removeFromCart,
        removeItems,
        incrementQty,
        decrementQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
