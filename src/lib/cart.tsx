import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem, CartItemProduct, PartsProduct } from '@/lib/types';

interface CartContextValue {
  items: CartItem[];
  productItems: CartItemProduct[];
  count: number;
  total: number;
  add: (part: any) => void;
  remove: (partId: string) => void;
  setQty: (partId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'mtex-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [productItems, setProductItems] = useState<CartItemProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setProductItems(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(productItems));
    } catch {
      // ignore
    }
  }, [productItems]);

  function add(part: any) {
    if (part && typeof part === 'object' && 'images' in part && 'part_type' in part) {
      setProductItems((prev) => {
        const existing = prev.find((i) => i.product.id === part.id);
        if (existing) {
          return prev.map((i) =>
            i.product.id === part.id
              ? { ...i, quantity: Math.min(i.quantity + 1, part.stock || 99) }
              : i
          );
        }
        return [...prev, { product: part as PartsProduct, quantity: 1 }];
      });
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => i.part.id === part.id);
        if (existing) {
          return prev.map((i) => (i.part.id === part.id ? { ...i, quantity: i.quantity + 1 } : i));
        }
        return [...prev, { part, quantity: 1 }];
      });
    }
  }

  function remove(partId: string) {
    setItems((prev) => prev.filter((i) => i.part.id !== partId));
    setProductItems((prev) => prev.filter((i) => i.product.id !== partId));
  }

  function setQty(partId: string, qty: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.part.id === partId ? { ...i, quantity: Math.max(0, qty) } : i))
        .filter((i) => i.quantity > 0)
    );
    setProductItems((prev) =>
      prev
        .map((i) =>
          i.product.id === partId
            ? { ...i, quantity: Math.max(0, Math.min(qty, i.product.stock || 99)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function clear() {
    setItems([]);
    setProductItems([]);
  }

  const count = items.reduce((s, i) => s + i.quantity, 0) + productItems.reduce((s, i) => s + i.quantity, 0);
  const total =
    items.reduce((s, i) => s + i.quantity * Number(i.part.price), 0) +
    productItems.reduce((s, i) => s + i.quantity * Number(i.product.price), 0);

  return (
    <CartContext.Provider value={{ items, productItems, count, total, add, remove, setQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
