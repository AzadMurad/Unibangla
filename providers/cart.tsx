import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type AddCartItemInput = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  getItemQuantity: (productId: number) => number;
  addItem: (item: AddCartItemInput) => { quantity: number; added: number };
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  removeItems: (productIds: number[]) => void;
  clearCart: () => void;
  cartReady: boolean;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "unibangla_cart_items";
const MONTHLY_ITEM_LIMIT = 2;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
    } catch (error) {
      console.error("Failed to restore cart state:", error);
    } finally {
      setCartReady(true);
    }
  }, []);

  useEffect(() => {
    if (!cartReady) {
      return;
    }

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to persist cart state:", error);
    }
  }, [cartReady, items]);

  const addItem = ({ id, name, price, quantity }: AddCartItemInput) => {
    let result = { quantity: 0, added: 0 };

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === id);
      const currentQuantity = existingItem?.quantity ?? 0;
      const nextQuantity = Math.min(
        MONTHLY_ITEM_LIMIT,
        currentQuantity + Math.max(0, quantity)
      );

      result = {
        quantity: nextQuantity,
        added: nextQuantity - currentQuantity,
      };

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === id ? { ...item, quantity: nextQuantity } : item
        );
      }

      if (nextQuantity === 0) {
        return currentItems;
      }

      return [...currentItems, { id, name, price, quantity: nextQuantity }];
    });

    return result;
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems((currentItems) => {
      if (quantity <= 0) {
        return currentItems.filter((item) => item.id !== productId);
      }

      return currentItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(MONTHLY_ITEM_LIMIT, quantity) }
          : item
      );
    });
  };

  const removeItem = (productId: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  };

  const removeItems = (productIds: number[]) => {
    const idsToRemove = new Set(productIds);
    setItems((currentItems) =>
      currentItems.filter((item) => !idsToRemove.has(item.id))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: number) => {
    return items.find((item) => item.id === productId)?.quantity ?? 0;
  };

  const value = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    return {
      items,
      totalItems,
      totalPrice,
      getItemQuantity,
      addItem,
      updateQuantity,
      removeItem,
      removeItems,
      clearCart,
      cartReady,
    };
  }, [items, cartReady]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
